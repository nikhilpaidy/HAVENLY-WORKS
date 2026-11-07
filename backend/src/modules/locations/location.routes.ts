import { Router } from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  getNearbyLocations,
  getPublicLocations,
  getPublicLocationById,
  uploadPaymentQrHandler
} from './location.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.get('/public', getPublicLocations);
router.get('/nearby', getNearbyLocations);
router.get('/public/:id', getPublicLocationById);

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
router.post(
  '/:id/upload-qr',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  uploadPaymentQrHandler
);

export default router;
