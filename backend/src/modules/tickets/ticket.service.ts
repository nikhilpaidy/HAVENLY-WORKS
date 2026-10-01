/**
 * Helpdesk & Facility Complaint Ticket Service.
 * Orchestrates ticket creation, hub notification, priority escalation,
 * and status transitions between client teams and coworking staff.
 */

import { Types } from 'mongoose';
import { Ticket, ITicket } from './ticket.model.js';
import { TicketCategory, TicketPriority, TicketStatus, NotificationType } from '../../types/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createNotification } from '../notifications/notification.service.js';
import { User } from '../users/user.model.js';

export async function createTicket(data: {
  organizationId: string | Types.ObjectId;
  companyId: string | Types.ObjectId;
  raisedByUserId: string | Types.ObjectId;
  locationId?: string | Types.ObjectId;
  category: TicketCategory;
  priority?: TicketPriority;
  title: string;
  description: string;
}): Promise<ITicket> {
  const count = await Ticket.countDocuments();
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const ticket = await Ticket.create({
    organizationId: new Types.ObjectId(data.organizationId),
    companyId: new Types.ObjectId(data.companyId),
    raisedByUserId: new Types.ObjectId(data.raisedByUserId),
    locationId: data.locationId ? new Types.ObjectId(data.locationId) : undefined,
    ticketNumber,
    category: data.category,
    priority: data.priority || TicketPriority.MEDIUM,
    title: data.title,
    description: data.description,
    status: TicketStatus.OPEN,
    comments: []
  });

  const admins = await User.find({
    organizationId: new Types.ObjectId(data.organizationId),
    role: { $in: ['COWORKING_ADMIN', 'COWORKING_ADMIN_STAFF'] },
    isActive: true
  });

  for (const admin of admins) {
    await createNotification({
      recipientUserId: admin._id,
      type: NotificationType.TICKET_CREATED,
      title: `New Support Ticket ${ticketNumber}`,
      message: `Priority ${ticket.priority}: "${ticket.title}" filed under ${ticket.category}.`,
      metadata: { ticketId: ticket._id.toString() }
    }).catch(() => {});
  }

  return ticket;
}

export async function getTickets(filter: {
  organizationId?: string | Types.ObjectId;
  companyId?: string | Types.ObjectId;
  status?: TicketStatus;
  category?: TicketCategory;
}): Promise<ITicket[]> {
  const query: any = {};
  if (filter.organizationId) query.organizationId = new Types.ObjectId(filter.organizationId);
  if (filter.companyId) query.companyId = new Types.ObjectId(filter.companyId);
  if (filter.status) query.status = filter.status;
  if (filter.category) query.category = filter.category;

  return Ticket.find(query)
    .populate('companyId', 'name billingEmail phone')
    .populate('raisedByUserId', 'name email')
    .populate('locationId', 'name')
    .sort({ createdAt: -1 });
}

export async function getTicketById(ticketId: string): Promise<ITicket> {
  const ticket = await Ticket.findById(ticketId)
    .populate('companyId', 'name billingEmail phone')
    .populate('raisedByUserId', 'name email phone')
    .populate('locationId', 'name address');

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }
  return ticket;
}

export async function updateTicketStatus(
  ticketId: string,
  data: {
    status: TicketStatus;
    resolutionNotes?: string;
    resolvedByUserId?: string | Types.ObjectId;
  }
): Promise<ITicket> {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.status = data.status;
  if (data.resolutionNotes) {
    ticket.resolutionNotes = data.resolutionNotes;
  }

  if (data.status === TicketStatus.RESOLVED || data.status === TicketStatus.CLOSED) {
    ticket.resolvedAt = new Date();
    if (data.resolvedByUserId) {
      ticket.resolvedByUserId = new Types.ObjectId(data.resolvedByUserId);
    }
  }

  await ticket.save();

  await createNotification({
    recipientUserId: ticket.raisedByUserId,
    type: NotificationType.TICKET_UPDATED,
    title: `Ticket ${ticket.ticketNumber} Updated to ${data.status}`,
    message: data.resolutionNotes
      ? `Resolution: ${data.resolutionNotes}`
      : `Your ticket regarding "${ticket.title}" is now ${data.status.replace(/_/g, ' ')}.`,
    metadata: { ticketId: ticket._id.toString() }
  }).catch(() => {});

  return ticket;
}

export async function addTicketComment(
  ticketId: string,
  commentData: {
    authorId: string | Types.ObjectId;
    authorName: string;
    authorRole: string;
    message: string;
  }
): Promise<ITicket> {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.comments.push({
    authorId: new Types.ObjectId(commentData.authorId),
    authorName: commentData.authorName,
    authorRole: commentData.authorRole,
    message: commentData.message,
    createdAt: new Date()
  });

  await ticket.save();
  return ticket;
}
