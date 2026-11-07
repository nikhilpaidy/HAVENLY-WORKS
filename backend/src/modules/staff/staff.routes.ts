
import { Router } from 'express';
import {
  createStaffHandler,
  getStaffHandler,
  updateStaffPermissionsHandler,
  resetClientCompanyPasswordHandler
} from './staff.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.post(
  '/',
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.COWORKING_ADMIN,
    UserRole.COMPANY_OWNER
  ),
  createStaffHandler
);

router.get('/', getStaffHandler);

router.patch(
  '/:id/permissions',
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.COWORKING_ADMIN,
    UserRole.COMPANY_OWNER
  ),
  updateStaffPermissionsHandler
);

router.post(
  '/client-reset-password',
  requireRole(
    UserRole.COWORKING_ADMIN,
    UserRole.COWORKING_ADMIN_STAFF
  ),
  resetClientCompanyPasswordHandler
);

export default router;
