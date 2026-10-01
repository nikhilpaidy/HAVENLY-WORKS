/**
 * Emergency Override Routes.
 * Authenticated endpoints for client emergency override requests and admin arbitration.
 */

import { Router } from 'express';
import {
  requestEmergencyOverrideHandler,
  getOverrideRequestsHandler,
  reviewEmergencyOverrideHandler
} from './override.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.post('/request', requestEmergencyOverrideHandler);
router.get('/', getOverrideRequestsHandler);
router.patch(
  '/:id/review',
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.SUPER_ADMIN_STAFF,
    UserRole.COWORKING_ADMIN,
    UserRole.COWORKING_ADMIN_STAFF
  ),
  reviewEmergencyOverrideHandler
);

export default router;
