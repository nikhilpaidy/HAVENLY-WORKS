import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBusinessHours {
  dayOfWeek: number; 
  isOpen: boolean;
  openTime: string; 
  closeTime: string; 
}

export interface ILocation extends Document {
  organizationId: Types.ObjectId;
  name: string;
  slug: string;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  phone?: string;
  email?: string;
  timezone: string;
  businessHours: IBusinessHours[];
  holidays: Array<{
    date: string; 
    name: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessHoursSchema = new Schema<IBusinessHours>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '08:00' },
    closeTime: { type: String, default: '20:00' }
  },
  { _id: false }
);

const LocationSchema = new Schema<ILocation>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      country: { type: String, required: true },
      postalCode: String
    },
    phone: String,
    email: String,
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    businessHours: {
      type: [BusinessHoursSchema],
      default: () => [
        { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '20:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '20:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '20:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '20:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '20:00' },
        { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00' },
        { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' }
      ]
    },
    holidays: [
      {
        date: String,
        name: String
      }
    ],
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

LocationSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
