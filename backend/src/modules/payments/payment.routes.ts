import { Router } from 'express';
import {
  recordPaymentHandler,
  verifyPaymentHandler,
  getPaymentsHandler
} from './payment.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getPaymentsHandler);
router.post(
  '/record',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  recordPaymentHandler
);
router.post(
  '/:id/verify',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  verifyPaymentHandler
);

export default router;
