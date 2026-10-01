import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  DollarSign,
  Download,
  DoorOpen,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';

export const AdminReportsPage: React.FC = () => {
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
    return <div className="text-center py-20 text-slate-500">Loading performance reports...</div>;
  }

  const overview = stats?.overview || {};
  const financials = stats?.financials || {};
  const roomUtilization = stats?.roomUtilization || [];

  const COLORS = ['#B6925A', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

  const freeVsChargeableData = [
    {
      name: 'Free Allowance Hours',
      hours: overview.freeHoursConsumed || 0
    },
    {
      name: 'Chargeable Overage Hours',
      hours: overview.chargeableHours || 0
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Analytics & Utilization
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Operational Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze room booking distribution, quota consumption, and overage revenue.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Month Booked Hours</span>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {overview.monthTotalHours || 0} hrs
          </div>
          <span className="text-[10px] text-slate-400">Total duration across all rooms</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Allowance Used</span>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {overview.freeHoursConsumed || 0} hrs
          </div>
          <span className="text-[10px] text-slate-400">Consumed against free quotas</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Billable Overage</span>
          <div className="text-2xl font-bold font-display text-amber-500">
            {overview.chargeableHours || 0} hrs
          </div>
          <span className="text-[10px] text-slate-400">Hours billed past allowances</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Overage Revenue</span>
          <div className="text-2xl font-bold font-display text-[#B6925A] dark:text-[#C5A880]">
            ${(financials.monthExtraRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Chargeable bookings this month</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Hours Utilization Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Room Utilization by Hours
              </h3>
              <p className="text-xs text-slate-500">Total cumulative hours booked per room this month</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            {roomUtilization.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No room utilization data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="roomName" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1420',
                      borderColor: '#1E293B',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Bar dataKey="hoursBooked" name="Hours Booked" fill="#B6925A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Free Hours vs Overage Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Quota vs. Overage Ratio
              </h3>
              <p className="text-xs text-slate-500">Comparison of free allowance consumption vs overages</p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freeVsChargeableData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1420',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar dataKey="hours" name="Hours" radius={[0, 4, 4, 0]}>
                  {freeVsChargeableData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Utilization Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
            Room Performance Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Room Name</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Total Reservations</th>
                <th className="py-3 px-4">Total Hours Booked</th>
                <th className="py-3 px-4 text-right">Avg Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {roomUtilization.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No room data recorded.
                  </td>
                </tr>
              ) : (
                roomUtilization.map((ru: any) => {
                  const avg = ru.bookingsCount ? (ru.hoursBooked / ru.bookingsCount).toFixed(1) : '0';
                  return (
                    <tr key={ru.roomId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                        <DoorOpen className="w-3.5 h-3.5 text-[#B6925A] dark:text-[#C5A880]" />
                        <span>{ru.roomName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {ru.capacity} persons
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {ru.bookingsCount} bookings
                      </td>
                      <td className="py-3 px-4 font-bold text-[#B6925A] dark:text-[#C5A880]">
                        {ru.hoursBooked} hours
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {avg} hrs/booking
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
