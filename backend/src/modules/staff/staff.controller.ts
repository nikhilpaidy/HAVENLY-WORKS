
import { Request, Response, NextFunction } from 'express';
import {
  createStaffMember,
  getStaffMembers,
  updateStaffPermissions,
  resetClientCompanyPassword
} from './staff.service.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';

export async function createStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { email, name, password, phone, designation, permissions, role } = req.body;

    if (!email || !name || !password) {
      throw new AppError('Email, name, and password are required', 400);
    }

    const staff = await createStaffMember({
      creatorUser: {
        userId: user.userId,
        role: user.role,
        organizationId: user.organizationId,
        companyId: user.companyId
      },
      email,
      name,
      password,
      phone,
      designation,
      role: role || UserRole.COMPANY_STAFF,
      permissions: Array.isArray(permissions) ? permissions : []
    });

    const safeStaff = staff.toObject();
    delete (safeStaff as any).passwordHash;

    return apiSuccess(res, safeStaff, 'Staff member created successfully with assigned permissions', 201);
  } catch (error) {
    next(error);
  }
}

export async function getStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const staffList = await getStaffMembers({
      userId: user.userId,
      role: user.role,
      organizationId: user.organizationId,
      companyId: user.companyId
    });

    return apiSuccess(res, staffList);
  } catch (error) {
    next(error);
  }
}

export async function updateStaffPermissionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { permissions, designation } = req.body;

    if (!Array.isArray(permissions)) {
      throw new AppError('Permissions must be an array of strings', 400);
    }

    const updated = await updateStaffPermissions(id as string, permissions, designation);
    const safeStaff = updated.toObject();
    delete (safeStaff as any).passwordHash;

    return apiSuccess(res, safeStaff, 'Staff permissions updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function resetClientCompanyPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const { companyId, newPassword } = req.body;

    if (user.role !== UserRole.COWORKING_ADMIN && user.role !== UserRole.COWORKING_ADMIN_STAFF) {
      throw new AppError('Only Coworking Space Admins can reset client company passwords', 403);
    }

    if (!companyId || !newPassword) {
      throw new AppError('companyId and newPassword are required', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    await resetClientCompanyPassword({
      coworkingAdminOrgId: user.organizationId!,
      companyId,
      newPassword
    });

    return apiSuccess(res, null, 'Client company password reset successfully');
  } catch (error) {
    next(error);
  }
}
