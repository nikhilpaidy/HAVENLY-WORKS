import mongoose, { Document, Schema, Types } from 'mongoose';
import { NotificationType } from '../../types/index.js';

export interface INotification extends Document {
  recipientUserId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: Date;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization'
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: Date,
    link: String,
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

NotificationSchema.index({ recipientUserId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
