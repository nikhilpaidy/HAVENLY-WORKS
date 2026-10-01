import { Types } from 'mongoose';
import { MeetingRoom } from '../rooms/room.model.js';
import { InventorySlot } from '../inventory/inventory.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { doIntervalsOverlap } from '../../utils/date.js';

export interface ISlotAvailability {
  startTime: string; 
  endTime: string;
  isAvailable: boolean;
  reason?: 'RESERVED' | 'MAINTENANCE' | 'CLOSED' | null;
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
  const targetDate = new Date(`${dateString}T00:00:00.000Z`);
  const dayOfWeek = targetDate.getUTCDay();

  const daySchedule = location?.businessHours?.find((b: any) => b.dayOfWeek === dayOfWeek);
  const isOpen = daySchedule ? daySchedule.isOpen : true;
  const openTimeStr = daySchedule ? daySchedule.openTime : '08:00';
  const closeTimeStr = daySchedule ? daySchedule.closeTime : '20:00';

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

  const dayStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), openHour, openMin, 0));
  const dayEnd = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), closeHour, closeMin, 0));

  const reservedSlots = await InventorySlot.find({
    roomId: room._id,
    slotTime: { $gte: dayStart, $lt: dayEnd }
  });

  const reservedSlotTimeSet = new Set(
    reservedSlots.map((s) => s.slotTime.getTime())
  );

  const intervalMinutes = room.slotIntervalMinutes || 15;
  const slotMs = intervalMinutes * 60 * 1000;
  const slots: ISlotAvailability[] = [];

  for (let currentMs = dayStart.getTime(); currentMs < dayEnd.getTime(); currentMs += slotMs) {
    const slotStart = new Date(currentMs);
    const slotEnd = new Date(currentMs + slotMs);

    let isAvailable = true;
    let reason: 'RESERVED' | 'MAINTENANCE' | null = null;

    if (reservedSlotTimeSet.has(slotStart.getTime())) {
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
