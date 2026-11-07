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
import {
  sendBookingConfirmationEmail,
  sendGuestBookingAdminAlert
} from '../../utils/email.service.js';

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

  const user = await User.findById(bookedByUserId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const slotIntervals = generateSlotTimes(startTime, endTime, room.slotIntervalMinutes);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingNumber = 'BK-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const bookingDocs = await Booking.create(
      [
        {
          bookingNumber,
          organizationId: room.organizationId,
          locationId: room.locationId,
          roomId: room._id,
          companyId: company._id,
          bookedByUserId: user._id,
          isGuestBooking: false,
          workspaceType: room.workspaceType || 'MEETING_ROOM',
          bookingType: 'HOURLY',
          title,
          purpose,
          attendeeCount,
          startTime,
          endTime,
          durationHours: durHours,
          status: BookingStatus.CONFIRMED,
          paymentMethod: 'ALLOWANCE',
          paymentStatus: 'VERIFIED',
          pricingSnapshot: {
            baseHourlyRate: room.hourlyRate,
            freeHoursApplied: entitlement.freeHoursApplied,
            chargeableHours: entitlement.chargeableHours,
            additionalHourlyRate: entitlement.additionalHourlyRate,
            totalAmount: entitlement.totalAmount,
            currency: 'INR'
          }
        }
      ],
      { session }
    );
    const booking = bookingDocs[0];

    for (const slotStart of slotIntervals) {
      const slotEnd = new Date(slotStart.getTime() + room.slotIntervalMinutes * 60 * 1000);
      const existing = await InventorySlot.findOne({
        roomId: room._id,
        startTime: slotStart
      }).session(session);

      if (existing) {
        throw new AppError(
          `Conflict: Slot starting at ${slotStart.toISOString()} is already booked`,
          409
        );
      }

      await InventorySlot.create(
        [
          {
            roomId: room._id,
            bookingId: booking._id,
            startTime: slotStart,
            endTime: slotEnd,
            dateString: slotStart.toISOString().split('T')[0]
          }
        ],
        { session }
      );
    }

    if (entitlement.freeHoursApplied > 0) {
      await reserveAllowance(
        company._id,
        booking._id,
        entitlement.freeHoursApplied,
        startTime,
        session
      );
    }

    await session.commitTransaction();

    await createNotification({
      recipientUserId: user._id,
      organizationId: room.organizationId,
      companyId: company._id,
      title: 'Booking Confirmed',
      message: `Your booking for ${room.name} on ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()} has been confirmed. Ref: #${booking.bookingNumber}`,
      type: NotificationType.BOOKING_CONFIRMED,
      link: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id, roomName: room.name }
    });

    if (user.email) {
      sendBookingConfirmationEmail({
        to: user.email,
        recipientName: user.name,
        bookingNumber: booking.bookingNumber,
        spaceName: room.name,
        workspaceType: room.workspaceType || 'MEETING_ROOM',
        startTime,
        endTime,
        totalAmount: entitlement.totalAmount,
        currency: 'INR',
        isGuest: false
      }).catch(() => {});
    }

    await createAuditLog({
      organizationId: room.organizationId.toString(),
      userId: user._id.toString(),
      userEmail: user.email,
      userRole: user.role,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      ipAddress,
      userAgent,
      details: {
        bookingNumber: booking.bookingNumber,
        roomId: room._id.toString(),
        roomName: room.name,
        freeHoursApplied: entitlement.freeHoursApplied,
        chargeableHours: entitlement.chargeableHours,
        totalAmount: entitlement.totalAmount
      }
    });

    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function createGuestBooking(params: {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingType: 'HOURLY' | 'DAY_PASS';
  startTime: Date;
  endTime: Date;
  attendeeCount?: number;
  paymentMethod?: string;
  paymentReference?: string;
}): Promise<IBooking> {
  const room = await MeetingRoom.findById(params.roomId).populate('locationId');
  if (!room || !room.isActive) {
    throw new AppError('Workspace is inactive or not found', 404);
  }

  const durationHours = Math.max(1, (new Date(params.endTime).getTime() - new Date(params.startTime).getTime()) / (1000 * 60 * 60));
  const rate = params.bookingType === 'DAY_PASS' ? (room.dailyRate || room.hourlyRate * 6) : room.hourlyRate;
  const totalAmount = params.bookingType === 'DAY_PASS' ? rate : Math.round(rate * durationHours);
  const bookingNumber = 'GST-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

  const booking = await Booking.create({
    bookingNumber,
    organizationId: room.organizationId,
    locationId: room.locationId,
    roomId: room._id,
    isGuestBooking: true,
    guestName: params.guestName,
    guestEmail: params.guestEmail,
    guestPhone: params.guestPhone,
    workspaceType: room.workspaceType || 'HOT_DESK',
    bookingType: params.bookingType,
    title: `${params.bookingType === 'DAY_PASS' ? 'Day Pass' : 'Workspace'} Booking - ${params.guestName}`,
    attendeeCount: params.attendeeCount || 1,
    startTime: params.startTime,
    endTime: params.endTime,
    durationHours,
    status: BookingStatus.PENDING_CONFIRMATION,
    paymentMethod: params.paymentMethod || 'UPI_QR',
    paymentStatus: 'PENDING_VERIFICATION',
    paymentReference: params.paymentReference,
    pricingSnapshot: {
      baseHourlyRate: room.hourlyRate,
      freeHoursApplied: 0,
      chargeableHours: durationHours,
      additionalHourlyRate: room.hourlyRate,
      totalAmount,
      currency: 'INR'
    }
  });

  const adminUser = await User.findOne({ organizationId: room.organizationId, role: UserRole.COWORKING_ADMIN });
  if (adminUser) {
    await createNotification({
      recipientUserId: adminUser._id,
      organizationId: room.organizationId,
      title: 'New Guest Booking Received',
      message: `New booking request from ${params.guestName} (${params.guestPhone}) for ${room.name}. Please call and verify payment.`,
      type: NotificationType.GUEST_INQUIRY,
      metadata: { bookingId: booking._id, guestPhone: params.guestPhone }
    });

    sendGuestBookingAdminAlert({
      adminEmail: adminUser.email,
      guestName: params.guestName,
      guestEmail: params.guestEmail,
      guestPhone: params.guestPhone,
      spaceName: room.name,
      workspaceType: room.workspaceType || 'HOT_DESK',
      bookingNumber,
      totalAmount,
      currency: 'INR',
      bookingDate: new Date(params.startTime).toLocaleDateString('en-IN')
    }).catch(() => {});
  }

  if (params.guestEmail) {
    sendBookingConfirmationEmail({
      to: params.guestEmail,
      recipientName: params.guestName,
      bookingNumber,
      spaceName: room.name,
      workspaceType: room.workspaceType || 'HOT_DESK',
      startTime: params.startTime,
      endTime: params.endTime,
      totalAmount,
      currency: 'INR',
      isGuest: true
    }).catch(() => {});
  }

  return booking;
}

export async function confirmGuestBooking(bookingId: string, adminUserId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId).populate('roomId');
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  booking.status = BookingStatus.CONFIRMED;
  booking.paymentStatus = 'VERIFIED';
  await booking.save();

  if (booking.guestEmail) {
    sendBookingConfirmationEmail({
      to: booking.guestEmail,
      recipientName: booking.guestName || 'Guest',
      bookingNumber: booking.bookingNumber,
      spaceName: (booking.roomId as any)?.name || 'Workspace',
      workspaceType: booking.workspaceType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmount: booking.pricingSnapshot.totalAmount,
      currency: 'INR',
      isGuest: true
    }).catch(() => {});
  }

  return booking;
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

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new AppError('Booking is already cancelled', 400);
  }
  if (booking.status === BookingStatus.COMPLETED) {
    throw new AppError('Completed bookings cannot be cancelled', 400);
  }

  if (
    userRole !== UserRole.SUPER_ADMIN &&
    userRole !== UserRole.COWORKING_ADMIN &&
    booking.companyId &&
    booking.companyId.toString() !== userCompanyId
  ) {
    throw new AppError('Unauthorized to cancel this booking', 403);
  }

  await InventorySlot.deleteMany({ bookingId: booking._id });

  if (booking.pricingSnapshot.freeHoursApplied > 0 && booking.companyId) {
    await releaseAllowance(
      booking.companyId,
      booking._id,
      booking.pricingSnapshot.freeHoursApplied,
      booking.startTime
    );
  }

  booking.status = BookingStatus.CANCELLED;
  booking.cancellationReason = reason || 'Cancelled by user';
  booking.cancelledAt = new Date();
  booking.cancelledBy = new Types.ObjectId(userId);
  await booking.save();

  if (booking.bookedByUserId) {
    await createNotification({
      recipientUserId: booking.bookedByUserId,
      organizationId: booking.organizationId,
      companyId: booking.companyId,
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingNumber} was cancelled. Any reserved allowance hours have been restored.`,
      type: NotificationType.BOOKING_CANCELLED
    });
  }

  const user = await User.findById(userId);
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
