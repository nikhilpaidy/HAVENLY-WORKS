import { Request, Response, NextFunction } from 'express';
import { CoworkingOrganization } from './organization.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';

export async function getOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = {};
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      query._id = req.user?.organizationId;
    }

    const organizations = await CoworkingOrganization.find(query).sort({ createdAt: -1 });
    return apiSuccess(res, organizations);
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (req.user?.role !== UserRole.SUPER_ADMIN && req.user?.organizationId !== id) {
      throw new AppError('Unauthorized access to this organization', 403);
    }

    const org = await CoworkingOrganization.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return apiSuccess(res, org);
  } catch (error) {
    next(error);
  }
}

export async function createOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await CoworkingOrganization.create(req.body);

    await createAuditLog({
      organizationId: org._id.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'ORGANIZATION_CREATED',
      entityType: 'CoworkingOrganization',
      entityId: org._id.toString(),
      details: { name: org.name, slug: org.slug }
    });

    return apiSuccess(res, org, 'Organization created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (req.user?.role !== UserRole.SUPER_ADMIN && req.user?.organizationId !== id) {
      throw new AppError('Unauthorized access to update this organization', 403);
    }

    const updated = await CoworkingOrganization.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      throw new AppError('Organization not found', 404);
    }

    await createAuditLog({
      organizationId: id,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'CoworkingOrganization',
      entityId: id,
      details: req.body
    });

    return apiSuccess(res, updated, 'Organization updated successfully');
  } catch (error) {
    next(error);
  }
}
