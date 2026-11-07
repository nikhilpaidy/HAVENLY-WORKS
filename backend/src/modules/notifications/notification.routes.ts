import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  broadcastNotificationHandler
} from './notification.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/read-all', markAllNotificationsRead);
router.post('/:id/read', markNotificationRead);
router.post(
  '/broadcast',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  broadcastNotificationHandler
);

export default router;
