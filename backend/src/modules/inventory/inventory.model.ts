import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInventorySlot extends Document {
  roomId: Types.ObjectId;
  organizationId: Types.ObjectId;
  slotTime: Date;
  bookingId: Types.ObjectId;
  companyId: Types.ObjectId;
  status: 'CONFIRMED' | 'HELD';
  expiresAt?: Date;
  createdAt: Date;
}

const InventorySlotSchema = new Schema<IInventorySlot>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'MeetingRoom',
      required: true,
      index: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    slotTime: {
      type: Date,
      required: true,
      index: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'HELD'],
      default: 'CONFIRMED'
    },
    expiresAt: {
      type: Date,
      index: { expires: '1s' } 
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

InventorySlotSchema.index({ roomId: 1, slotTime: 1 }, { unique: true });

export const InventorySlot = mongoose.model<IInventorySlot>('InventorySlot', InventorySlotSchema);
