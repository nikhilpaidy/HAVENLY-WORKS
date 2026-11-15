import React, { useEffect, useState } from 'react';
import { adminApi, superAdminApi } from '../../services/api.js';
import { useAuth, UserRole } from '../../context/AuthContext.js';
import {
  Calendar,
  Clock,
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
  ChevronRight,
  ChevronLeft,
  Building,
  MapPin,
  Layers,
  ArrowRight,
  Sparkles,
  Shield,
  CreditCard
} from 'lucide-react';
import { formatDateIST, formatTimeIST, formatCurrency } from '../../utils/formatters.js';

interface BookingItem {
  _id: string;
  bookingNumber: string;
  organizationId?: {
    _id: string;
    name: string;
    slug?: string;
    email?: string;
  } | string | null;
  locationId?: {
    _id: string;
    name: string;
    city?: string;
    address?: { street?: string; city?: string };
  } | string | null;
  companyId?: {
    _id: string;
    name: string;
    billingEmail?: string;
  } | string | null;
  roomId: {
    _id: string;
    name: string;
    workspaceType?: string;
    hourlyRate?: number;
    dailyRate?: number;
    capacity?: number;
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
  durationHours?: number;
  durationMinutes?: number;
  freeHoursDeducted?: number;
  chargeableHours?: number;
  totalCharge?: number;
  currency?: string;
  pricingSnapshot?: {
    baseHourlyRate: number;
    freeHoursApplied: number;
    chargeableHours: number;
    totalAmount: number;
    currency: string;
  };
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  checkedInAt?: string;
  createdAt: string;
}

export const AdminBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SUPER_ADMIN_STAFF;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'HIERARCHY' | 'FEED'>('HIERARCHY');

  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const [activeFeedTab, setActiveFeedTab] = useState<'COMPANY' | 'INDIVIDUAL' | 'ALL'>('COMPANY');
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
      const calls: Promise<any>[] = [
        adminApi.getBookings(),
        adminApi.getRooms(),
        adminApi.getCompanies(),
        adminApi.getLocations()
      ];
      if (isSuperAdmin) {
        calls.push(superAdminApi.getAdmins());
      }

      const results = await Promise.all(calls);
      setBookings(results[0] || []);
      setRooms(results[1] || []);
      setCompanies(results[2] || []);
      setLocations(results[3] || []);
      if (isSuperAdmin && results[4]) {
        setAdminsList(results[4]);
      }

      if (results[2]?.length > 0 && !targetCompanyId) {
        setTargetCompanyId(results[2][0]._id);
      }
      if (results[1]?.length > 0 && !targetRoomId) {
        setTargetRoomId(results[1][0]._id);
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
  }, [isSuperAdmin]);

  const openCreateModal = () => {
    setTitle('');
    setPurpose('');
    setAttendeeCount(4);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
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
      const locName = typeof b.locationId === 'object' && b.locationId !== null ? b.locationId.name.toLowerCase() : '';
      const bNum = b.bookingNumber?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      const guestName = b.guestName?.toLowerCase() || '';
      return compName.includes(q) || roomName.includes(q) || locName.includes(q) || bNum.includes(q) || bTitle.includes(q) || guestName.includes(q);
    }
    return true;
  });

  const companyBookings = filteredBookings.filter((b) => !b.isGuestBooking && b.companyId);
  const individualBookings = filteredBookings.filter((b) => b.isGuestBooking || !b.companyId);

  const totalGrossAmount = bookings.reduce((sum, b) => sum + (b.pricingSnapshot?.totalAmount || b.totalCharge || 0), 0);
  const totalCompletedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalConfirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;

  const operatorsList = isSuperAdmin && adminsList.length > 0
    ? adminsList
    : [
        {
          _id: user?.organizationId || 'default-admin',
          name: user?.name || 'Coworking Space Operator',
          email: user?.email || 'admin@coworking.com',
          organizationId: {
            _id: user?.organizationId || 'default-org',
            name: 'Primary Coworking Organization'
          }
        }
      ];

  const currentAdmin = selectedAdminId
    ? operatorsList.find((a) => {
        const orgId = typeof a.organizationId === 'object' ? a.organizationId?._id : a.organizationId;
        return a._id === selectedAdminId || orgId === selectedAdminId;
      })
    : null;

  const currentOrgId = currentAdmin
    ? (typeof currentAdmin.organizationId === 'object' ? currentAdmin.organizationId?._id : currentAdmin.organizationId) || currentAdmin._id
    : (user?.organizationId || null);

  const hubsForAdmin = locations.filter((loc) => {
    if (!currentOrgId) return true;
    const locOrgId = typeof loc.organizationId === 'object' ? loc.organizationId?._id : loc.organizationId;
    return String(locOrgId) === String(currentOrgId);
  });

  const currentHub = selectedHubId
    ? locations.find((l) => l._id === selectedHubId)
    : null;

  const companiesForHub = companies.filter((c) => {
    if (!selectedHubId) return true;
    const cLocId = typeof c.locationId === 'object' ? c.locationId?._id : c.locationId;
    return !cLocId || String(cLocId) === String(selectedHubId);
  });

  const currentCompany = selectedCompanyId && selectedCompanyId !== '__GUEST__'
    ? companies.find((c) => c._id === selectedCompanyId)
    : null;

  const hierarchyLeafBookings = filteredBookings.filter((b) => {
    if (selectedCompanyId === '__GUEST__') {
      if (!b.isGuestBooking && b.companyId) return false;
      if (selectedHubId) {
        const bLocId = typeof b.locationId === 'object' ? b.locationId?._id : b.locationId;
        return String(bLocId) === String(selectedHubId);
      }
      return true;
    }
    if (selectedCompanyId) {
      const bCompId = typeof b.companyId === 'object' ? b.companyId?._id : b.companyId;
      return String(bCompId) === String(selectedCompanyId);
    }
    return false;
  });

  const groupedByCompany = companyBookings.reduce((acc: Record<string, { companyName: string; bookings: BookingItem[] }>, b) => {
    const compId = typeof b.companyId === 'object' && b.companyId !== null ? b.companyId._id : (b.companyId || 'unassigned');
    const compName = typeof b.companyId === 'object' && b.companyId !== null ? b.companyId.name : 'Client Company';
    if (!acc[compId]) {
      acc[compId] = { companyName: compName, bookings: [] };
    }
    acc[compId].bookings.push(b);
    return acc;
  }, {});

  const renderBookingRow = (b: BookingItem) => {
    const roomName = typeof b.roomId === 'object' && b.roomId !== null ? b.roomId.name : 'Meeting Room';
    const locName = typeof b.locationId === 'object' && b.locationId !== null ? b.locationId.name : 'Central Hub';
    const booker = b.isGuestBooking
      ? (b.guestName || 'Guest User')
      : (typeof b.bookedByUserId === 'object' && b.bookedByUserId !== null ? b.bookedByUserId.name : 'Team Member');
    const freeHours = b.freeHoursDeducted || b.pricingSnapshot?.freeHoursApplied || 0;
    const chargeableHrs = b.chargeableHours || b.pricingSnapshot?.chargeableHours || 0;
    const totalCharge = b.totalCharge || b.pricingSnapshot?.totalAmount || 0;
    const duration = b.durationHours || Math.round((b.durationMinutes || 60) / 60);

    return (
      <tr key={b._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {b.bookingNumber}
            </span>
            {b.isGuestBooking && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                GUEST
              </span>
            )}
          </div>
          <span className="font-medium text-slate-900 dark:text-white block mt-0.5">
            {b.title}
          </span>
          <span className="text-[11px] text-slate-400">by {booker} ({b.attendeeCount} pax)</span>
        </td>

        <td className="py-3 px-4">
          <span className="font-medium text-slate-800 dark:text-slate-200 block">
            {roomName}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            {locName}
          </span>
          <span className="text-[10px] text-slate-400">
            {b.workspaceType ? b.workspaceType.replace(/_/g, ' ') : 'Workspace'}
          </span>
        </td>

        <td className="py-3 px-4">
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {formatDateIST(b.startTime, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {formatTimeIST(b.startTime)} - {formatTimeIST(b.endTime)} ({duration}h)
          </div>
        </td>

        <td className="py-3 px-4">
          {freeHours > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] block">
              {freeHours}h allowance
            </span>
          ) : null}
          {totalCharge > 0 ? (
            <span className="text-slate-900 dark:text-white font-bold text-xs block">
              {formatCurrency(totalCharge, 'INR')}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] italic">Included in Quota</span>
          )}
        </td>

        <td className="py-3 px-4">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
              b.status === 'CONFIRMED'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                : b.status === 'CHECKED_IN'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : b.status === 'COMPLETED'
                ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            <span>{b.status === 'CHECKED_IN' ? 'In Session' : b.status}</span>
          </span>
          {b.checkedInAt && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1 flex items-center space-x-0.5">
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
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-400 text-[11px] font-semibold transition-colors"
              >
                Check In
              </button>
            )}
            {b.status === 'CONFIRMED' && (
              <button
                onClick={() => openCancelModal(b)}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-400 text-[11px] font-semibold transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Master Reservations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarchical schedule by Coworking Operator, Coworking Spaces, and Client Companies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('HIERARCHY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                viewMode === 'HIERARCHY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hierarchy Explorer</span>
            </button>
            <button
              onClick={() => setViewMode('FEED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                viewMode === 'FEED'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>All Bookings Feed</span>
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book on Behalf</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Bookings</span>
          <span className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 block">
            {bookings.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Oct - Nov 2026</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Upcoming / In-Session</span>
          <span className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400 mt-1 block">
            {totalConfirmedBookings}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active calendar slots</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Completed Sessions</span>
          <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1 block">
            {totalCompletedBookings}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Verified attendances</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Gross Volume</span>
          <span className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(totalGrossAmount, 'INR')}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">Standard INR billing</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {viewMode === 'HIERARCHY' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
            <button
              onClick={() => {
                setSelectedAdminId(null);
                setSelectedHubId(null);
                setSelectedCompanyId(null);
              }}
              className={`flex items-center space-x-1.5 font-bold transition-colors ${
                !selectedAdminId && isSuperAdmin
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'All Coworking Operators' : 'Operator Workspaces'}</span>
            </button>

            {selectedAdminId && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setSelectedHubId(null);
                    setSelectedCompanyId(null);
                  }}
                  className={`font-bold transition-colors ${
                    !selectedHubId
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {currentAdmin?.name || currentAdmin?.organizationId?.name || 'Selected Admin'}
                </button>
              </>
            )}

            {selectedHubId && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setSelectedCompanyId(null)}
                  className={`font-bold transition-colors ${
                    !selectedCompanyId
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {currentHub?.name || 'Selected Hub'}
                </button>
              </>
            )}

            {selectedCompanyId && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedCompanyId === '__GUEST__' ? 'Individual Walk-in Bookings' : (currentCompany?.name || 'Selected Company')}
                </span>
              </>
            )}
          </div>

          {!selectedAdminId && isSuperAdmin ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Step 1: Select Space Operator ({operatorsList.length} Admins)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operatorsList.map((admin) => {
                  const orgId = typeof admin.organizationId === 'object' ? admin.organizationId?._id : admin.organizationId;
                  const adminBookings = bookings.filter((b) => {
                    const bOrgId = typeof b.organizationId === 'object' ? b.organizationId?._id : b.organizationId;
                    return String(bOrgId) === String(orgId) || String(bOrgId) === String(admin._id);
                  });
                  const adminHubs = locations.filter((l) => {
                    const lOrgId = typeof l.organizationId === 'object' ? l.organizationId?._id : l.organizationId;
                    return String(lOrgId) === String(orgId) || String(lOrgId) === String(admin._id);
                  });
                  const adminGross = adminBookings.reduce((sum, b) => sum + (b.pricingSnapshot?.totalAmount || b.totalCharge || 0), 0);

                  return (
                    <div
                      key={admin._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {adminHubs.length} Coworking Spaces
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                          {admin.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {admin.email} • {admin.organizationId?.name || 'Operator Hub'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Reservations</span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block">
                              {adminBookings.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Volume</span>
                            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 block">
                              {formatCurrency(adminGross, 'INR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAdminId(admin._id)}
                        className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Open Coworking Spaces ({adminHubs.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !selectedHubId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Step 2: Select Coworking Space / Facility ({hubsForAdmin.length} Locations)
                </h2>
                {isSuperAdmin && (
                  <button
                    onClick={() => setSelectedAdminId(null)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Operators</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hubsForAdmin.map((hub) => {
                  const hubBookings = bookings.filter((b) => {
                    const bLocId = typeof b.locationId === 'object' ? b.locationId?._id : b.locationId;
                    return String(bLocId) === String(hub._id);
                  });
                  const hubCompanies = companies.filter((c) => {
                    const cLocId = typeof c.locationId === 'object' ? c.locationId?._id : c.locationId;
                    return !cLocId || String(cLocId) === String(hub._id);
                  });
                  const hubRooms = rooms.filter((r) => String(r.locationId) === String(hub._id));

                  return (
                    <div
                      key={hub._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {hubRooms.length} Rooms & Desks
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                          {hub.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {hub.address?.street}, {hub.address?.city}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Client Companies</span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block">
                              {hubCompanies.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Bookings</span>
                            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 block">
                              {hubBookings.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHubId(hub._id)}
                        className="w-full mt-4 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>View Clients & Reservations</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !selectedCompanyId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Step 3: Select Corporate Tenant or Walk-in Group at {currentHub?.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedHubId(null)}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Hubs</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Individual & Walk-in Guest Bookings
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      On-demand day passes and hourly desk passes reserved without corporate company accounts.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCompanyId('__GUEST__')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <span>View Walk-in Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {companiesForHub.map((comp) => {
                  const compBookings = bookings.filter((b) => {
                    const bCompId = typeof b.companyId === 'object' ? b.companyId?._id : b.companyId;
                    return String(bCompId) === String(comp._id);
                  });
                  const compHours = compBookings.reduce((sum, b) => sum + (b.durationHours || 1), 0);

                  return (
                    <div
                      key={comp._id}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">{comp.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {comp.allowanceConfig?.annualFreeHours || 50}h / yr
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{comp.billingEmail}</p>

                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Bookings: <strong className="text-slate-900 dark:text-white">{compBookings.length}</strong></span>
                          <span>Used: <strong className="text-emerald-600">{compHours} hrs</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCompanyId(comp._id)}
                        className="w-full mt-3 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>View Company Bookings ({compBookings.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>
                      {selectedCompanyId === '__GUEST__'
                        ? `Walk-in Guest Passes at ${currentHub?.name}`
                        : `${currentCompany?.name} Reservations (${hierarchyLeafBookings.length})`}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Location: {currentHub?.name || 'Coworking Hub'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCompanyId(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Companies</span>
                </button>
              </div>

              {hierarchyLeafBookings.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No reservations found for this selection matching status "{statusFilter}".
                </div>
              ) : (
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Booking Ref & Title</th>
                          <th className="py-3 px-4">Workspace & Hub</th>
                          <th className="py-3 px-4">Time Window</th>
                          <th className="py-3 px-4">Billing / Quota</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
                        {hierarchyLeafBookings.map(renderBookingRow)}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveFeedTab('COMPANY')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeFeedTab === 'COMPANY'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Reservations ({companyBookings.length})</span>
              </button>

              <button
                onClick={() => setActiveFeedTab('INDIVIDUAL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeFeedTab === 'INDIVIDUAL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Individual / Walk-in ({individualBookings.length})</span>
              </button>

              <button
                onClick={() => setActiveFeedTab('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeFeedTab === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>All Feed ({filteredBookings.length})</span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              {['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
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
              placeholder="Filter by company, guest, hub location, room name, or booking reference..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
          </div>

          {activeFeedTab === 'COMPANY' ? (
            Object.keys(groupedByCompany).length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No corporate client reservations matching current criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedByCompany).map(([compId, data]) => {
                  const isExpanded = expandedCompanies[compId] !== false;
                  const totalFreeHrs = data.bookings.reduce((sum, b) => sum + (b.freeHoursDeducted || b.pricingSnapshot?.freeHoursApplied || 0), 0);
                  const totalCharge = data.bookings.reduce((sum, b) => sum + (b.totalCharge || b.pricingSnapshot?.totalAmount || 0), 0);

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
                              {data.bookings.length} {data.bookings.length === 1 ? 'reservation' : 'reservations'} • {totalFreeHrs}h allowance applied • {formatCurrency(totalCharge, 'INR')} volume
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
                                <th className="py-2.5 px-4">Room & Hub</th>
                                <th className="py-2.5 px-4">Time Window</th>
                                <th className="py-2.5 px-4">Usage</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {data.bookings.map(renderBookingRow)}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Booking Ref & Title</th>
                      <th className="py-3 px-4">Room & Hub</th>
                      <th className="py-3 px-4">Time Window</th>
                      <th className="py-3 px-4">Billing / Quota</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
                    {(activeFeedTab === 'INDIVIDUAL' ? individualBookings : filteredBookings).map(renderBookingRow)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Book Workspace on Behalf
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Company
                </label>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
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
                  Workspace Room
                </label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} (Cap: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Booking Title / Topic
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Product Architecture Sync"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                >
                  {creating ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Cancel Reservation {selectedBooking.bookingNumber}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to cancel this booking? Applied allowance hours will be restored to the company pool.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Rescheduled by client tenant"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
