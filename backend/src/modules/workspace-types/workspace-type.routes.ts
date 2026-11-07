import { Router } from 'express';
import {
  getWorkspaceTypes,
  createWorkspaceType,
  updateWorkspaceType,
  deleteWorkspaceType
} from './workspace-type.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.get('/public', getWorkspaceTypes);

router.use(authenticateJwt);

router.get('/', getWorkspaceTypes);

router.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  createWorkspaceType
);

router.put(
  '/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  updateWorkspaceType
);

router.delete(
  '/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  deleteWorkspaceType
);

export default router;
