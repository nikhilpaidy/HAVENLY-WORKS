import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  addMaintenanceBlock
} from './room.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getRooms);
router.get('/:id', getRoomById);
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
