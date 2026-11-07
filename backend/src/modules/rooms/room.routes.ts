import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  addMaintenanceBlock,
  getPublicRooms,
  getPublicRoomById,
  addRoomReview,
  getRoomReviews,
  toggleRoomLike
} from './room.controller.js';
import { authenticateJwt, optionalAuthenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.get('/public', optionalAuthenticateJwt, getPublicRooms);
router.get('/public/:id', getPublicRoomById);
router.get('/public/:id/reviews', getRoomReviews);

router.use(authenticateJwt);

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/reviews', getRoomReviews);
router.post('/:id/reviews', addRoomReview);
router.post('/:id/like', toggleRoomLike);
router.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  createRoom
);
router.put(
  '/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  updateRoom
);
router.post(
  '/:id/maintenance',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  addMaintenanceBlock
);

export default router;
