import React, { useEffect, useState } from 'react';
import { clientApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Clock,
  Calendar,
  DoorOpen,
  ArrowRight,
  TrendingUp,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateIST, formatTimeIST } from '../../utils/formatters.js';

export const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [allowance, setAllowance] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clientApi.getCurrentAllowance(),
      clientApi.getMyBookings('upcoming'),
      clientApi.getInvoices()
    ])
      .then(([allowanceData, bookingsData, invoicesData]) => {
        setAllowance(allowanceData);
        setUpcomingBookings(bookingsData || []);
        setInvoices(invoicesData || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading your corporate portal...</div>;
  }

  const totalGranted = allowance?.totalGrantedHours || 20;
  const availableHours = allowance?.availableHours !== undefined ? allowance.availableHours : 20;
  const consumedHours = allowance?.consumedHours || 0;
  const reservedHours = allowance?.reservedHours || 0;
  const usedHours = consumedHours + reservedHours;
  const percentUsed = Math.min(100, Math.round((usedHours / totalGranted) * 100));

  const outstandingInvoices = invoices.filter((i) => i.amountDue > 0);
  const totalDue = outstandingInvoices.reduce((acc, i) => acc + (i.amountDue || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Corporate Client Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Welcome, {user?.name || 'Partner'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access executive meeting rooms using your company's monthly complimentary allowance.
          </p>
        </div>

        <Link
          to="/client/rooms"
          className="px-5 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <DoorOpen className="w-4 h-4" />
          <span>Reserve Meeting Room</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Outstanding Invoice Banner (if any) */}
      {totalDue > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Pending Balance Due: ${totalDue.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500">
                You have {outstandingInvoices.length} statement(s) pending payment for room overages.
              </div>
            </div>
          </div>
          <Link
            to="/client/invoices"
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
          >
            Review Statements
          </Link>
        </div>
      )}

      {/* Allowance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allowance Gauge Card */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Quota
              </span>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-0.5">
                Free Meeting Hours Allowance
              </h3>
            </div>
            <Link
              to="/client/allowance"
              className="text-xs text-[#B6925A] dark:text-[#C5A880] hover:underline font-semibold flex items-center space-x-1"
            >
              <span>View Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {availableHours} hours remaining
              </span>
              <span className="text-slate-400">
                {usedHours} of {totalGranted} hours used ({percentUsed}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B6925A] to-[#D4AF37] transition-all duration-500 rounded-full"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Granted</span>
              <span className="font-bold text-slate-900 dark:text-white text-base mt-0.5 block">
                {totalGranted} hrs
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Reserved</span>
              <span className="font-bold text-blue-500 text-base mt-0.5 block">
                {reservedHours} hrs
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Available</span>
              <span className="font-bold text-emerald-500 text-base mt-0.5 block">
                {availableHours} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Quick Rate Information */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[#B6925A] dark:text-[#C5A880] w-max mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Complimentary Entitlement
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When your free monthly allowance is exhausted, subsequent bookings are automatically
              billed at your contracted corporate rate.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 text-xs flex items-center justify-between">
            <span className="text-slate-500">Corporate Overage Rate:</span>
            <span className="font-bold text-slate-900 dark:text-white">Contract Rate / hr</span>
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Upcoming Reservations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Your team's scheduled meetings</p>
          </div>

          <Link
            to="/client/bookings"
            className="text-xs font-semibold text-[#B6925A] dark:text-[#C5A880] hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {upcomingBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">No upcoming reservations</p>
              <Link
                to="/client/rooms"
                className="mt-3 inline-block px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-semibold"
              >
                Browse & Book Rooms
              </Link>
            </div>
          ) : (
            upcomingBookings.slice(0, 5).map((b) => {
              const roomName =
                typeof b.roomId === 'object' && b.roomId !== null
                  ? b.roomId.name
                  : 'Meeting Room';
              const start = new Date(b.startTime);
              const end = new Date(b.endTime);

              return (
                <div
                  key={b._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-[#B6925A] dark:text-[#C5A880]">
                        {b.bookingNumber}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1 font-medium text-slate-700 dark:text-slate-300">
                        <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{roomName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatDateIST(b.startTime, true)}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {b.status}
                    </span>
                    <Link
                      to="/client/bookings"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
