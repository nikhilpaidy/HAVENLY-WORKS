import { Router } from 'express';
import {
  getIssueLogs,
  getMonitoringStats,
  resolveIssueLog,
  clearAllIssueLogs
} from './issue-log.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(UserRole.SUPER_ADMIN));

router.get('/issues', getIssueLogs);
router.get('/stats', getMonitoringStats);
router.patch('/issues/:id/resolve', resolveIssueLog);
router.delete('/issues/clear', clearAllIssueLogs);

export default router;