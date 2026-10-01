import { Request, Response, NextFunction } from 'express';
import { Location } from './location.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';

export async function getLocations(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = {};
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      query.organizationId = req.user?.organizationId;
    } else if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    const locations = await Location.find(query).sort({ name: 1 });
    return apiSuccess(res, locations);
  } catch (error) {
    next(error);
  }
}

export async function getLocationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      location.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to this location', 403);
    }

    return apiSuccess(res, location);
  } catch (error) {
    next(error);
  }
}

export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId =
      req.user?.role === UserRole.SUPER_ADMIN && req.body.organizationId
        ? req.body.organizationId
        : req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }

    const location = await Location.create({
      ...req.body,
      organizationId
    });

    await createAuditLog({
      organizationId,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'LOCATION_CREATED',
      entityType: 'Location',
      entityId: location._id.toString(),
      details: { name: location.name, slug: location.slug }
    });

    return apiSuccess(res, location, 'Location created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const location = await Location.findById(id);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      location.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to update this location', 403);
    }

    const updated = await Location.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    await createAuditLog({
      organizationId: location.organizationId.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'LOCATION_UPDATED',
      entityType: 'Location',
      entityId: id,
      details: req.body
    });

    return apiSuccess(res, updated, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
}
