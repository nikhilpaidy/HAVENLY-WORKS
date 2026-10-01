import { Router } from 'express';
import {
  getInvoicesHandler,
  getInvoiceByIdHandler,
  generateInvoiceHandler
} from './billing.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getInvoicesHandler);
router.get('/invoices', getInvoicesHandler);
router.get('/:id', getInvoiceByIdHandler);
router.post(
  '/generate',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  generateInvoiceHandler
);

export default router;
