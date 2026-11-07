import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWorkspaceType extends Document {
  organizationId?: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  capacityDefault?: number;
  hourlyRateDefault?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceTypeSchema = new Schema<IWorkspaceType>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
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
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: 'Briefcase'
    },
    capacityDefault: {
      type: Number,
      default: 4
    },
    hourlyRateDefault: {
      type: Number,
      default: 500
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

WorkspaceTypeSchema.index({ organizationId: 1, code: 1 });

export const WorkspaceType = mongoose.model<IWorkspaceType>('WorkspaceType', WorkspaceTypeSchema);
