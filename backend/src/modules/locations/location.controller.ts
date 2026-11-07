import { Request, Response, NextFunction } from 'express';
import { Location } from './location.model.js';
import { MeetingRoom } from '../rooms/room.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';
import fs from 'fs';
import path from 'path';

function calculateDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export async function getNearbyLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const userLat = Number(req.query.lat) || 12.9716;
    const userLng = Number(req.query.lng) || 77.5946;
    const requestedRadiusKm = Number(req.query.radiusKm) || 1;

    const allLocations = await Location.find({ isActive: true }).lean();

    let targetRadius = Math.max(1, Math.min(requestedRadiusKm, 5));
    let matchedLocations: any[] = [];

    const searchAtRadius = (radius: number) => {
      return allLocations
        .map((loc: any) => {
          const locLat = loc.latitude || (loc.geoLocation?.coordinates ? loc.geoLocation.coordinates[1] : 12.9716);
          const locLng = loc.longitude || (loc.geoLocation?.coordinates ? loc.geoLocation.coordinates[0] : 77.5946);
          const distanceKm = calculateDistanceInKm(userLat, userLng, locLat, locLng);
          const approxMinutes = Math.max(5, Math.round(distanceKm * 4.5));

          return {
            ...loc,
            distanceKm,
            distanceLabel: `${approxMinutes} Min • ${distanceKm} km`
          };
        })
        .filter((loc: any) => loc.distanceKm <= radius)
        .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    };

    matchedLocations = searchAtRadius(targetRadius);

    if (matchedLocations.length === 0 && targetRadius < 2) {
      targetRadius = 2;
      matchedLocations = searchAtRadius(targetRadius);
    }
    if (matchedLocations.length === 0 && targetRadius < 5) {
      targetRadius = 5;
      matchedLocations = searchAtRadius(targetRadius);
    }

    if (matchedLocations.length === 0) {
      matchedLocations = allLocations.map((loc: any) => {
        const locLat = loc.latitude || 12.9716;
        const locLng = loc.longitude || 77.5946;
        const distanceKm = calculateDistanceInKm(userLat, userLng, locLat, locLng);
        return {
          ...loc,
          distanceKm,
          distanceLabel: `${Math.max(5, Math.round(distanceKm * 4.5))} Min • ${distanceKm} km`
        };
      }).sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    }

    const locationIds = matchedLocations.map((l: any) => l._id);
    const rooms = await MeetingRoom.find({ locationId: { $in: locationIds }, isActive: true }).lean();

    const enriched = matchedLocations.map((loc: any) => {
      const locRooms = rooms.filter((r: any) => r.locationId.toString() === loc._id.toString());
      const minHourlyRate = locRooms.length > 0 ? Math.min(...locRooms.map((r: any) => r.hourlyRate)) : 250;
      return {
        ...loc,
        totalWorkspaces: locRooms.length,
        minHourlyRate,
        workspaces: locRooms
      };
    });

    return apiSuccess(res, {
      userCoordinates: { lat: userLat, lng: userLng },
      effectiveRadiusKm: targetRadius,
      resultsCount: enriched.length,
      locations: enriched
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await Location.find({ isActive: true }).sort({ rating: -1, name: 1 }).lean();
    const locationIds = locations.map((l) => l._id);
    const rooms = await MeetingRoom.find({ locationId: { $in: locationIds }, isActive: true }).lean();

    const data = locations.map((loc) => {
      const locRooms = rooms.filter((r) => r.locationId.toString() === loc._id.toString());
      const minHourlyRate = locRooms.length > 0 ? Math.min(...locRooms.map((r) => r.hourlyRate)) : 350;
      return {
        ...loc,
        totalWorkspaces: locRooms.length,
        minHourlyRate,
        workspaces: locRooms
      };
    });

    return apiSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getPublicLocationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const location = await Location.findById(id).lean();
    if (!location) {
      throw new AppError('Location not found', 404);
    }
    const workspaces = await MeetingRoom.find({ locationId: id, isActive: true }).lean();
    return apiSuccess(res, {
      ...location,
      workspaces
    });
  } catch (error) {
    next(error);
  }
}

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

    const latitude = Number(req.body.latitude) || 12.9716;
    const longitude = Number(req.body.longitude) || 77.5946;

    const location = await Location.create({
      ...req.body,
      latitude,
      longitude,
      geoLocation: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
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

    const updateData = { ...req.body };
    if (updateData.latitude && updateData.longitude) {
      updateData.geoLocation = {
        type: 'Point',
        coordinates: [Number(updateData.longitude), Number(updateData.latitude)]
      };
    }

    const updated = await Location.findByIdAndUpdate(id, updateData, {
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
      details: { name: updated?.name }
    });

    return apiSuccess(res, updated, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function uploadPaymentQrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { imageBase64, upiId, mimeType } = req.body;

    if (!imageBase64) {
      throw new AppError('imageBase64 string is required', 400);
    }

    const location = await Location.findById(id);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const ext = (mimeType || 'image/png').includes('jpeg') || (mimeType || '').includes('jpg') ? 'jpg' : 'png';
    const filename = `payment-qr-${id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

    const qrUrl = `/uploads/${filename}`;
    location.paymentQrCodeUrl = qrUrl;
    if (upiId) location.upiId = upiId;
    await location.save();

    return apiSuccess(res, { paymentQrCodeUrl: qrUrl, upiId: location.upiId }, 'Payment QR code uploaded successfully');
  } catch (error) {
    next(error);
  }
}
