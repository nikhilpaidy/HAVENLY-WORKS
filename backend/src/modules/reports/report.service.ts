import { Types } from 'mongoose';
import { CoworkingOrganization } from '../organizations/organization.model.js';
import { Location } from '../locations/location.model.js';
import { MeetingRoom } from '../rooms/room.model.js';
import { Company } from '../companies/company.model.js';
import { Booking } from '../bookings/booking.model.js';
import { Invoice } from '../billing/invoice.model.js';
import { PaymentRecord } from '../payments/payment.model.js';
import { User } from '../users/user.model.js';
import { BookingStatus, UserRole } from '../../types/index.js';

export async function getSuperAdminDashboardStats() {
  const [
    totalOrganizations,
    totalAdmins,
    totalLocations,
    totalCompanies,
    totalRooms,
    totalBookings,
    todayBookingsCount,
    financials
  ] = await Promise.all([
    CoworkingOrganization.countDocuments(),
    User.countDocuments({ role: UserRole.COWORKING_ADMIN, isActive: true }),
    Location.countDocuments({ isActive: true }),
    Company.countDocuments({ status: 'ACTIVE' }),
    MeetingRoom.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({
      startTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }),
    Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$amountDue' }
        }
      }
    ])
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTrends = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        totalHours: { $sum: '$durationHours' },
        chargeableAmount: { $sum: '$pricingSnapshot.totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return {
    overview: {
      totalOrganizations,
      totalAdmins,
      totalLocations,
      totalCompanies,
      totalRooms,
      totalBookings,
      todayBookings: todayBookingsCount
    },
    financials: {
      totalBilled: financials[0]?.totalBilled || 0,
      totalPaid: financials[0]?.totalPaid || 0,
      totalOutstanding: financials[0]?.totalDue || 0
    },
    monthlyTrends: monthlyTrends.map((t) => ({
      period: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
      bookings: t.count,
      hours: t.totalHours,
      revenue: t.chargeableAmount
    }))
  };
}

export async function getCoworkingAdminDashboardStats(organizationId: string | Types.ObjectId) {
  const orgId = new Types.ObjectId(organizationId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    totalRooms,
    totalCompanies,
    todaysBookings,
    monthBookings,
    financialStats,
    roomUtilization
  ] = await Promise.all([
    MeetingRoom.countDocuments({ organizationId: orgId, isActive: true }),
    Company.countDocuments({ organizationId: orgId, status: 'ACTIVE' }),
    Booking.find({
      organizationId: orgId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }
    })
      .populate('roomId', 'name code')
      .populate('companyId', 'name')
      .populate('bookedByUserId', 'name')
      .sort({ startTime: 1 }),
    Booking.aggregate([
      {
        $match: {
          organizationId: orgId,
          startTime: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: BookingStatus.CANCELLED }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalHours: { $sum: '$durationHours' },
          freeHoursConsumed: { $sum: '$pricingSnapshot.freeHoursApplied' },
          chargeableHours: { $sum: '$pricingSnapshot.chargeableHours' },
          extraRevenue: { $sum: '$pricingSnapshot.totalAmount' }
        }
      }
    ]),
    Invoice.aggregate([
      {
        $match: { organizationId: orgId }
      },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$amountDue' }
        }
      }
    ]),
    Booking.aggregate([
      {
        $match: {
          organizationId: orgId,
          startTime: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: BookingStatus.CANCELLED }
        }
      },
      {
        $group: {
          _id: '$roomId',
          bookingsCount: { $sum: 1 },
          hoursBooked: { $sum: '$durationHours' }
        }
      },
      {
        $lookup: {
          from: 'meetingrooms',
          localField: '_id',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $project: {
          roomId: '$_id',
          roomName: '$room.name',
          roomCode: '$room.code',
          capacity: '$room.capacity',
          bookingsCount: 1,
          hoursBooked: 1
        }
      },
      { $sort: { hoursBooked: -1 } }
    ])
  ]);

  return {
    overview: {
      totalRooms,
      totalCompanies,
      todaysBookingsCount: todaysBookings.length,
      monthTotalBookings: monthBookings[0]?.totalBookings || 0,
      monthTotalHours: monthBookings[0]?.totalHours || 0,
      freeHoursConsumed: monthBookings[0]?.freeHoursConsumed || 0,
      chargeableHours: monthBookings[0]?.chargeableHours || 0
    },
    financials: {
      totalBilled: financialStats[0]?.totalBilled || 0,
      totalPaid: financialStats[0]?.totalPaid || 0,
      totalDue: financialStats[0]?.totalDue || 0,
      monthExtraRevenue: monthBookings[0]?.extraRevenue || 0
    },
    todaysBookings,
    roomUtilization
  };
}

export async function getCompanyUsageStats(companyId: string | Types.ObjectId) {
  const compId = new Types.ObjectId(companyId);

  const [bookingHistory, financialSummary] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          companyId: compId,
          status: { $ne: BookingStatus.CANCELLED }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' }
          },
          bookingsCount: { $sum: 1 },
          totalHours: { $sum: '$durationHours' },
          freeHoursUsed: { $sum: '$pricingSnapshot.freeHoursApplied' },
          chargeableHours: { $sum: '$pricingSnapshot.chargeableHours' },
          totalCharges: { $sum: '$pricingSnapshot.totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]),
    Invoice.aggregate([
      {
        $match: { companyId: compId }
      },
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$amountDue' }
        }
      }
    ])
  ]);

  return {
    bookingHistory: bookingHistory.map((h) => ({
      period: `${h._id.year}-${String(h._id.month).padStart(2, '0')}`,
      bookings: h.bookingsCount,
      hours: h.totalHours,
      freeHoursUsed: h.freeHoursUsed,
      chargeableHours: h.chargeableHours,
      charges: h.totalCharges
    })),
    financials: {
      totalInvoiced: financialSummary[0]?.totalInvoiced || 0,
      totalPaid: financialSummary[0]?.totalPaid || 0,
      totalOutstanding: financialSummary[0]?.totalOutstanding || 0
    }
  };
}
