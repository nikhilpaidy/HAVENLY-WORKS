import { Router } from 'express';
import {
  createBookingHandler,
  getBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler,
  checkInBookingHandler,
  createGuestBookingHandler,
  confirmGuestBookingHandler
} from './booking.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.post('/public/guest', createGuestBookingHandler);

router.use(authenticateJwt);

router.post('/', createBookingHandler);
router.get('/', getBookingsHandler);
router.get('/:id', getBookingByIdHandler);
router.post('/:id/cancel', cancelBookingHandler);
router.post('/:id/check-in', checkInBookingHandler);
router.patch(
  '/:id/confirm-guest',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  confirmGuestBookingHandler
);

export default router;
