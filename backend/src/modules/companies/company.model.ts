/**
 * Enterprise Company Model.
 * Represents client companies subscribed to coworking locations.
 * Includes Indian statutory fields (GSTIN, PAN), verification proofs,
 * and customizable monthly or annual complimentary room allowance policies.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICompanyAllowanceConfig {
  allowancePeriodType: 'MONTHLY' | 'ANNUAL';
  monthlyFreeHours: number;
  annualFreeHours?: number;
  additionalHourlyRate: number;
  currency: string;
  rolloverAllowed: boolean;
  billingCycleStartDay: number;
}

export interface ICompany extends Document {
  organizationId: Types.ObjectId;
  locationId?: Types.ObjectId;
  name: string;
  registrationNumber?: string;
  gstin?: string;
  panNumber?: string;
  verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  verificationProofUrl?: string;
  billingEmail: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  allowanceConfig: ICompanyAllowanceConfig;
  status: 'ACTIVE' | 'SUSPENDED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PENDING_REVIEW', 'REJECTED'],
      default: 'VERIFIED',
      index: true
    },
    verificationProofUrl: {
      type: String
    },
    billingEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    allowanceConfig: {
      allowancePeriodType: {
        type: String,
        enum: ['MONTHLY', 'ANNUAL'],
        default: 'ANNUAL'
      },
      monthlyFreeHours: {
        type: Number,
        required: true,
        default: 20,
        min: 0
      },
      annualFreeHours: {
        type: Number,
        default: 240,
        min: 0
      },
      additionalHourlyRate: {
        type: Number,
        required: true,
        default: 800,
        min: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      rolloverAllowed: {
        type: Boolean,
        default: false
      },
      billingCycleStartDay: {
        type: Number,
        default: 1,
        min: 1,
        max: 28
      }
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true
    },
    notes: String
  },
  {
    timestamps: true
  }
);

CompanySchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
