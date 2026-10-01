/**
 * Ticket Controller.
 * Exposes API routes for raising complaints, fetching ticket lists scoped by tenant,
 * updating status, and adding discussion comments.
 */

import { Request, Response, NextFunction } from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  addTicketComment
} from './ticket.service.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { TicketCategory, TicketPriority, TicketStatus, UserRole } from '../../types/index.js';

export async function createTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { category, priority, title, description, locationId } = req.body;

    if (!category || !title || !description) {
      throw new AppError('Category, title, and description are required', 400);
    }

    if (!user.organizationId || !user.companyId) {
      throw new AppError('User must belong to an organization and company to raise tickets', 400);
    }

    const ticket = await createTicket({
      organizationId: user.organizationId,
      companyId: user.companyId,
      raisedByUserId: user.userId,
      locationId: locationId || undefined,
      category: category as TicketCategory,
      priority: priority as TicketPriority,
      title: title.trim(),
      description: description.trim()
    });

    return apiSuccess(res, ticket, 'Ticket raised successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getTicketsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const filter: any = {};

    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SUPER_ADMIN_STAFF) {
      if (req.query.organizationId) {
        filter.organizationId = req.query.organizationId as string;
      }
    } else if (
      user.role === UserRole.COWORKING_ADMIN ||
      user.role === UserRole.COWORKING_ADMIN_STAFF
    ) {
      filter.organizationId = user.organizationId;
      if (req.query.companyId) {
        filter.companyId = req.query.companyId as string;
      }
    } else {
      filter.companyId = user.companyId;
    }

    if (req.query.status) {
      filter.status = req.query.status as TicketStatus;
    }
    if (req.query.category) {
      filter.category = req.query.category as TicketCategory;
    }

    const tickets = await getTickets(filter);
    return apiSuccess(res, tickets);
  } catch (error) {
    next(error);
  }
}

export async function getTicketByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const ticket = await getTicketById(id as string);
    return apiSuccess(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const user = req.user!;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const ticket = await updateTicketStatus(id as string, {
      status: status as TicketStatus,
      resolutionNotes,
      resolvedByUserId: user.userId
    });

    return apiSuccess(res, ticket, 'Ticket status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function addTicketCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.user!;

    if (!message || !message.trim()) {
      throw new AppError('Message is required', 400);
    }

    const ticket = await addTicketComment(id as string, {
      authorId: user.userId,
      authorName: user.email,
      authorRole: user.role,
      message: message.trim()
    });

    return apiSuccess(res, ticket, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
}
