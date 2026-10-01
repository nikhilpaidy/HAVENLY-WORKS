import mongoose, { Document, Schema, Types } from 'mongoose';
import { BookingStatus } from '../../types/index.js';

export interface IPricingSnapshot {
  baseHourlyRate: number; 
  freeHoursApplied: number; 
  chargeableHours: number; 
  additionalHourlyRate: number; 
  totalAmount: number; 
  currency: string;
}

export interface IBooking extends Document {
  bookingNumber: string;
  organizationId: Types.ObjectId;
  locationId: Types.ObjectId;
  roomId: Types.ObjectId;
  companyId: Types.ObjectId;
  bookedByUserId: Types.ObjectId;
  title: string;
  purpose?: string;
  attendeeCount: number;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  status: BookingStatus;
  pricingSnapshot: IPricingSnapshot;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  checkedInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSnapshotSchema = new Schema<IPricingSnapshot>(
  {
    baseHourlyRate: { type: Number, required: true },
    freeHoursApplied: { type: Number, required: true, default: 0 },
    chargeableHours: { type: Number, required: true, default: 0 },
    additionalHourlyRate: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'USD' }
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'MeetingRoom',
      required: true,
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    bookedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    purpose: String,
    attendeeCount: {
      type: Number,
      required: true,
      min: 1
    },
    startTime: {
      type: Date,
      required: true,
      index: true
    },
    endTime: {
      type: Date,
      required: true,
      index: true
    },
    durationHours: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
      index: true
    },
    pricingSnapshot: {
      type: PricingSnapshotSchema,
      required: true
    },
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedInAt: Date
  },
  {
    timestamps: true
  }
);

BookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ companyId: 1, startTime: 1 });
BookingSchema.index({ organizationId: 1, createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
