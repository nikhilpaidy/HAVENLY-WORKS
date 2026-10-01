import { Router } from 'express';
import {
  getCurrentAllowance,
  getAllowanceHistory,
  estimateBookingAllowance,
  adjustAllowanceHandler
} from './allowance.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/current', getCurrentAllowance);
router.get('/history', getAllowanceHistory);
router.post('/estimate', estimateBookingAllowance);
router.post(
  '/adjust',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  adjustAllowanceHandler
);

export default router;
