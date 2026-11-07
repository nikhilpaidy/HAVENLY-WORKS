
import mongoose, { Document, Schema, Types } from 'mongoose';
import { TicketCategory, TicketPriority, TicketStatus } from '../../types/index.js';

export interface ITicketComment {
  authorId: Types.ObjectId;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  organizationId: Types.ObjectId;
  companyId: Types.ObjectId;
  raisedByUserId: Types.ObjectId;
  locationId?: Types.ObjectId;
  ticketNumber: string;
  category: TicketCategory;
  priority: TicketPriority;
  title: string;
  description: string;
  status: TicketStatus;
  resolutionNotes?: string;
  resolvedByUserId?: Types.ObjectId;
  resolvedAt?: Date;
  comments: ITicketComment[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketCommentSchema = new Schema<ITicketComment>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      required: true,
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    raisedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      index: true
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: Object.values(TicketCategory),
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
      index: true
    },
    resolutionNotes: String,
    resolvedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    comments: [TicketCommentSchema]
  },
  {
    timestamps: true
  }
);

TicketSchema.index({ organizationId: 1, status: 1 });
TicketSchema.index({ companyId: 1, status: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
