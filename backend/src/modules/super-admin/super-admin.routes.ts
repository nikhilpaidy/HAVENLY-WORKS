import { Router } from 'express';
import {
  getAdminsList,
  createAdminUser,
  updateAdminUser,
  toggleUserStatus,
  getAuditLogsHandler,
  getCoworkingSpacesSummaryHandler
} from './super-admin.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(UserRole.SUPER_ADMIN, UserRole.SUPER_ADMIN_STAFF));

router.get('/spaces-summary', getCoworkingSpacesSummaryHandler);
router.get('/admins', getAdminsList);
router.post('/admins', createAdminUser);
router.put('/admins/:id', updateAdminUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/audit-logs', getAuditLogsHandler);

export default router;
