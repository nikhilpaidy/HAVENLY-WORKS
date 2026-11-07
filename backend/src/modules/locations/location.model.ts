import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBusinessHours {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IGeoPoint {
  type: string;
  coordinates: [number, number];
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
  geoLocation?: IGeoPoint;
  latitude?: number;
  longitude?: number;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  managerAvatarUrl?: string;
  paymentQrCodeUrl?: string;
  upiId?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  tagline?: string;
  description?: string;
  amenities: string[];
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

const GeoPointSchema = new Schema<IGeoPoint>(
  {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: { type: [Number], required: true }
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
      default: 'Asia/Kolkata'
    },
    businessHours: {
      type: [BusinessHoursSchema],
      default: () => [
        { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '21:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '21:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '21:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '21:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '21:00' },
        { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { dayOfWeek: 0, isOpen: true, openTime: '10:00', closeTime: '17:00' }
      ]
    },
    holidays: [
      {
        date: String,
        name: String
      }
    ],
    geoLocation: {
      type: GeoPointSchema,
      index: '2dsphere'
    },
    latitude: Number,
    longitude: Number,
    managerName: {
      type: String,
      default: 'Olivia Bennett'
    },
    managerPhone: {
      type: String,
      default: '+91 98450 12345'
    },
    managerEmail: {
      type: String,
      default: 'manager@cwsone.com'
    },
    managerAvatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
    },
    paymentQrCodeUrl: {
      type: String,
      default: '/uploads/cws-upi-qr.png'
    },
    upiId: {
      type: String,
      default: 'cwsone@icici'
    },
    images: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 4.9
    },
    reviewCount: {
      type: Number,
      default: 250
    },
    tagline: {
      type: String,
      default: 'Premium Hubbly Coworking & Meeting Destination'
    },
    description: {
      type: String,
      default: 'Designed for professionals, growing teams, and modern creators. Featuring high-speed fiber internet, ergonomic workstations, private phone booths, and artisanal coffee.'
    },
    amenities: {
      type: [String],
      default: ['High-Speed WiFi', 'Parking', 'Printer', 'Phone Booth', 'Coffee Bar', 'Meeting Rooms', '24/7 Access']
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

LocationSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
