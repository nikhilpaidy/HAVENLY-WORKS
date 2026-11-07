import React, { useEffect, useState } from 'react';
import { clientApi } from '../../services/api.js';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Info
} from 'lucide-react';

interface LedgerItem {
  _id: string;
  type: 'GRANT' | 'RESERVATION' | 'RELEASE' | 'CONSUMPTION' | 'MANUAL_ADJUSTMENT';
  hours: number;
  balanceAfter: number;
  description: string;
  bookingId?: {
    bookingNumber: string;
    startTime: string;
    endTime: string;
  };
  createdBy?: {
    name: string;
  };
  createdAt: string;
}

export const ClientAllowancePage: React.FC = () => {
  const [currentAllowance, setCurrentAllowance] = useState<any>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([clientApi.getCurrentAllowance(), clientApi.getAllowanceHistory()])
      .then(([curr, hist]) => {
        setCurrentAllowance(curr);
        setLedger(hist?.ledger || []);
      })
      .catch((err) => setError(err.message || 'Failed to load allowance ledger'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading allowance ledger...</div>;
  }

  const totalGranted = currentAllowance?.totalGrantedHours || 20;
  const availableHours = currentAllowance?.availableHours !== undefined ? currentAllowance.availableHours : 20;
  const consumedHours = currentAllowance?.consumedHours || 0;
  const reservedHours = currentAllowance?.reservedHours || 0;
  const usedHours = consumedHours + reservedHours;
  const percentUsed = Math.min(100, Math.round((usedHours / totalGranted) * 100));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Annual Quota Accounting
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
          Complimentary Annual Allowance & Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Transparent, double-entry audit trail of your company's annual meeting room and workspace hours pool.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quota Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Annual Quota Pool</span>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {totalGranted} hrs / yr
          </div>
          <span className="text-[10px] text-slate-400">Granted annually per calendar cycle</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Available Balance</span>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {availableHours} hrs
          </div>
          <span className="text-[10px] text-slate-400">Ready for instant room reservations</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Locked / Reserved</span>
          <div className="text-2xl font-bold font-display text-emerald-500">
            {reservedHours} hrs
          </div>
          <span className="text-[10px] text-slate-400">Allocated to upcoming scheduled meetings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Consumed to Date</span>
          <div className="text-2xl font-bold font-display text-slate-700 dark:text-slate-200">
            {consumedHours} hrs
          </div>
          <span className="text-[10px] text-slate-400">Completed meeting hours</span>
        </div>
      </div>

      {/* Quota Consumption Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Annual Quota Utilization: {percentUsed}%
          </span>
          <span className="text-slate-500">
            {usedHours} consumed / reserved of {totalGranted} hours
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 rounded-full"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Audit Ledger Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
              Allowance Transaction Log
            </h3>
            <p className="text-xs text-slate-500">
              Complete historical ledger of credits, holds, releases, and deductions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Activity Type</th>
                <th className="py-3 px-4">Hours Delta</th>
                <th className="py-3 px-4">Resulting Balance</th>
                <th className="py-3 px-4">Description / Booking Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No ledger transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledger.map((entry: any) => {
                  const typeStr = (entry.changeType || entry.type || 'GRANT').toString().toUpperCase();
                  const isDeduction = typeStr.includes('RESERV') || typeStr.includes('CONSUM') || Number(entry.hours) < 0;
                  const absHours = Math.abs(Number(entry.hours) || 0);
                  const displayHours = isDeduction ? `-${absHours}` : `+${absHours}`;
                  const isPositive = !isDeduction;
                  const dateStr = entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) + ' IST'
                    : 'N/A';

                  return (
                    <tr key={entry._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            typeStr.includes('GRANT')
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : typeStr.includes('RESERV')
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : typeStr.includes('RELEASE')
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : typeStr.includes('CONSUM')
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {typeStr.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`flex items-center space-x-1 ${
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {displayHours} hrs
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {entry.balanceAfter ?? entry.balance ?? 0} hrs
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {entry.notes || entry.description || 'Monthly quota adjustment'}
                        {entry.bookingId && (
                          <span className="font-mono text-[11px] text-brand-600 dark:text-gold-400 block mt-0.5">
                            Ref: {typeof entry.bookingId === 'object' ? entry.bookingId.bookingNumber : entry.bookingId}
                          </span>
                        )}
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
