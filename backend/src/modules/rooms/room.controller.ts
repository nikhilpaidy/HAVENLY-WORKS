import { Request, Response, NextFunction } from 'express';
import { MeetingRoom } from './room.model.js';
import { Company } from '../companies/company.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';

export async function getPublicRooms(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = { isActive: true };

    if (req.user?.companyId) {
      const clientCompany = await Company.findById(req.user.companyId).select('locationId');
      if (clientCompany?.locationId) {
        query.locationId = clientCompany.locationId;
      }
    } else if (req.query.locationId) {
      query.locationId = req.query.locationId;
    }
    if (req.query.workspaceType && req.query.workspaceType !== 'ALL') {
      query.workspaceType = req.query.workspaceType;
    }
    if (req.query.minCapacity) {
      query.capacity = { $gte: parseInt(req.query.minCapacity as string, 10) };
    }
    if (req.query.maxHourlyRate) {
      query.hourlyRate = { $lte: parseFloat(req.query.maxHourlyRate as string) };
    }
    if (req.query.minRating) {
      query.rating = { $gte: parseFloat(req.query.minRating as string) };
    }
    if (req.query.amenity) {
      query.amenities = req.query.amenity;
    }

    const rooms = await MeetingRoom.find(query)
      .populate('locationId', 'name city state timezone address managerName managerPhone paymentQrCodeUrl upiId')
      .sort({ rating: -1, hourlyRate: 1 });

    return apiSuccess(res, rooms);
  } catch (error) {
    next(error);
  }
}

export async function getPublicRoomById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const room = await MeetingRoom.findById(id).populate('locationId');
    if (!room) {
      throw new AppError('Workspace not found', 404);
    }
    return apiSuccess(res, room);
  } catch (error) {
    next(error);
  }
}

export async function getRooms(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = { isActive: true };

    if (
      req.user?.role === UserRole.SUPER_ADMIN ||
      req.user?.role === UserRole.COWORKING_ADMIN
    ) {
      if (req.query.includeInactive === 'true') {
        delete query.isActive;
      }
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      query.organizationId = req.user?.organizationId;
    } else if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    if (req.user?.companyId) {
      const clientCompany = await Company.findById(req.user.companyId).select('locationId');
      if (clientCompany?.locationId) {
        query.locationId = clientCompany.locationId;
      }
    } else if (req.query.locationId) {
      query.locationId = req.query.locationId;
    }

    if (req.query.workspaceType && req.query.workspaceType !== 'ALL') {
      query.workspaceType = req.query.workspaceType;
    }

    if (req.query.minCapacity) {
      query.capacity = { $gte: parseInt(req.query.minCapacity as string, 10) };
    }

    if (req.query.amenity) {
      query.amenities = req.query.amenity;
    }

    const rooms = await MeetingRoom.find(query)
      .populate('locationId', 'name city timezone businessHours managerName managerPhone paymentQrCodeUrl upiId')
      .sort({ capacity: 1, name: 1 });

    return apiSuccess(res, rooms);
  } catch (error) {
    next(error);
  }
}

export async function getRoomById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const room = await MeetingRoom.findById(id).populate('locationId');
    if (!room) {
      throw new AppError('Meeting room not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      room.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to this meeting room', 403);
    }

    return apiSuccess(res, room);
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId =
      req.user?.role === UserRole.SUPER_ADMIN && req.body.organizationId
        ? req.body.organizationId
        : req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }

    const room = await MeetingRoom.create({
      ...req.body,
      organizationId
    });

    await createAuditLog({
      organizationId,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'MEETING_ROOM_CREATED',
      entityType: 'MeetingRoom',
      entityId: room._id.toString(),
      details: { name: room.name, code: room.code, capacity: room.capacity }
    });

    return apiSuccess(res, room, 'Meeting room created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const room = await MeetingRoom.findById(id);
    if (!room) {
      throw new AppError('Meeting room not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      room.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to update this meeting room', 403);
    }

    const updated = await MeetingRoom.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate('locationId');

    await createAuditLog({
      organizationId: room.organizationId.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'MEETING_ROOM_UPDATED',
      entityType: 'MeetingRoom',
      entityId: id,
      details: req.body
    });

    return apiSuccess(res, updated, 'Meeting room updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function addMaintenanceBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { startTime, endTime, reason } = req.body;

    const room = await MeetingRoom.findById(id);
    if (!room) {
      throw new AppError('Meeting room not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      room.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized to add maintenance block', 403);
    }

    room.maintenanceBlocks.push({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason,
      createdBy: req.user?.userId as any
    });

    await room.save();

    await createAuditLog({
      organizationId: room.organizationId.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'MAINTENANCE_BLOCK_ADDED',
      entityType: 'MeetingRoom',
      entityId: id,
      details: { startTime, endTime, reason }
    });

    return apiSuccess(res, room, 'Maintenance block added successfully');
  } catch (error) {
    next(error);
  }
}
