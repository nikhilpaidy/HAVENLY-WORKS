import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api.js';
import {
  Building,
  UserCheck,
  MapPin,
  Users,
  DoorOpen,
  Calendar,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';

export const SuperAdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading platform metrics...</div>;
  }

  const overview = stats?.overview || {};
  const financials = stats?.financials || {};
  const monthlyTrends = stats?.monthlyTrends || [];

  const cards = [
    { label: 'Organizations', value: overview.totalOrganizations || 0, icon: Building, color: 'text-amber-500' },
    { label: 'Active Admins', value: overview.totalAdmins || 0, icon: UserCheck, color: 'text-blue-500' },
    { label: 'Hub Locations', value: overview.totalLocations || 0, icon: MapPin, color: 'text-emerald-500' },
    { label: 'Client Companies', value: overview.totalCompanies || 0, icon: Users, color: 'text-purple-500' },
    { label: 'Meeting Rooms', value: overview.totalRooms || 0, icon: DoorOpen, color: 'text-indigo-500' },
    { label: 'Reservations', value: overview.totalBookings || 0, icon: Calendar, color: 'text-teal-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-[#C5A880]">
            Platform Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Global Ecosystem Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time status across Indian regional coworking hubs, tenant companies, and reservations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/super-admin/admins"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manage Admins</span>
          </Link>
          <Link
            to="/super-admin/blogs"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
          >
            Blog CMS
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Billed Across Platform
          </span>
          <div className="text-3xl font-bold font-display text-slate-900 dark:text-white">
            {formatCurrency(financials.totalBilled || 0, 'INR')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Itemized statements issued to tenant companies</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Manually Recorded Collections
          </span>
          <div className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {formatCurrency(financials.totalPaid || 0, 'INR')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Wire transfers, cash, UPI/NEFT logged by operators</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Outstanding Receivables
          </span>
          <div className="text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
            {formatCurrency(financials.totalOutstanding || 0, 'INR')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Open invoice balances pending settlement</p>
        </div>
      </div>

      {/* Monthly Booking Velocity Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 bg-white/60 dark:bg-slate-900/60 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Platform Booking Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly confirmed reservation volume</p>
          </div>
          <TrendingUp className="w-5 h-5 text-brand-600 dark:text-[#C5A880]" />
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="period" stroke="#888888" fontSize={12} tickLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#C5A880',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="bookings" fill="#C5A880" radius={[6, 6, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
