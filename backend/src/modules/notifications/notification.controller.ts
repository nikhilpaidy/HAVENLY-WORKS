import { Request, Response, NextFunction } from 'express';
import { Notification } from './notification.model.js';
import { apiSuccess } from '../../utils/response.js';

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
