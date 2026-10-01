import mongoose, { Document, Schema, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../types/index.js';

export interface IPaymentRecord extends Document {
  receiptNumber: string;
  organizationId: Types.ObjectId;
  companyId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string; 
  paymentDate: Date;
  status: PaymentStatus;
  notes?: string;
  recordedByUserId: Types.ObjectId;
  verifiedByUserId?: Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    receiptNumber: {
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
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true
    },
    paymentReference: {
      type: String,
      trim: true
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.RECORDED,
      index: true
    },
    notes: String,
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    verifiedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  {
    timestamps: true
  }
);

PaymentRecordSchema.index({ organizationId: 1, createdAt: -1 });

export const PaymentRecord = mongoose.model<IPaymentRecord>(
  'PaymentRecord',
  PaymentRecordSchema
);
