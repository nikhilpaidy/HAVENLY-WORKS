import mongoose, { Document, Schema } from 'mongoose';

export interface IIssueLog extends Document {
  level: 'ERROR' | 'WARN' | 'INFO';
  method: string;
  path: string;
  statusCode: number;
  message: string;
  stack?: string;
  userEmail?: string;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueLogSchema = new Schema<IIssueLog>(
  {
    level: {
      type: String,
      enum: ['ERROR', 'WARN', 'INFO'],
      default: 'ERROR',
      index: true
    },
    method: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true,
      index: true
    },
    statusCode: {
      type: Number,
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true
    },
    stack: String,
    userEmail: String,
    userId: String,
    userRole: String,
    ip: String,
    userAgent: String,
    resolved: {
      type: Boolean,
      default: false,
      index: true
    },
    resolvedAt: Date,
    resolvedBy: String
  },
  {
    timestamps: true
  }
);

IssueLogSchema.index({ createdAt: -1 });
IssueLogSchema.index({ statusCode: 1, createdAt: -1 });
IssueLogSchema.index({ resolved: 1, createdAt: -1 });

export const IssueLog = mongoose.model<IIssueLog>('IssueLog', IssueLogSchema);