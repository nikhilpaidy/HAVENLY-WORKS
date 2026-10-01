import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  DoorOpen,
  Users,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateIST, formatTimeIST, formatCurrency } from '../../utils/formatters.js';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats(user?.organizationId)
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading hub dashboard...</div>;
  }

  const overview = stats?.overview || {};
  const financials = stats?.financials || {};
  const todaysBookings = stats?.todaysBookings || [];
  const roomUtilization = stats?.roomUtilization || [];

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Operational Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            {user?.organization?.name || 'Workspace'} Control Center
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/bookings"
            className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Master Schedule</span>
          </Link>
          <Link
            to="/admin/billing"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Billing & Invoices
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Today's Reservations</span>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {overview.todaysBookingsCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Scheduled on today's calendar</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Month Booked Hours</span>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {overview.monthTotalHours || 0} hrs
          </div>
          <span className="text-[10px] text-emerald-500">
            {overview.freeHoursConsumed || 0} free / {overview.chargeableHours || 0} extra
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Billed Overage Revenue</span>
          <div className="text-2xl font-bold font-display text-[#B6925A] dark:text-[#C5A880]">
            {formatCurrency(financials.monthExtraRevenue || 0, 'INR')}
          </div>
          <span className="text-[10px] text-slate-400">Month-to-date chargeable bookings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Outstanding Invoices</span>
          <div className="text-2xl font-bold font-display text-amber-500">
            {formatCurrency(financials.totalDue || 0, 'INR')}
          </div>
          <span className="text-[10px] text-slate-400">Open statements awaiting payment</span>
        </div>
      </div>

      {/* Today's Schedule & Room Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg font-display text-slate-900 dark:text-white">
              Today's Confirmed Schedule
            </h3>
            <span className="text-xs text-slate-400">
              {formatDateIST(new Date(), true)}
            </span>
          </div>

          {todaysBookings.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No meeting room sessions scheduled for today yet.
            </div>
          ) : (
            <div className="space-y-3">
              {todaysBookings.map((b: any) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {b.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3">
                      <span>Room: <strong className="text-slate-700 dark:text-slate-300">{b.roomId?.name}</strong></span>
                      <span>Company: <strong className="text-slate-700 dark:text-slate-300">{b.companyId?.name}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#B6925A] dark:text-[#C5A880]">
                      {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {b.durationHours} hrs ({b.attendeeCount} guests)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Occupancy Rankings */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg font-display text-slate-900 dark:text-white">
              Room Utilization
            </h3>
            <span className="text-xs text-slate-400">This Month</span>
          </div>

          {roomUtilization.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No room utilization data logged this month.
            </div>
          ) : (
            <div className="space-y-4">
              {roomUtilization.map((r: any, idx: number) => (
                <div key={r.roomId} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900 dark:text-white">
                      {idx + 1}. {r.roomName} ({r.capacity} pax)
                    </span>
                    <span className="text-[#B6925A] dark:text-[#C5A880]">
                      {r.hoursBooked} hrs ({r.bookingsCount} sessions)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C5A880] h-full rounded-full"
                      style={{ width: `${Math.min(100, (r.hoursBooked / 40) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
