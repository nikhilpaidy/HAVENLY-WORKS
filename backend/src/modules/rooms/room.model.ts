import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMaintenanceBlock {
  startTime: Date;
  endTime: Date;
  reason: string;
  createdBy?: Types.ObjectId;
}

export type WorkspaceType = string;

export interface IMeetingRoom extends Document {
  organizationId: Types.ObjectId;
  locationId: Types.ObjectId;
  name: string;
  code: string;
  workspaceType: WorkspaceType;
  description?: string;
  capacity: number;
  hourlyRate: number;
  dailyRate?: number;
  rating: number;
  reviewCount: number;
  saveBadge?: string;
  photos: string[];
  amenities: string[];
  slotIntervalMinutes: number;
  minBookingMinutes: number;
  maxBookingMinutes: number;
  bufferMinutes: number;
  maintenanceBlocks: IMaintenanceBlock[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceBlockSchema = new Schema<IMaintenanceBlock>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reason: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { _id: false }
);

const MeetingRoomSchema = new Schema<IMeetingRoom>(
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
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    workspaceType: {
      type: String,
      required: true,
      trim: true,
      default: 'MEETING_ROOM',
      index: true
    },
    description: String,
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0
    },
    dailyRate: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.9
    },
    reviewCount: {
      type: Number,
      default: 120
    },
    saveBadge: {
      type: String,
      default: 'Save 10%'
    },
    photos: {
      type: [String],
      default: []
    },
    amenities: {
      type: [String],
      default: []
    },
    slotIntervalMinutes: {
      type: Number,
      default: 15,
      enum: [15, 30, 60]
    },
    minBookingMinutes: {
      type: Number,
      default: 30
    },
    maxBookingMinutes: {
      type: Number,
      default: 480
    },
    bufferMinutes: {
      type: Number,
      default: 15
    },
    maintenanceBlocks: {
      type: [MaintenanceBlockSchema],
      default: []
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

MeetingRoomSchema.index({ locationId: 1, code: 1 }, { unique: true });
MeetingRoomSchema.index({ organizationId: 1, capacity: 1 });
MeetingRoomSchema.index({ locationId: 1, workspaceType: 1 });

export const MeetingRoom = mongoose.model<IMeetingRoom>('MeetingRoom', MeetingRoomSchema);
