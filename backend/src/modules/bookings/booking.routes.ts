import { Router } from 'express';
import {
  createBookingHandler,
  getBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler,
  checkInBookingHandler
} from './booking.controller.js';
import { authenticateJwt } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateJwt);

router.post('/', createBookingHandler);
router.get('/', getBookingsHandler);
router.get('/:id', getBookingByIdHandler);
router.post('/:id/cancel', cancelBookingHandler);
router.post('/:id/check-in', checkInBookingHandler);

export default router;
