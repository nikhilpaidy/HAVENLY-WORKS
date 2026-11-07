import { Request, Response, NextFunction } from 'express';
import { Notification } from './notification.model.js';
import { User } from '../users/user.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationType, UserRole } from '../../types/index.js';

export async function getUserNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await Notification.find({
      recipientUserId: req.user!.userId
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return apiSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await Notification.updateOne(
      { _id: id, recipientUserId: req.user!.userId },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return apiSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await Notification.updateMany(
      { recipientUserId: req.user!.userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return apiSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await Notification.countDocuments({
      recipientUserId: req.user!.userId,
      isRead: false
    });

    return apiSuccess(res, { unreadCount: count });
  } catch (error) {
    next(error);
  }
}

export async function broadcastNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, message, type, roleTarget } = req.body;

    if (!title || !message) {
      throw new AppError('title and message are required for broadcast', 400);
    }

    let filter: any = { isActive: true };

    if (req.user?.role !== UserRole.SUPER_ADMIN && req.user?.organizationId) {
      filter.organizationId = req.user.organizationId;
    }
    if (roleTarget) {
      filter.role = roleTarget;
    }

    const recipients = await User.find(filter).select('_id organizationId companyId');

    const notifDocs = recipients.map((u) => ({
      recipientUserId: u._id,
      organizationId: u.organizationId || req.user?.organizationId,
      companyId: u.companyId,
      title,
      message,
      type: type || NotificationType.BROADCAST_ANNOUNCEMENT,
      isRead: false
    }));

    if (notifDocs.length > 0) {
      await Notification.insertMany(notifDocs);
    }

    return apiSuccess(res, { recipientsCount: notifDocs.length }, 'Broadcast notification sent successfully', 201);
  } catch (error) {
    next(error);
  }
}
