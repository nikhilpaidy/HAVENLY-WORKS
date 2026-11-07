import { Request, Response, NextFunction } from 'express';
import { Company } from './company.model.js';
import { User } from '../users/user.model.js';
import { AllowancePeriod } from '../allowances/allowance.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';
import { getBillingPeriod } from '../../utils/date.js';
import { sendClientWelcomeEmail } from '../../utils/email.service.js';
import bcrypt from 'bcryptjs';

export async function getCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = {};
    if (req.user?.role === UserRole.SUPER_ADMIN) {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else if (req.user?.role === UserRole.COWORKING_ADMIN) {
      query.organizationId = req.user.organizationId;
    } else {
      
      query._id = req.user?.companyId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const companies = await Company.find(query).sort({ name: 1 });
    return apiSuccess(res, companies);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      req.user?.role !== UserRole.COWORKING_ADMIN &&
      req.user?.companyId !== id
    ) {
      throw new AppError('Unauthorized access to this company', 403);
    }

    const isAnnual = company.allowanceConfig?.allowancePeriodType !== 'MONTHLY';
    const periodYear = new Date().getFullYear();
    const periodMonth = isAnnual ? 0 : new Date().getMonth() + 1;
    const allowance = await AllowancePeriod.findOne({
      companyId: company._id,
      periodYear,
      periodMonth
    });

    const defaultHours = isAnnual
      ? (company.allowanceConfig?.annualFreeHours || 240)
      : (company.allowanceConfig?.monthlyFreeHours || 20);

    return apiSuccess(res, {
      company,
      currentAllowance: allowance || {
        grantedHours: defaultHours,
        consumedHours: 0,
        reservedHours: 0,
        balanceHours: defaultHours
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId =
      req.user?.role === UserRole.SUPER_ADMIN && req.body.organizationId
        ? req.body.organizationId
        : req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }

    const { ownerEmail, ownerName, ownerPassword, ...companyData } = req.body;

    const company = await Company.create({
      ...companyData,
      organizationId
    });

    const isAnnual = company.allowanceConfig?.allowancePeriodType !== 'MONTHLY';
    const periodYear = new Date().getFullYear();
    const periodMonth = isAnnual ? 0 : new Date().getMonth() + 1;
    const grantedHours = isAnnual
      ? (company.allowanceConfig?.annualFreeHours || 240)
      : (company.allowanceConfig?.monthlyFreeHours || 20);

    const periodStart = isAnnual
      ? new Date(Date.UTC(periodYear, 0, 1, 0, 0, 0))
      : new Date(Date.UTC(periodYear, new Date().getMonth(), 1, 0, 0, 0));
    const periodEnd = isAnnual
      ? new Date(Date.UTC(periodYear, 11, 31, 23, 59, 59))
      : new Date(Date.UTC(periodYear, new Date().getMonth() + 1, 0, 23, 59, 59));

    await AllowancePeriod.create({
      companyId: company._id,
      organizationId,
      periodYear,
      periodMonth,
      periodStart,
      periodEnd,
      grantedHours,
      consumedHours: 0,
      reservedHours: 0,
      balanceHours: grantedHours
    });

    let ownerUser = null;
    if (ownerEmail) {
      const generatedPassword = ownerPassword || `Client@${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      ownerUser = await User.create({
        email: ownerEmail.toLowerCase().trim(),
        passwordHash,
        name: ownerName || company.name + ' Admin',
        role: UserRole.COMPANY_OWNER,
        organizationId,
        companyId: company._id,
        isActive: true
      });

      sendClientWelcomeEmail({
        to: ownerEmail.toLowerCase().trim(),
        companyName: company.name,
        clientName: ownerName || company.name + ' Admin',
        email: ownerEmail.toLowerCase().trim(),
        temporaryPassword: generatedPassword
      }).catch(() => {});
    }

    await createAuditLog({
      organizationId,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'COMPANY_CREATED',
      entityType: 'Company',
      entityId: company._id.toString(),
      details: { name: company.name, freeHours: company.allowanceConfig.monthlyFreeHours }
    });

    return apiSuccess(
      res,
      {
        company,
        ownerUser: ownerUser ? { id: ownerUser._id, email: ownerUser.email } : null
      },
      'Company created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      company.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to update this company', 403);
    }

    const updated = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    await createAuditLog({
      organizationId: company.organizationId.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'COMPANY_UPDATED',
      entityType: 'Company',
      entityId: id,
      details: req.body
    });

    return apiSuccess(res, updated, 'Company updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCompanyMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      req.user?.role !== UserRole.COWORKING_ADMIN &&
      req.user?.companyId !== id
    ) {
      throw new AppError('Unauthorized access to view members', 403);
    }

    const members = await User.find({ companyId: id })
      .select('-passwordHash')
      .sort({ role: 1, name: 1 });

    return apiSuccess(res, members);
  } catch (error) {
    next(error);
  }
}

export async function addCompanyMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { email, name, password, role, phone } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      req.user?.role !== UserRole.COWORKING_ADMIN &&
      (req.user?.companyId !== id || req.user?.role !== UserRole.COMPANY_OWNER)
    ) {
      throw new AppError('Unauthorized to add member to this company', 403);
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('A user with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password || 'Temporary@123', 10);
    const memberRole =
      role && [UserRole.COMPANY_OWNER, UserRole.COMPANY_BOOKING_MANAGER, UserRole.EMPLOYEE].includes(role)
        ? role
        : UserRole.EMPLOYEE;

    const member = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      phone,
      role: memberRole,
      organizationId: company.organizationId,
      companyId: company._id,
      isActive: true
    });

    await createAuditLog({
      organizationId: company.organizationId.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'COMPANY_MEMBER_ADDED',
      entityType: 'User',
      entityId: member._id.toString(),
      details: { email: member.email, role: member.role, company: company.name }
    });

    return apiSuccess(
      res,
      {
        id: member._id,
        email: member.email,
        name: member.name,
        role: member.role,
        isActive: member.isActive
      },
      'Member added successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}
