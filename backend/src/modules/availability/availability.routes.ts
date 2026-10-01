import { Router } from 'express';
import { getAvailabilityHandler } from './availability.controller.js';
import { authenticateJwt } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateJwt);

router.get('/:roomId', getAvailabilityHandler);

export default router;
