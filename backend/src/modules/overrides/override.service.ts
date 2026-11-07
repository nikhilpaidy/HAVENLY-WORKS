/**
 * Emergency Slot Override Service.
 * Implements arbitration workflows where facility admins can review,
 * approve, or reject urgent room conflicts, with automated slot reallocation and notifications.
 */

import { Types } from 'mongoose';
import { EmergencyOverride, IEmergencyOverride } from './override.model.js';
import { Booking } from '../bookings/booking.model.js';
import { MeetingRoom } from '../rooms/room.model.js';
import { User } from '../users/user.model.js';
import { OverrideRequestStatus, BookingStatus, NotificationType, UserRole } from '../../types/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { cancelBooking, createAtomicBooking } from '../bookings/booking.service.js';
import { createNotification } from '../notifications/notification.service.js';

export async function requestEmergencyOverride(data: {
  organizationId: string | Types.ObjectId;
  roomId: string | Types.ObjectId;
  requestingCompanyId: string | Types.ObjectId;
  requestingUserId: string | Types.ObjectId;
  requestedStartTime: Date | string;
  requestedEndTime: Date | string;
  urgencyReason: string;
  attendeeCount?: number;
}): Promise<IEmergencyOverride> {
  const start = new Date(data.requestedStartTime);
  const end = new Date(data.requestedEndTime);

  const conflictingBooking = await Booking.findOne({
    roomId: new Types.ObjectId(data.roomId),
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },
      { startTime: { $lte: start }, endTime: { $gte: end } }
    ]
  });

  if (!conflictingBooking) {
    throw new AppError(
      'No conflicting reservation found for this slot. You can book this room directly.',
      400
    );
  }

  if (conflictingBooking.companyId && conflictingBooking.companyId.toString() === data.requestingCompanyId.toString()) {
    throw new AppError('This slot is already booked by your own company team.', 400);
  }

  const override = await EmergencyOverride.create({
    organizationId: new Types.ObjectId(data.organizationId),
    roomId: new Types.ObjectId(data.roomId),
    requestingCompanyId: new Types.ObjectId(data.requestingCompanyId),
    requestingUserId: new Types.ObjectId(data.requestingUserId),
    existingBookingId: conflictingBooking._id,
    existingCompanyId: conflictingBooking.companyId,
    requestedStartTime: start,
    requestedEndTime: end,
    urgencyReason: data.urgencyReason.trim(),
    attendeeCount: data.attendeeCount || 4,
    status: OverrideRequestStatus.PENDING
  });

  const admins = await User.find({
    organizationId: new Types.ObjectId(data.organizationId),
    role: { $in: ['COWORKING_ADMIN', 'COWORKING_ADMIN_STAFF'] },
    isActive: true
  });

  const room = await MeetingRoom.findById(data.roomId);
  for (const admin of admins) {
    await createNotification({
      recipientUserId: admin._id,
      type: NotificationType.OVERRIDE_REQUESTED,
      title: 'Emergency Slot Override Request',
      message: `An urgent override request was submitted for ${room?.name || 'Meeting Room'} from ${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
      metadata: { conflictingBookingId: conflictingBooking._id.toString() }
    }).catch(() => {});
  }

  return override;
}

export async function getOverrideRequests(filter: {
  organizationId?: string | Types.ObjectId;
  requestingCompanyId?: string | Types.ObjectId;
  status?: OverrideRequestStatus;
}): Promise<IEmergencyOverride[]> {
  const query: any = {};
  if (filter.organizationId) query.organizationId = new Types.ObjectId(filter.organizationId);
  if (filter.requestingCompanyId) query.requestingCompanyId = new Types.ObjectId(filter.requestingCompanyId);
  if (filter.status) query.status = filter.status;

  return EmergencyOverride.find(query)
    .populate('roomId', 'name code photos')
    .populate('requestingCompanyId', 'name billingEmail')
    .populate('requestingUserId', 'name email phone')
    .populate('existingCompanyId', 'name billingEmail')
    .populate('existingBookingId', 'bookingNumber title startTime endTime')
    .sort({ createdAt: -1 });
}

export async function reviewEmergencyOverride(
  overrideId: string,
  data: {
    status: OverrideRequestStatus.APPROVED | OverrideRequestStatus.REJECTED;
    adminReviewNotes?: string;
    reviewedByUserId: string | Types.ObjectId;
  }
): Promise<IEmergencyOverride> {
  const override = await EmergencyOverride.findById(overrideId)
    .populate('roomId')
    .populate('requestingCompanyId')
    .populate('existingCompanyId');

  if (!override) {
    throw new AppError('Override request not found', 404);
  }

  if (override.status !== OverrideRequestStatus.PENDING) {
    throw new AppError(`Request has already been reviewed (${override.status})`, 400);
  }

  override.status = data.status;
  override.adminReviewNotes = data.adminReviewNotes || '';
  override.reviewedByUserId = new Types.ObjectId(data.reviewedByUserId);
  override.reviewedAt = new Date();

  if (data.status === OverrideRequestStatus.APPROVED) {
    const existing = await Booking.findById(override.existingBookingId);
    if (existing && existing.status !== BookingStatus.CANCELLED) {
      await cancelBooking({
        bookingId: existing._id.toString(),
        userId: data.reviewedByUserId.toString(),
        userRole: UserRole.COWORKING_ADMIN,
        reason: `Displaced by Coworking Facility Management due to approved Emergency Corporate Request: ${override.urgencyReason}`
      });
      override.displacedBookingId = existing._id;
    }

    const newBooking = await createAtomicBooking({
      roomId: override.roomId._id.toString(),
      companyId: override.requestingCompanyId._id.toString(),
      bookedByUserId: override.requestingUserId.toString(),
      title: `[EMERGENCY OVERRIDE] ${override.urgencyReason.slice(0, 40)}`,
      purpose: override.urgencyReason,
      attendeeCount: override.attendeeCount,
      startTime: override.requestedStartTime,
      endTime: override.requestedEndTime
    });

    await createNotification({
      recipientUserId: override.requestingUserId,
      type: NotificationType.OVERRIDE_APPROVED,
      title: 'Emergency Slot Override Approved!',
      message: `Your emergency request for ${(override.roomId as any)?.name} has been approved. Booking number: ${newBooking.bookingNumber}.`,
      metadata: { bookingId: newBooking._id.toString() }
    }).catch(() => {});

    if (existing && existing.bookedByUserId) {
      await createNotification({
        recipientUserId: existing.bookedByUserId,
        type: NotificationType.BOOKING_CANCELLED,
        title: 'Booking Rescheduled Due to Facility Emergency',
        message: `Your booking ${existing.bookingNumber} was displaced due to an urgent facility emergency override. All quota hours have been credited back.`,
        metadata: { bookingId: existing._id.toString() }
      }).catch(() => {});
    }
  } else {
    await createNotification({
      recipientUserId: override.requestingUserId,
      type: NotificationType.OVERRIDE_REJECTED,
      title: 'Emergency Slot Override Declined',
      message: data.adminReviewNotes
        ? `Reason: ${data.adminReviewNotes}`
        : 'Your emergency override request could not be accommodated at this time.',
      metadata: { bookingId: override.existingBookingId.toString() }
    }).catch(() => {});
  }

  await override.save();
  return override;
}
