import { Router } from 'express';
import {
  getSuperAdminStatsHandler,
  getAdminStatsHandler,
  getCompanyStatsHandler
} from './report.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/super-admin', requireRole(UserRole.SUPER_ADMIN), getSuperAdminStatsHandler);
router.get(
  '/admin',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  getAdminStatsHandler
);
router.get('/company', getCompanyStatsHandler);

export default router;
