
import mongoose, { Document, Schema, Types } from 'mongoose';
import { OverrideRequestStatus } from '../../types/index.js';

export interface IEmergencyOverride extends Document {
  organizationId: Types.ObjectId;
  roomId: Types.ObjectId;
  requestingCompanyId: Types.ObjectId;
  requestingUserId: Types.ObjectId;
  existingBookingId: Types.ObjectId;
  existingCompanyId: Types.ObjectId;
  requestedStartTime: Date;
  requestedEndTime: Date;
  urgencyReason: string;
  attendeeCount: number;
  status: OverrideRequestStatus;
  adminReviewNotes?: string;
  reviewedByUserId?: Types.ObjectId;
  reviewedAt?: Date;
  displacedBookingId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyOverrideSchema = new Schema<IEmergencyOverride>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'MeetingRoom',
      required: true,
      index: true
    },
    requestingCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    requestingUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    existingBookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    existingCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    requestedStartTime: {
      type: Date,
      required: true
    },
    requestedEndTime: {
      type: Date,
      required: true
    },
    urgencyReason: {
      type: String,
      required: true,
      trim: true
    },
    attendeeCount: {
      type: Number,
      required: true,
      default: 4
    },
    status: {
      type: String,
      enum: Object.values(OverrideRequestStatus),
      default: OverrideRequestStatus.PENDING,
      index: true
    },
    adminReviewNotes: String,
    reviewedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    displacedBookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  {
    timestamps: true
  }
);

EmergencyOverrideSchema.index({ organizationId: 1, status: 1 });
EmergencyOverrideSchema.index({ requestingCompanyId: 1, status: 1 });

export const EmergencyOverride = mongoose.model<IEmergencyOverride>(
  'EmergencyOverride',
  EmergencyOverrideSchema
);
