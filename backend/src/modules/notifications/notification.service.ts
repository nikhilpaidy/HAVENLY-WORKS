import { Notification } from './notification.model.js';
import { NotificationType } from '../../types/index.js';
import { logger } from '../../utils/logger.js';
import { Types } from 'mongoose';

export async function createNotification(params: {
  recipientUserId: string | Types.ObjectId;
  organizationId?: string | Types.ObjectId;
  companyId?: string | Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await Notification.create({
      recipientUserId: new Types.ObjectId(params.recipientUserId),
      organizationId: params.organizationId ? new Types.ObjectId(params.organizationId) : undefined,
      companyId: params.companyId ? new Types.ObjectId(params.companyId) : undefined,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      metadata: params.metadata
    });
  } catch (error) {
    logger.error('Failed to create in-app notification:', error);
  }
}
