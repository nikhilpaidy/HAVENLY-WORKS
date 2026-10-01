import { Router } from 'express';
import {
  getPublicBlogsHandler,
  getPublicBlogBySlugHandler,
  getAdminBlogsHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
  uploadBlogImageHandler
} from './blog.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.get('/', getPublicBlogsHandler);
router.get('/slug/:slug', getPublicBlogBySlugHandler);

router.get('/admin', authenticateJwt, requireRole(UserRole.SUPER_ADMIN), getAdminBlogsHandler);
router.post('/admin', authenticateJwt, requireRole(UserRole.SUPER_ADMIN), createBlogHandler);
router.post('/admin/upload', authenticateJwt, requireRole(UserRole.SUPER_ADMIN), uploadBlogImageHandler);
router.put('/admin/:id', authenticateJwt, requireRole(UserRole.SUPER_ADMIN), updateBlogHandler);
router.delete('/admin/:id', authenticateJwt, requireRole(UserRole.SUPER_ADMIN), deleteBlogHandler);

export default router;
