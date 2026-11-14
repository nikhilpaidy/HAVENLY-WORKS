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
  Check,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { formatDateIST, formatTimeIST, formatCurrency } from '../../utils/formatters.js';

interface BookingItem {
  _id: string;
  bookingNumber: string;
  companyId?: {
    _id: string;
    name: string;
  } | string | null;
  roomId: {
    _id: string;
    name: string;
    workspaceType?: string;
  } | string;
  bookedByUserId?: {
    _id: string;
    name: string;
    email: string;
  } | string | null;
  isGuestBooking?: boolean;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  workspaceType?: string;
  bookingType?: string;
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

  const [activeTab, setActiveTab] = useState<'COMPANY' | 'INDIVIDUAL' | 'ALL'>('COMPANY');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

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
    setTitle('');
    setPurpose('');
    setAttendeeCount(4);
    const now = new Date();
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
    setCancelReason('');
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

  const toggleCompanyExpanded = (companyId: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyId]: prev[companyId] === undefined ? false : !prev[companyId]
    }));
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const compName = typeof b.companyId === 'object' && b.companyId !== null ? b.companyId.name.toLowerCase() : '';
      const roomName = typeof b.roomId === 'object' && b.roomId !== null ? b.roomId.name.toLowerCase() : '';
      const bNum = b.bookingNumber?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      const guestName = b.guestName?.toLowerCase() || '';
      return compName.includes(q) || roomName.includes(q) || bNum.includes(q) || bTitle.includes(q) || guestName.includes(q);
    }
    return true;
  });

  const companyBookings = filteredBookings.filter((b) => !b.isGuestBooking && b.companyId);
  const individualBookings = filteredBookings.filter((b) => b.isGuestBooking || !b.companyId);

  const groupedByCompany = companyBookings.reduce((acc: Record<string, { companyName: string; bookings: BookingItem[] }>, b) => {
    const compId = typeof b.companyId === 'object' && b.companyId !== null ? b.companyId._id : (b.companyId || 'unassigned');
    const compName = typeof b.companyId === 'object' && b.companyId !== null ? b.companyId.name : 'Client Company';
    if (!acc[compId]) {
      acc[compId] = { companyName: compName, bookings: [] };
    }
    acc[compId].bookings.push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Master Reservations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time schedule, company allowance usage, and individual guest bookings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book on Behalf</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('COMPANY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'COMPANY'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Reservations ({companyBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('INDIVIDUAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'INDIVIDUAL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Individual / Walk-in ({individualBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Bookings ({filteredBookings.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by company, guest, room name, or booking reference..."
          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading reservations...
        </div>
      ) : activeTab === 'COMPANY' ? (
        Object.keys(groupedByCompany).length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No corporate client reservations matching current criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByCompany).map(([compId, data]) => {
              const isExpanded = expandedCompanies[compId] !== false;
              const totalFreeHrs = data.bookings.reduce((sum, b) => sum + (b.freeHoursDeducted || 0), 0);
              const totalChargeableHrs = data.bookings.reduce((sum, b) => sum + (b.chargeableHours || 0), 0);

              return (
                <div
                  key={compId}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleCompanyExpanded(compId)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {data.companyName}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {data.bookings.length} {data.bookings.length === 1 ? 'reservation' : 'reservations'} • {totalFreeHrs}h allowance applied {totalChargeableHrs > 0 ? `• +${totalChargeableHrs}h overage` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                          <tr>
                            <th className="py-2.5 px-4">Ref & Title</th>
                            <th className="py-2.5 px-4">Room & Capacity</th>
                            <th className="py-2.5 px-4">Time Window</th>
                            <th className="py-2.5 px-4">Usage</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {data.bookings.map((b) => {
                            const roomName = typeof b.roomId === 'object' && b.roomId !== null ? b.roomId.name : 'Meeting Room';
                            const booker = typeof b.bookedByUserId === 'object' && b.bookedByUserId !== null ? b.bookedByUserId.name : 'Team Member';

                            return (
                              <tr key={b._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                                <td className="py-3 px-4">
                                  <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                                    {b.bookingNumber}
                                  </span>
                                  <span className="font-medium text-slate-900 dark:text-white block">
                                    {b.title}
                                  </span>
                                  <span className="text-[11px] text-slate-400">by {booker} ({b.attendeeCount} guests)</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium text-slate-800 dark:text-slate-200 block">
                                    {roomName}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {b.workspaceType ? b.workspaceType.replace(/_/g, ' ') : 'Workspace'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 dark:text-slate-200">
                                    {formatDateIST(b.startTime, true)}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)} ({b.durationMinutes}m)
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                                    {b.freeHoursDeducted || 0}h free
                                  </span>
                                  {b.chargeableHours > 0 && (
                                    <span className="text-amber-600 dark:text-amber-400 ml-1.5 font-medium text-[11px]">
                                      +{b.chargeableHours}h ({formatCurrency(b.totalCharge, 'INR')})
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                      b.status === 'CONFIRMED'
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : b.status === 'IN_PROGRESS'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : b.status === 'COMPLETED'
                                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                  {b.checkedInAt && (
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 flex items-center space-x-0.5">
                                      <Check className="w-2.5 h-2.5" />
                                      <span>Checked in</span>
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    {b.status === 'CONFIRMED' && !b.checkedInAt && (
                                      <button
                                        onClick={() => handleCheckIn(b._id)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-medium"
                                      >
                                        Check In
                                      </button>
                                    )}
                                    {b.status === 'CONFIRMED' && (
                                      <button
                                        onClick={() => openCancelModal(b)}
                                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-300 text-[11px] font-medium"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'INDIVIDUAL' ? (
        individualBookings.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No walk-in guest or individual reservations matching current criteria.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Ref & Guest Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Room & Layout</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Rate & Charge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {individualBookings.map((b) => {
                    const roomName = typeof b.roomId === 'object' && b.roomId !== null ? b.roomId.name : 'Workspace';
                    const guestName = b.guestName || (typeof b.bookedByUserId === 'object' && b.bookedByUserId !== null ? b.bookedByUserId.name : 'Walk-in Guest');
                    const guestEmail = b.guestEmail || (typeof b.bookedByUserId === 'object' && b.bookedByUserId !== null ? b.bookedByUserId.email : 'N/A');

                    return (
                      <tr key={b._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                            {b.bookingNumber}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                            {guestName}
                          </span>
                          <span className="text-[10px] text-slate-400">{b.bookingType || 'Direct Booking'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 dark:text-slate-300 block">{guestEmail}</span>
                          {b.guestPhone && <span className="text-[11px] text-slate-400 block">{b.guestPhone}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block">{roomName}</span>
                          <span className="text-[11px] text-slate-400">{b.workspaceType ? b.workspaceType.replace(/_/g, ' ') : 'Desk'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {formatDateIST(b.startTime, true)}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)} ({b.durationMinutes}m)
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(b.totalCharge || 0, 'INR')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              b.status === 'CONFIRMED'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : b.status === 'IN_PROGRESS'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : b.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            }`}
                          >
                            {b.status}
                          </span>
                          {b.checkedInAt && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 flex items-center space-x-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Checked in</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {b.status === 'CONFIRMED' && !b.checkedInAt && (
                              <button
                                onClick={() => handleCheckIn(b._id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-medium"
                              >
                                Check In
                              </button>
                            )}
                            {b.status === 'CONFIRMED' && (
                              <button
                                onClick={() => openCancelModal(b)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-300 text-[11px] font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Ref & Title</th>
                  <th className="py-3 px-4">Client / Company & Room</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Usage & Charge</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No reservations matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const compName =
                      b.isGuestBooking
                        ? (b.guestName ? `${b.guestName} (Guest)` : 'Walk-in Guest')
                        : typeof b.companyId === 'object' && b.companyId !== null
                        ? b.companyId.name
                        : 'Individual Client';
                    const roomName =
                      typeof b.roomId === 'object' && b.roomId !== null
                        ? b.roomId.name
                        : 'Workspace Room';
                    const booker =
                      typeof b.bookedByUserId === 'object' && b.bookedByUserId !== null
                        ? b.bookedByUserId.name
                        : b.guestName || 'Member';

                    return (
                      <tr key={b._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                            {b.bookingNumber}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white block mt-0.5">
                            {b.title}
                          </span>
                          <span className="text-[11px] text-slate-400">by {booker} ({b.attendeeCount} guests)</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                            {b.isGuestBooking ? <User className="w-3.5 h-3.5 text-slate-400" /> : <Building2 className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{compName}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                            <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{roomName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {formatDateIST(b.startTime, true)}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)} ({b.durationMinutes}m)
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[11px]">
                            {b.freeHoursDeducted > 0 && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {b.freeHoursDeducted}h free
                              </span>
                            )}
                            {b.chargeableHours > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                                +{b.chargeableHours}h ({formatCurrency(b.totalCharge, 'INR')})
                              </span>
                            ) : b.freeHoursDeducted === 0 ? (
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {formatCurrency(b.totalCharge, 'INR')}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              b.status === 'CONFIRMED'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : b.status === 'IN_PROGRESS'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : b.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            }`}
                          >
                            {b.status}
                          </span>
                          {b.checkedInAt && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 flex items-center space-x-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Checked in</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {b.status === 'CONFIRMED' && !b.checkedInAt && (
                              <button
                                onClick={() => handleCheckIn(b._id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-medium"
                              >
                                Check In
                              </button>
                            )}
                            {b.status === 'CONFIRMED' && (
                              <button
                                onClick={() => openCancelModal(b)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-300 text-[11px] font-medium"
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
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Schedule on Behalf of Client
                </h2>
                <span className="text-[11px] text-slate-400">Direct booking with corporate allowance verification</span>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Client Company *
                  </label>
                  <select
                    required
                    value={targetCompanyId}
                    onChange={(e) => setTargetCompanyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Meeting Room *
                  </label>
                  <select
                    required
                    value={targetRoomId}
                    onChange={(e) => setTargetRoomId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
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
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Attendee Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Meeting Purpose
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Client presentation"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Start Window *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    End Window *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-opacity disabled:opacity-50"
                >
                  {creating ? 'Locking Slots...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cancel Reservation
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedBooking.bookingNumber}
                </span>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="p-5 space-y-3.5 text-xs">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cancelling this booking will immediately release the inventory slots and refund
                any reserved free allowance hours back to the company pool.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Cancellation Reason *
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
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
