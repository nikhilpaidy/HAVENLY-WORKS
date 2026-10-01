import { Router } from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation
} from './location.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getLocations);
router.get('/:id', getLocationById);
router.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  createLocation
);
router.put(
  '/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  updateLocation
);

export default router;
