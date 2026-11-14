import { Types } from 'mongoose';
import { MeetingRoom } from '../rooms/room.model.js';
import { InventorySlot } from '../inventory/inventory.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { doIntervalsOverlap } from '../../utils/date.js';

export interface ISlotAvailability {
  startTime: string; 
  endTime: string;
  isAvailable: boolean;
  available: boolean;
  reason?: 'RESERVED' | 'MAINTENANCE' | 'CLOSED' | 'PAST' | null;
}

export async function getRoomAvailabilityForDate(
  roomId: string | Types.ObjectId,
  dateString: string 
): Promise<{
  roomId: string;
  date: string;
  operatingHours: { open: string; close: string; isOpen: boolean };
  slots: ISlotAvailability[];
}> {
  const room = await MeetingRoom.findById(roomId).populate('locationId');
  if (!room || !room.isActive) {
    throw new AppError('Meeting room not found or inactive', 404);
  }

  const location: any = room.locationId;
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDateMiddayUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = targetDateMiddayUtc.getUTCDay();

  const daySchedule = location?.businessHours?.find((b: any) => b.dayOfWeek === dayOfWeek);
  const isOpen = daySchedule ? daySchedule.isOpen : true;
  const openTimeStr = (daySchedule && daySchedule.openTime) ? daySchedule.openTime : '08:00';
  const closeTimeStr = (daySchedule && daySchedule.closeTime) ? daySchedule.closeTime : '20:00';

  if (!isOpen) {
    return {
      roomId: room._id.toString(),
      date: dateString,
      operatingHours: { open: openTimeStr, close: closeTimeStr, isOpen: false },
      slots: []
    };
  }

  const [openHour, openMin] = openTimeStr.split(':').map(Number);
  const [closeHour, closeMin] = closeTimeStr.split(':').map(Number);

  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const dayStartMs = Date.UTC(year, month - 1, day, openHour, openMin, 0) - istOffsetMs;
  const dayEndMs = Date.UTC(year, month - 1, day, closeHour, closeMin, 0) - istOffsetMs;

  const dayStart = new Date(dayStartMs);
  const dayEnd = new Date(dayEndMs);

  const reservedSlots = await InventorySlot.find({
    roomId: room._id,
    slotTime: { $gte: dayStart, $lt: dayEnd }
  });

  const reservedSlotTimeSet = new Set(
    reservedSlots.map((s) => s.slotTime.getTime())
  );

  const intervalMinutes = room.slotIntervalMinutes || 30;
  const slotMs = intervalMinutes * 60 * 1000;
  const slots: ISlotAvailability[] = [];
  const now = Date.now();

  for (let currentMs = dayStart.getTime(); currentMs < dayEnd.getTime(); currentMs += slotMs) {
    const slotStart = new Date(currentMs);
    const slotEnd = new Date(currentMs + slotMs);

    let isAvailable = true;
    let reason: 'RESERVED' | 'MAINTENANCE' | 'PAST' | null = null;

    if (slotStart.getTime() < now) {
      isAvailable = false;
      reason = 'PAST';
    } else if (reservedSlotTimeSet.has(slotStart.getTime())) {
      isAvailable = false;
      reason = 'RESERVED';
    }

    if (isAvailable && room.maintenanceBlocks) {
      for (const block of room.maintenanceBlocks) {
        if (doIntervalsOverlap(slotStart, slotEnd, block.startTime, block.endTime)) {
          isAvailable = false;
          reason = 'MAINTENANCE';
          break;
        }
      }
    }

    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      isAvailable,
      available: isAvailable,
      reason
    });
  }

  return {
    roomId: room._id.toString(),
    date: dateString,
    operatingHours: { open: openTimeStr, close: closeTimeStr, isOpen: true },
    slots
  };
}
