import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api.js';
import { TrendingUp, DollarSign, Calendar, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';

export const SuperAdminReportsPage: React.FC = () => {
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
    return <div className="text-center py-20 text-slate-500">Compiling financial reports...</div>;
  }

  const financials = stats?.financials || {};
  const monthlyTrends = stats?.monthlyTrends || [];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-[#C5A880]">
          Financial Intelligence
        </span>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
          Platform-Wide Revenue & Booking Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Consolidated performance metrics, overage billings, and utilization reports in INR (₹).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-1 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Billed Charges</span>
          <div className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            {formatCurrency(financials.totalBilled || 0, 'INR')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Issued statements for over-quota bookings</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-1 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Recorded Payments</span>
          <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
            {formatCurrency(financials.totalPaid || 0, 'INR')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Audited remittances received via bank / cash</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-1 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Outstanding Due</span>
          <div className="text-3xl font-extrabold font-display text-amber-600 dark:text-amber-400">
            {formatCurrency(financials.totalOutstanding || 0, 'INR')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Receivables awaiting operator logging</span>
        </div>
      </div>

      {/* Revenue & Hours Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <h3 className="font-bold text-base font-display text-slate-900 dark:text-white">
            Monthly Extra Hours Revenue Trend (₹ INR)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#C5A880',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [formatCurrency(val, 'INR'), 'Overage Revenue']}
                />
                <Bar dataKey="revenue" fill="#C5A880" radius={[6, 6, 0, 0]} name="Overage Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 bg-white/60 dark:bg-slate-900/60 shadow-sm">
          <h3 className="font-bold text-base font-display text-slate-900 dark:text-white">
            Monthly Total Booked Hours
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#C5A880',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} hrs`, 'Total Booked Hours']}
                />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Total Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
