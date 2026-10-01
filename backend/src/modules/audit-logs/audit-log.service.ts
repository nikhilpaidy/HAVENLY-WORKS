import { AuditLog } from './audit-log.model.js';
import { logger } from '../../utils/logger.js';
import { Types } from 'mongoose';

export async function createAuditLog(params: {
  organizationId?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    await AuditLog.create({
      organizationId: params.organizationId ? new Types.ObjectId(params.organizationId) : undefined,
      userId: new Types.ObjectId(params.userId),
      userEmail: params.userEmail,
      userRole: params.userRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: params.details
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
}
