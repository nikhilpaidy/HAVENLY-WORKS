import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  getCompanyMembers,
  addCompanyMember
} from './company.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  createCompany
);
router.put(
  '/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  updateCompany
);
router.get('/:id/members', getCompanyMembers);
router.post('/:id/members', addCompanyMember);

export default router;
