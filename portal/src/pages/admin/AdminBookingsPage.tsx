import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import {
  Calendar,
  Clock,
  DoorOpen,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  AlertCircle,
  X,
  Search,
  Check
} from 'lucide-react';
import { formatDateIST, formatTimeIST, formatCurrency } from '../../utils/formatters.js';

interface BookingItem {
  _id: string;
  bookingNumber: string;
  companyId: {
    _id: string;
    name: string;
  } | string;
  roomId: {
    _id: string;
    name: string;
  } | string;
  bookedByUserId: {
    _id: string;
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
  currency: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  checkedInAt?: string;
  createdAt: string;
}

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState('Client requested cancellation');
  const [cancelling, setCancelling] = useState(false);

  // Create on behalf modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(4);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, roomsData, companiesData] = await Promise.all([
        adminApi.getBookings(),
        adminApi.getRooms(),
        adminApi.getCompanies()
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
      setCompanies(companiesData);
      if (companiesData.length > 0 && !targetCompanyId) {
        setTargetCompanyId(companiesData[0]._id);
      }
      if (roomsData.length > 0 && !targetRoomId) {
        setTargetRoomId(roomsData[0]._id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setTitle('Quarterly Executive Review');
    setPurpose('Strategic company alignment');
    setAttendeeCount(6);
    const now = new Date();
    // Default to tomorrow 10:00 to 11:30
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30, 0);
    setStartDateTime(tomorrow.toISOString().slice(0, 16));
    setEndDateTime(tomorrowEnd.toISOString().slice(0, 16));
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await adminApi.createBooking({
        companyId: targetCompanyId,
        roomId: targetRoomId,
        title,
        purpose,
        attendeeCount: Number(attendeeCount),
        startTime: new Date(startDateTime).toISOString(),
        endTime: new Date(endDateTime).toISOString()
      });
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setCreating(false);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      await adminApi.checkInBooking(bookingId);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to check-in booking');
    }
  };

  const openCancelModal = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setCancelReason('Cancelled via Admin Hub');
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      await adminApi.cancelBooking(selectedBooking._id, cancelReason);
      setIsCancelModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const compName = typeof b.companyId === 'object' ? b.companyId.name.toLowerCase() : '';
      const roomName = typeof b.roomId === 'object' ? b.roomId.name.toLowerCase() : '';
      const bNum = b.bookingNumber?.toLowerCase() || '';
      const bTitle = b.title.toLowerCase();
      return compName.includes(q) || roomName.includes(q) || bNum.includes(q) || bTitle.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Operational Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Master Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Live occupancy schedule, check-in verification, and booking management.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book on Behalf</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company, room name, or booking reference..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16]'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref & Title</th>
                <th className="py-3 px-4">Company & Room</th>
                <th className="py-3 px-4">Scheduled Window</th>
                <th className="py-3 px-4">Usage & Overage</th>
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
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No reservations matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const compName =
                    typeof b.companyId === 'object' && b.companyId !== null
                      ? b.companyId.name
                      : 'Client Company';
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
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-[#B6925A] dark:text-[#C5A880] font-bold block">
                          {b.bookingNumber}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                          {b.title}
                        </span>
                        <span className="text-[11px] text-slate-400">by {booker} ({b.attendeeCount} guests)</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{compName}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-1">
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
                            {b.freeHoursDeducted || 0}h free
                          </span>
                          {b.chargeableHours > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 ml-1.5 font-semibold">
                              +{b.chargeableHours}h over ({formatCurrency(b.totalCharge, 'INR')})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : b.status === 'IN_PROGRESS'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse'
                              : b.status === 'COMPLETED'
                              ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.checkedInAt && (
                          <span className="text-[10px] text-emerald-500 block mt-1 flex items-center space-x-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>Checked in</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {b.status === 'CONFIRMED' && !b.checkedInAt && (
                            <button
                              onClick={() => handleCheckIn(b._id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold border border-emerald-500/20"
                            >
                              Check In
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => openCancelModal(b)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-[11px] font-semibold border border-rose-500/20"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book on Behalf Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Schedule on Behalf of Client
                </h2>
                <span className="text-xs text-slate-500">Atomic allocation & conflict check</span>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Company *
                  </label>
                  <select
                    required
                    value={targetCompanyId}
                    onChange={(e) => setTargetCompanyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Room *
                  </label>
                  <select
                    required
                    value={targetRoomId}
                    onChange={(e) => setTargetRoomId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  >
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendee Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Purpose
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Client presentation"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Window *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Window *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {creating ? 'Locking Slots...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Reservation Modal */}
      {isCancelModalOpen && selectedBooking && (
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
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cancelling this booking will immediately release the inventory slots and refund
                any reserved free allowance hours back to the company pool.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cancellation Reason *
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Releasing Slots...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
