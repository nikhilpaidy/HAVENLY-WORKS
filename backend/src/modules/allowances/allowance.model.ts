import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAllowancePeriod extends Document {
  companyId: Types.ObjectId;
  organizationId: Types.ObjectId;
  periodYear: number;
  periodMonth: number; 
  periodStart: Date;
  periodEnd: Date;
  grantedHours: number; 
  consumedHours: number; 
  reservedHours: number; 
  balanceHours: number; 
  createdAt: Date;
  updatedAt: Date;
}

const AllowancePeriodSchema = new Schema<IAllowancePeriod>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    periodYear: {
      type: Number,
      required: true
    },
    periodMonth: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 12
    },
    periodStart: {
      type: Date,
      required: true
    },
    periodEnd: {
      type: Date,
      required: true
    },
    grantedHours: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    consumedHours: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    reservedHours: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    balanceHours: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

AllowancePeriodSchema.index(
  { companyId: 1, periodYear: 1, periodMonth: 1 },
  { unique: true }
);

export const AllowancePeriod = mongoose.model<IAllowancePeriod>(
  'AllowancePeriod',
  AllowancePeriodSchema
);

export type AllowanceChangeType = 'GRANT' | 'RESERVE' | 'CONSUME' | 'RELEASE' | 'ADJUSTMENT';

export interface IAllowanceLedgerEntry extends Document {
  companyId: Types.ObjectId;
  organizationId: Types.ObjectId;
  allowancePeriodId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  changeType: AllowanceChangeType;
  hours: number;
  balanceAfter: number;
  notes: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

const AllowanceLedgerEntrySchema = new Schema<IAllowanceLedgerEntry>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    allowancePeriodId: {
      type: Schema.Types.ObjectId,
      ref: 'AllowancePeriod',
      required: true,
      index: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true
    },
    changeType: {
      type: String,
      enum: ['GRANT', 'RESERVE', 'CONSUME', 'RELEASE', 'ADJUSTMENT'],
      required: true
    },
    hours: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AllowanceLedgerEntrySchema.index({ companyId: 1, createdAt: -1 });

export const AllowanceLedgerEntry = mongoose.model<IAllowanceLedgerEntry>(
  'AllowanceLedgerEntry',
  AllowanceLedgerEntrySchema
);
