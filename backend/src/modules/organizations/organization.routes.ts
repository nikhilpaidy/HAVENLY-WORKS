import { Router } from 'express';
import {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization
} from './organization.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.post('/', requireRole(UserRole.SUPER_ADMIN), createOrganization);
router.put('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN), updateOrganization);

export default router;
