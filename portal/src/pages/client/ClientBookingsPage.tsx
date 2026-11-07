import React, { useEffect, useState } from 'react';
import { clientApi } from '../../services/api.js';
import {
  Calendar,
  Clock,
  DoorOpen,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  CreditCard,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateIST, formatTimeIST, formatCurrency } from '../../utils/formatters.js';

interface BookingItem {
  _id: string;
  bookingNumber: string;
  roomId: {
    _id: string;
    name: string;
  } | string;
  bookedByUserId: {
    name: string;
    email: string;
  } | string;
  title: string;
  purpose?: string;
  attendeeCount: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  freeHoursDeducted: number;
  chargeableHours: number;
  totalCharge: number;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export const ClientBookingsPage: React.FC = () => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState('Meeting rescheduled');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getMyBookings(tab);
      setBookings(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [tab]);

  const openCancelModal = (b: BookingItem) => {
    setSelectedBooking(b);
    setCancelReason('Schedule change');
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setCancelling(true);

    try {
      await clientApi.cancelBooking(selectedBooking._id, cancelReason);
      setIsCancelOpen(false);
      setSuccessMsg('Reservation cancelled. Free allowance hours refunded to your company pool.');
      fetchBookings();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Reservations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            My Team's Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View upcoming schedule, meeting history, and cancel active reservations.
          </p>
        </div>

        <Link
          to="/client/rooms"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Discover & Reserve Rooms</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'upcoming'
              ? 'bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Upcoming Bookings
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'past'
              ? 'bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Past & Completed
        </button>
      </div>

      {/* Bookings List */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Booking Ref & Title</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4">Allowance Impact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading reservations...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="mb-3">No reservations found in this view.</p>
                    <Link
                      to="/client/rooms"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
                    >
                      <DoorOpen className="w-4 h-4" />
                      Discover & Reserve Rooms
                    </Link>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const roomName =
                    typeof b.roomId === 'object' && b.roomId !== null
                      ? b.roomId.name
                      : 'Meeting Room';
                  const booker =
                    typeof b.bookedByUserId === 'object' && b.bookedByUserId !== null
                      ? b.bookedByUserId.name
                      : 'Team Member';

                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-[#B6925A] dark:text-[#C5A880] block">
                          {b.bookingNumber}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                          {b.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Booked by {booker} ({b.attendeeCount} guests)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center space-x-1.5">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{roomName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatDateIST(b.startTime, true)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)} ({b.durationMinutes}m)
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {b.freeHoursDeducted || 0}h free applied
                          </span>
                          {b.chargeableHours > 0 && (
                            <span className="text-amber-500 font-semibold ml-1 block">
                              +{b.chargeableHours}h overage ({formatCurrency(b.totalCharge, 'INR')})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : b.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : b.status === 'COMPLETED'
                              ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {b.status === 'CONFIRMED'
                            ? 'Upcoming Booking'
                            : b.status === 'IN_PROGRESS'
                            ? 'Ongoing'
                            : b.status === 'COMPLETED'
                            ? 'Completed'
                            : 'Cancelled'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => openCancelModal(b)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-[11px] font-semibold border border-rose-500/20"
                          >
                            Cancel
                          </button>
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

      {/* Cancel Reservation Modal */}
      {isCancelOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Cancel Reservation
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedBooking.bookingNumber}
                </span>
              </div>
              <button
                onClick={() => setIsCancelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to cancel this reservation? Any free allowance hours applied
                will be immediately credited back to your company balance.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCancelOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Releasing Room...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
