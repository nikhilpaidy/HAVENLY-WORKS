import mongoose, { Types } from 'mongoose';
import { Booking, IBooking } from './booking.model.js';
import { MeetingRoom } from '../rooms/room.model.js';
import { Company } from '../companies/company.model.js';
import { InventorySlot } from '../inventory/inventory.model.js';
import { User } from '../users/user.model.js';
import {
  calculateEntitlement,
  reserveAllowance,
  releaseAllowance
} from '../allowances/allowance.service.js';
import {
  generateSlotTimes,
  doIntervalsOverlap,
  durationInHours
} from '../../utils/date.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, NotificationType, UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';
import { createNotification } from '../notifications/notification.service.js';

export async function createAtomicBooking(params: {
  roomId: string;
  companyId: string;
  bookedByUserId: string;
  title: string;
  purpose?: string;
  attendeeCount: number;
  startTime: Date;
  endTime: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<IBooking> {
  const {
    roomId,
    companyId,
    bookedByUserId,
    title,
    purpose,
    attendeeCount,
    startTime,
    endTime,
    ipAddress,
    userAgent
  } = params;

  if (endTime.getTime() <= startTime.getTime()) {
    throw new AppError('End time must be strictly after start time', 400);
  }

  const durationMins = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

  const room = await MeetingRoom.findById(roomId).populate('locationId');
  if (!room || !room.isActive) {
    throw new AppError('Meeting room is inactive or not found', 404);
  }

  if (attendeeCount > room.capacity) {
    throw new AppError(
      `Attendee count (${attendeeCount}) exceeds room capacity of ${room.capacity}`,
      400
    );
  }

  if (durationMins < room.minBookingMinutes) {
    throw new AppError(
      `Minimum booking duration for ${room.name} is ${room.minBookingMinutes} minutes`,
      400
    );
  }
  if (durationMins > room.maxBookingMinutes) {
    throw new AppError(
      `Maximum booking duration for ${room.name} is ${room.maxBookingMinutes} minutes`,
      400
    );
  }

  if (durationMins % room.slotIntervalMinutes !== 0) {
    throw new AppError(
      `Booking duration must be an increment of ${room.slotIntervalMinutes} minutes`,
      400
    );
  }

  for (const block of room.maintenanceBlocks) {
    if (doIntervalsOverlap(startTime, endTime, block.startTime, block.endTime)) {
      throw new AppError(
        `Room is closed for maintenance (${block.reason}) during the requested period`,
        409
      );
    }
  }

  const company = await Company.findById(companyId);
  if (!company || company.status !== 'ACTIVE') {
    throw new AppError('Company account is suspended or inactive. Bookings prohibited.', 403);
  }

  const durHours = durationInHours(startTime, endTime);
  const entitlement = await calculateEntitlement(companyId, durHours, startTime);

  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const bookingNumber = `BK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${timestamp}${randomSuffix}`;

  const slotDates = generateSlotTimes(
    startTime,
    endTime,
    room.slotIntervalMinutes,
    room.bufferMinutes
  );

  let session: mongoose.ClientSession | null = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    
    session = null;
    useTransaction = false;
  }

  let createdBooking: IBooking;

  try {
    
    const existingConflicts = await InventorySlot.find({
      roomId: room._id,
      slotTime: { $in: slotDates }
    }).session(session);

    if (existingConflicts.length > 0) {
      throw new AppError(
        'The requested time slot is already reserved. Please select another time.',
        409
      );
    }

    const [bookingDoc] = await Booking.create(
      [
        {
          bookingNumber,
          organizationId: room.organizationId,
          locationId: room.locationId,
          roomId: room._id,
          companyId: company._id,
          bookedByUserId: new Types.ObjectId(bookedByUserId),
          title,
          purpose,
          attendeeCount,
          startTime,
          endTime,
          durationHours: durHours,
          status: BookingStatus.CONFIRMED,
          pricingSnapshot: {
            baseHourlyRate: room.hourlyRate,
            freeHoursApplied: entitlement.freeHoursApplied,
            chargeableHours: entitlement.chargeableHours,
            additionalHourlyRate: entitlement.additionalHourlyRate,
            totalAmount: entitlement.totalAmount,
            currency: entitlement.currency
          }
        }
      ],
      { session }
    );

    createdBooking = bookingDoc;

    const inventoryDocs = slotDates.map((slotTime) => ({
      roomId: room._id,
      organizationId: room.organizationId,
      slotTime,
      bookingId: bookingDoc._id,
      companyId: company._id,
      status: 'CONFIRMED'
    }));

    await InventorySlot.insertMany(inventoryDocs, { session });

    await reserveAllowance(
      company._id,
      bookingDoc._id,
      entitlement.freeHoursApplied,
      startTime,
      session || undefined,
      bookingDoc.bookingNumber,
      room.name
    );

    if (useTransaction && session) {
      await session.commitTransaction();
    }
  } catch (error: any) {
    if (useTransaction && session) {
      await session.abortTransaction();
    } else {
      
      if (createdBooking!) {
        await InventorySlot.deleteMany({ bookingId: createdBooking._id });
        await Booking.findByIdAndDelete(createdBooking._id);
      }
    }

    if (
      error.code === 11000 ||
      error.name === 'MongoBulkWriteError' ||
      error.message?.includes('multi-document transaction') ||
      error.message?.includes('WriteConflict') ||
      (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError'))
    ) {
      throw new AppError(
        'Concurrent booking conflict: This room slot was just booked by another user.',
        409
      );
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  const booker = await User.findById(bookedByUserId);

  await createNotification({
    recipientUserId: bookedByUserId,
    organizationId: room.organizationId,
    companyId: company._id,
    title: 'Booking Confirmed',
    message: `Your reservation for "${room.name}" on ${startTime.toDateString()} at ${startTime.toLocaleTimeString()} has been confirmed (${bookingNumber}).`,
    type: NotificationType.BOOKING_CONFIRMED,
    link: `/client/bookings`
  });

  await createAuditLog({
    organizationId: room.organizationId.toString(),
    userId: bookedByUserId,
    userEmail: booker?.email || 'user',
    userRole: booker?.role || 'CLIENT',
    action: 'BOOKING_CREATED',
    entityType: 'Booking',
    entityId: createdBooking._id.toString(),
    ipAddress,
    userAgent,
    details: {
      bookingNumber,
      room: room.name,
      durationHours: durHours,
      freeHoursApplied: entitlement.freeHoursApplied,
      chargeableHours: entitlement.chargeableHours,
      totalAmount: entitlement.totalAmount
    }
  });

  return createdBooking;
}

export async function cancelBooking(params: {
  bookingId: string;
  userId: string;
  userRole: UserRole;
  userCompanyId?: string;
  reason?: string;
  ipAddress?: string;
}): Promise<IBooking> {
  const { bookingId, userId, userRole, userCompanyId, reason, ipAddress } = params;

  const booking = await Booking.findById(bookingId).populate('roomId');
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new AppError('Booking is already cancelled', 400);
  }

  if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.COWORKING_ADMIN) {
    if (booking.companyId.toString() !== userCompanyId) {
      throw new AppError('Unauthorized: You cannot cancel bookings for another company', 403);
    }
  }

  await InventorySlot.deleteMany({ bookingId: booking._id });

  if (booking.pricingSnapshot.freeHoursApplied > 0) {
    await releaseAllowance(
      booking.companyId,
      booking._id,
      booking.pricingSnapshot.freeHoursApplied,
      booking.startTime,
      booking.status === BookingStatus.COMPLETED,
      undefined,
      booking.bookingNumber
    );
  }

  booking.status = BookingStatus.CANCELLED;
  booking.cancellationReason = reason || 'Cancelled by user';
  booking.cancelledAt = new Date();
  booking.cancelledBy = new Types.ObjectId(userId);
  await booking.save();

  const user = await User.findById(userId);
  await createNotification({
    recipientUserId: booking.bookedByUserId,
    organizationId: booking.organizationId,
    companyId: booking.companyId,
    title: 'Booking Cancelled',
    message: `Booking ${booking.bookingNumber} was cancelled. Any reserved allowance hours have been restored.`,
    type: NotificationType.BOOKING_CANCELLED
  });

  await createAuditLog({
    organizationId: booking.organizationId.toString(),
    userId,
    userEmail: user?.email || 'user',
    userRole,
    action: 'BOOKING_CANCELLED',
    entityType: 'Booking',
    entityId: booking._id.toString(),
    ipAddress,
    details: { reason, freeHoursRestored: booking.pricingSnapshot.freeHoursApplied }
  });

  return booking;
}

export async function checkInBooking(bookingId: string, userId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new AppError(`Cannot check in booking with status: ${booking.status}`, 400);
  }

  booking.status = BookingStatus.CHECKED_IN;
  booking.checkedInAt = new Date();
  await booking.save();

  return booking;
}
