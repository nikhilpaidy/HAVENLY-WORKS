import { Router } from 'express';
import {
  createTicketHandler,
  getTicketsHandler,
  getTicketByIdHandler,
  updateTicketStatusHandler,
  addTicketCommentHandler,
  clearTicketCommentsHandler
} from './ticket.controller.js';
import { authenticateJwt } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateJwt);

router.post('/', createTicketHandler);
router.get('/', getTicketsHandler);
router.get('/:id', getTicketByIdHandler);
router.patch('/:id/status', updateTicketStatusHandler);
router.post('/:id/comments', addTicketCommentHandler);
router.delete('/:id/comments', clearTicketCommentsHandler);

export default router;
