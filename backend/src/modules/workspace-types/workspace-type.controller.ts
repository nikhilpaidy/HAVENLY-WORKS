import { Request, Response, NextFunction } from 'express';
import { WorkspaceType } from './workspace-type.model.js';
import { MeetingRoom } from '../rooms/room.model.js';
import { Company } from '../companies/company.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';

export async function getWorkspaceTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    let locationScopeId: any = null;
    let orgScopeId: any = null;

    if (user?.companyId) {
      const company = await Company.findById(user.companyId).select('locationId organizationId');
      if (company?.locationId) {
        locationScopeId = company.locationId;
      }
      orgScopeId = company?.organizationId || user.organizationId;
    } else if (user?.role === UserRole.COWORKING_ADMIN || user?.role === UserRole.COWORKING_ADMIN_STAFF) {
      orgScopeId = user.organizationId;
    }

    let typeQuery: any = { isActive: true };
    if (orgScopeId) {
      typeQuery = {
        $or: [
          { organizationId: orgScopeId },
          { organizationId: { $exists: false } },
          { organizationId: null }
        ],
        isActive: true
      };
    }

    const types = await WorkspaceType.find(typeQuery).sort({ name: 1 }).lean();

    let roomFilter: any = { isActive: true };
    if (locationScopeId) {
      roomFilter.locationId = locationScopeId;
    } else if (orgScopeId && user?.role !== UserRole.SUPER_ADMIN) {
      roomFilter.organizationId = orgScopeId;
    }

    const rooms = await MeetingRoom.find(roomFilter).select('workspaceType locationId').lean();

    const enriched = types.map((t) => {
      const count = rooms.filter(
        (r) =>
          r.workspaceType === t.code ||
          r.workspaceType?.toLowerCase() === t.name.toLowerCase()
      ).length;

      return {
        ...t,
        roomCount: count,
        scopedLocationId: locationScopeId || undefined
      };
    });

    return apiSuccess(res, enriched);
  } catch (error) {
    next(error);
  }
}

export async function createWorkspaceType(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, code, description, icon, capacityDefault, hourlyRateDefault } = req.body;
    if (!name) {
      throw new AppError('Name is required', 400);
    }

    const finalCode = (code || name).trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const organizationId = req.user?.role === UserRole.SUPER_ADMIN ? undefined : req.user?.organizationId;

    const existing = await WorkspaceType.findOne({
      code: finalCode,
      ...(organizationId ? { organizationId } : {})
    });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.name = name.trim();
        if (description) existing.description = description.trim();
        if (icon) existing.icon = icon;
        await existing.save();
        return apiSuccess(res, existing, 'Workspace type reactivated');
      }
      throw new AppError(`Workspace type with code "${finalCode}" already exists`, 409);
    }

    const type = await WorkspaceType.create({
      organizationId,
      name: name.trim(),
      code: finalCode,
      description: description ? description.trim() : undefined,
      icon: icon || 'Briefcase',
      capacityDefault: capacityDefault ? Number(capacityDefault) : 4,
      hourlyRateDefault: hourlyRateDefault ? Number(hourlyRateDefault) : 500,
      isActive: true
    });

    return apiSuccess(res, type, 'Workspace type created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateWorkspaceType(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, icon, capacityDefault, hourlyRateDefault, isActive } = req.body;

    const type = await WorkspaceType.findById(id);
    if (!type) {
      throw new AppError('Workspace type not found', 404);
    }

    if (name !== undefined) type.name = name.trim();
    if (description !== undefined) type.description = description.trim();
    if (icon !== undefined) type.icon = icon;
    if (capacityDefault !== undefined) type.capacityDefault = Number(capacityDefault);
    if (hourlyRateDefault !== undefined) type.hourlyRateDefault = Number(hourlyRateDefault);
    if (isActive !== undefined) type.isActive = Boolean(isActive);

    await type.save();
    return apiSuccess(res, type, 'Workspace type updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkspaceType(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const type = await WorkspaceType.findById(id);
    if (!type) {
      throw new AppError('Workspace type not found', 404);
    }

    type.isActive = false;
    await type.save();
    return apiSuccess(res, null, 'Workspace type removed successfully');
  } catch (error) {
    next(error);
  }
}
