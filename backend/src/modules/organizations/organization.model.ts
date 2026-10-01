import mongoose, { Document, Schema } from 'mongoose';

export interface ICoworkingOrganization extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  currency: string; 
  timezone: string; 
  settings: {
    allowOverdraft: boolean;
    requireBookingApproval: boolean;
    cancellationNoticeHours: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoworkingOrganizationSchema = new Schema<ICoworkingOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    logoUrl: String,
    website: String,
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      country: { type: String, required: true },
      postalCode: String
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    settings: {
      allowOverdraft: { type: Boolean, default: false },
      requireBookingApproval: { type: Boolean, default: false },
      cancellationNoticeHours: { type: Number, default: 2 }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const CoworkingOrganization = mongoose.model<ICoworkingOrganization>(
  'CoworkingOrganization',
  CoworkingOrganizationSchema
);
