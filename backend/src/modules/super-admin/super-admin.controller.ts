import { Request, Response, NextFunction } from 'express';
import { User } from '../users/user.model.js';
import { CoworkingOrganization } from '../organizations/organization.model.js';
import { Location } from '../locations/location.model.js';
import { MeetingRoom } from '../rooms/room.model.js';
import { Company } from '../companies/company.model.js';
import { Booking } from '../bookings/booking.model.js';
import { AuditLog } from '../audit-logs/audit-log.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';
import bcrypt from 'bcryptjs';

export async function getCoworkingSpacesSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const orgs = await CoworkingOrganization.find().sort({ createdAt: -1 });
    const orgIds = orgs.map((org) => org._id);

    const [allLocations, roomsAggr, companiesAggr, bookingsAggr, allAdmins] = await Promise.all([
      Location.find({ organizationId: { $in: orgIds }, isActive: true })
        .select('name address city state code organizationId')
        .lean(),
      MeetingRoom.aggregate([
        { $match: { organizationId: { $in: orgIds }, isActive: true } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } }
      ]),
      Company.aggregate([
        { $match: { organizationId: { $in: orgIds }, status: 'ACTIVE' } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { organizationId: { $in: orgIds } } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } }
      ]),
      User.find({ organizationId: { $in: orgIds }, role: UserRole.COWORKING_ADMIN })
        .select('name email phone isActive organizationId')
        .lean()
    ]);

    const locationsMap = new Map<string, any[]>();
    for (const loc of allLocations) {
      const key = String(loc.organizationId);
      if (!locationsMap.has(key)) locationsMap.set(key, []);
      locationsMap.get(key)!.push(loc);
    }

    const roomsCountMap = new Map<string, number>();
    for (const r of roomsAggr) {
      roomsCountMap.set(String(r._id), r.count);
    }

    const companiesCountMap = new Map<string, number>();
    for (const c of companiesAggr) {
      companiesCountMap.set(String(c._id), c.count);
    }

    const bookingsCountMap = new Map<string, number>();
    for (const b of bookingsAggr) {
      bookingsCountMap.set(String(b._id), b.count);
    }

    const adminUserMap = new Map<string, any>();
    for (const adm of allAdmins) {
      const key = String(adm.organizationId);
      if (!adminUserMap.has(key)) {
        adminUserMap.set(key, adm);
      }
    }

    const summaries = orgs.map((org) => {
      const orgIdStr = String(org._id);
      return {
        organization: org,
        locations: locationsMap.get(orgIdStr) || [],
        roomsCount: roomsCountMap.get(orgIdStr) || 0,
        companiesCount: companiesCountMap.get(orgIdStr) || 0,
        bookingsCount: bookingsCountMap.get(orgIdStr) || 0,
        adminUser: adminUserMap.get(orgIdStr) || null
      };
    });

    return apiSuccess(res, summaries);
  } catch (error) {
    next(error);
  }
}

export async function getAdminsList(req: Request, res: Response, next: NextFunction) {
  try {
    const admins = await User.find({ role: UserRole.COWORKING_ADMIN })
      .populate('organizationId', 'name slug currency address')
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const orgIds: any[] = [];
    for (const admin of admins) {
      if (admin.organizationId) {
        const id = (admin.organizationId as any)._id || admin.organizationId;
        orgIds.push(id);
      }
    }

    const [allLocations, allCompanies] = await Promise.all([
      Location.find({ organizationId: { $in: orgIds }, isActive: true })
        .select('name address city state images rating managerName managerPhone organizationId')
        .lean(),
      Company.find({ organizationId: { $in: orgIds }, status: 'ACTIVE' })
        .select('name billingEmail phone allowanceConfig locationId organizationId')
        .populate('locationId', 'name')
        .lean()
    ]);

    const locationsByOrg = new Map<string, any[]>();
    for (const loc of allLocations) {
      const key = String(loc.organizationId);
      if (!locationsByOrg.has(key)) locationsByOrg.set(key, []);
      locationsByOrg.get(key)!.push(loc);
    }

    const companiesByOrg = new Map<string, any[]>();
    for (const comp of allCompanies) {
      const key = String(comp.organizationId);
      if (!companiesByOrg.has(key)) companiesByOrg.set(key, []);
      companiesByOrg.get(key)!.push(comp);
    }

    const enriched = admins.map((admin) => {
      if (!admin.organizationId) {
        return { ...admin, locations: [], companies: [] };
      }
      const orgIdStr = String((admin.organizationId as any)._id || admin.organizationId);
      return {
        ...admin,
        locations: locationsByOrg.get(orgIdStr) || [],
        companies: companiesByOrg.get(orgIdStr) || []
      };
    });

    return apiSuccess(res, enriched);
  } catch (error) {
    next(error);
  }
}

export async function createAdminUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, organizationId, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('User with this email already exists', 400);
    }

    const org = await CoworkingOrganization.findById(organizationId);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    const passwordHash = await bcrypt.hash(password || 'Admin@123', 10);
    const admin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: UserRole.COWORKING_ADMIN,
      organizationId,
      phone,
      isActive: true
    });

    await createAuditLog({
      organizationId,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'ADMIN_USER_CREATED',
      entityType: 'User',
      entityId: admin._id.toString(),
      details: { email: admin.email, organization: org.name }
    });

    return apiSuccess(
      res,
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        organizationId: admin.organizationId
      },
      'Coworking Admin created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    await createAuditLog({
      organizationId: user.organizationId?.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: { email: user.email, newStatus: user.isActive }
    });

    return apiSuccess(res, { id: user._id, isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'suspended'}`);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, email, password, organizationId, phone, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (name) user.name = name.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (existing) {
        throw new AppError('User with this email already exists', 400);
      }
      user.email = email.toLowerCase().trim();
    }
    if (password && password.trim().length > 0) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    if (organizationId) {
      const org = await CoworkingOrganization.findById(organizationId);
      if (!org) throw new AppError('Organization not found', 404);
      user.organizationId = organizationId;
    }
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await createAuditLog({
      organizationId: user.organizationId?.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'ADMIN_USER_UPDATED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: {
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        passwordChanged: !!(password && password.trim().length > 0)
      }
    });

    return apiSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organizationId: user.organizationId,
        isActive: user.isActive
      },
      'Admin updated successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { action, entityType, limit, skip } = req.query;
    const query: any = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip ? parseInt(skip as string, 10) : 0)
        .limit(limit ? parseInt(limit as string, 10) : 50),
      AuditLog.countDocuments(query)
    ]);

    return apiSuccess(res, logs, 'Audit logs retrieved', 200, { total });
  } catch (error) {
    next(error);
  }
}
