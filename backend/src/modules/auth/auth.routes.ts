import { Router } from 'express';
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  updateProfileHandler,
  deleteAccountHandler,
  changePasswordHandler
} from './auth.controller.js';
import { authenticateJwt } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    expectedRole: z.string().optional()
  })
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6)
  })
};

router.post('/login', authLimiter, validate(loginSchema), loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticateJwt, meHandler);
router.put('/profile', authenticateJwt, updateProfileHandler);
router.delete('/account', authenticateJwt, deleteAccountHandler);
router.post(
  '/change-password',
  authenticateJwt,
  validate(changePasswordSchema),
  changePasswordHandler
);

export default router;
