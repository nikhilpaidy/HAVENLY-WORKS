import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api.js';
import {
  Plus,
  CheckCircle,
  XCircle,
  Search,
  Building,
  Edit3,
  Lock,
  ChevronDown,
  ChevronUp,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { AlertModal } from '../../components/AlertModal.js';
import { formatCurrency } from '../../utils/formatters.js';

export const SuperAdminAdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationId: '',
    phone: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organizationId: '',
    password: '',
    isActive: true
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [alertInfo, setAlertInfo] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminList, orgList] = await Promise.all([
        superAdminApi.getAdmins(),
        superAdminApi.getOrganizations()
      ]);
      setAdmins(adminList || []);
      setOrganizations(orgList || []);
      if (orgList && orgList.length > 0 && !formData.organizationId) {
        setFormData((prev) => ({ ...prev, organizationId: orgList[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await superAdminApi.toggleUserStatus(id);
      setAdmins((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isActive: !a.isActive } : a))
      );
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Status Update Failed',
        message: err.message || 'Could not update user status.',
        type: 'error'
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.createAdmin(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        organizationId: organizations[0]?._id || '',
        phone: ''
      });
      loadData();
      setAlertInfo({
        isOpen: true,
        title: 'Admin Provisioned',
        message: `Admin account for ${formData.name} was successfully created.`,
        type: 'success'
      });
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Account Creation Failed',
        message: err.message || 'Failed to create coworking admin account. Please verify input.',
        type: 'error'
      });
    }
  };

  const openEditModal = (admin: any) => {
    setEditingAdmin(admin);
    const orgId =
      typeof admin.organizationId === 'object' && admin.organizationId !== null
        ? admin.organizationId._id
        : admin.organizationId || (organizations[0]?._id || '');

    setEditFormData({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      organizationId: orgId,
      password: '',
      isActive: admin.isActive !== false
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setSubmittingEdit(true);

    try {
      const payload: any = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        organizationId: editFormData.organizationId,
        isActive: editFormData.isActive
      };
      if (editFormData.password && editFormData.password.trim().length > 0) {
        payload.password = editFormData.password.trim();
      }

      await superAdminApi.updateAdmin(editingAdmin._id, payload);
      setIsEditModalOpen(false);
      setEditingAdmin(null);
      await loadData();

      setAlertInfo({
        isOpen: true,
        title: 'Admin Profile Updated',
        message: `Successfully saved profile updates for ${editFormData.name}.`,
        type: 'success'
      });
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Update Failed',
        message:
          err.message ||
          'Failed to update administrator profile. Check for duplicate emails or invalid organization.',
        type: 'error'
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.organizationId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalGrossRevenue = admins.reduce(
    (acc, a) => acc + (a.financials?.grossRevenue || 0),
    0
  );
  const totalPlatformCut = admins.reduce(
    (acc, a) => acc + (a.financials?.platformFee || 0),
    0
  );
  const totalAdminEarnings = admins.reduce(
    (acc, a) => acc + (a.financials?.adminNetEarnings || 0),
    0
  );
  const totalSettledPayouts = admins.reduce(
    (acc, a) => acc + (a.financials?.settledAmount || 0),
    0
  );
  const totalPendingPayouts = admins.reduce(
    (acc, a) => acc + (a.financials?.pendingPayout || 0),
    0
  );
  const totalHubsCount = admins.reduce(
    (acc, a) => acc + (a.locations?.length || 0),
    0
  );
  const totalCompaniesCount = admins.reduce(
    (acc, a) => acc + (a.companies?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-[#C5A880]">
            Platform Governance
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Coworking Admins & Operating Hubs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage regional coworking operators, hub facilities, corporate tenants, and revenue split settlements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Admin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Platform Gross
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {formatCurrency(totalGrossRevenue, 'INR')}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Across {admins.length} operators ({totalHubsCount} hubs)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-[#C5A880]">
              Platform Revenue Share (10%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-[#C5A880] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-brand-600 dark:text-[#C5A880] font-display">
            {formatCurrency(totalPlatformCut, 'INR')}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            HavenlyWork gross take-rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operator Payouts (90%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {formatCurrency(totalAdminEarnings, 'INR')}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Net payable to coworking partners
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Settlement Health
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            Settled: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSettledPayouts, 'INR')}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Pending Clearance: {formatCurrency(totalPendingPayouts, 'INR')}
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by admin name, email, or hub..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 dark:focus:border-[#C5A880] transition-colors"
        />
      </div>

      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">Admin Name</th>
                <th className="py-3.5 px-6">Organization & Scale</th>
                <th className="py-3.5 px-6">Gross Volume (INR)</th>
                <th className="py-3.5 px-6">Platform (10%) / Admin (90%)</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading administrators...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No coworking administrators found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((a) => {
                  const fin = a.financials || {
                    grossRevenue: 0,
                    platformFee: 0,
                    adminNetEarnings: 0,
                    settledAmount: 0,
                    pendingPayout: 0,
                    totalBookings: 0,
                    totalHours: 0
                  };
                  return (
                    <React.Fragment key={a._id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span>{a.name}</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {a.email}
                          </div>
                          {a.phone && (
                            <div className="text-slate-400 text-[10px]">
                              {a.phone}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {a.organizationId?.name || 'Unassigned'}
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {a.locations?.length || 0} Hubs • {a.companies?.length || 0} Companies
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(fin.grossRevenue, 'INR')}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            {fin.totalBookings} Bookings • {fin.totalHours} hrs
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-brand-600 dark:text-[#C5A880]">
                              10%: {formatCurrency(fin.platformFee, 'INR')}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              90%: {formatCurrency(fin.adminNetEarnings, 'INR')}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Settled: {formatCurrency(fin.settledAmount, 'INR')} • Pending: {formatCurrency(fin.pendingPayout, 'INR')}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {a.isActive ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              <XCircle className="w-3 h-3" />
                              <span>Suspended</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                setExpandedAdminId(
                                  expandedAdminId === a._id ? null : a._id
                                )
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center space-x-1"
                            >
                              <span>
                                {expandedAdminId === a._id
                                  ? 'Hide Details'
                                  : `View Details (${a.locations?.length || 0})`}
                              </span>
                              {expandedAdminId === a._id ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(a)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(a._id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                a.isActive
                                  ? 'text-rose-500 hover:bg-rose-500/10'
                                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {a.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedAdminId === a._id && (
                        <tr
                          key={`${a._id}-expanded`}
                          className="bg-slate-50/60 dark:bg-slate-800/40"
                        >
                          <td
                            colSpan={6}
                            className="p-6 border-b border-slate-200 dark:border-slate-800"
                          >
                            <div className="space-y-6">
                              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                  Financial Revenue Bifurcation & Operator Payouts
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                      Gross Volume
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                                      {formatCurrency(fin.grossRevenue, 'INR')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      {fin.totalBookings} bookings
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <div className="text-[10px] text-brand-600 dark:text-[#C5A880] uppercase font-semibold">
                                      Platform Fee (10%)
                                    </div>
                                    <div className="text-sm font-extrabold text-brand-600 dark:text-[#C5A880] mt-1">
                                      {formatCurrency(fin.platformFee, 'INR')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      Retained by HavenlyWork
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                                      Operator Net (90%)
                                    </div>
                                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                      {formatCurrency(fin.adminNetEarnings, 'INR')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      Net earned by operator
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                      Settled Payout (80%)
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                                      {formatCurrency(fin.settledAmount, 'INR')}
                                    </div>
                                    <div className="text-[10px] text-emerald-500 mt-0.5">
                                      Transferred to bank
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                      Pending Balance
                                    </div>
                                    <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                                      {formatCurrency(fin.pendingPayout, 'INR')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      Next cycle clearance
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Building className="w-4 h-4 text-emerald-600" />
                                    Managed Coworking Spaces & Hubs ({a.locations?.length || 0})
                                  </h4>
                                </div>
                                {!a.locations || a.locations.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">
                                    No coworking locations added yet.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {a.locations.map((loc: any) => (
                                      <div
                                        key={loc._id}
                                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <h5 className="font-semibold text-slate-900 dark:text-white text-xs">
                                            {loc.name}
                                          </h5>
                                          <span className="flex items-center text-[11px] font-bold text-emerald-600">
                                            <Star className="w-3 h-3 fill-emerald-500 mr-0.5" />
                                            {loc.rating || 4.9}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                          {loc.address?.street}, {loc.address?.city}
                                        </p>
                                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                                          <span>
                                            Manager:{' '}
                                            <strong className="text-slate-700 dark:text-slate-300">
                                              {loc.managerName || 'Olivia'}
                                            </strong>
                                          </span>
                                          <span>{loc.managerPhone || '+91 98450 12345'}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                    Registered Client Companies ({a.companies?.length || 0})
                                  </h4>
                                </div>
                                {!a.companies || a.companies.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">
                                    No client companies registered yet.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {a.companies.map((comp: any) => (
                                      <div
                                        key={comp._id}
                                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
                                      >
                                        <div>
                                          <h5 className="font-semibold text-slate-900 dark:text-white text-xs">
                                            {comp.name}
                                          </h5>
                                          <span className="inline-block text-[10px] text-slate-400">
                                            Assigned Hub:{' '}
                                            <strong className="text-emerald-600 dark:text-emerald-400">
                                              {comp.locationId?.name || 'Primary Hub'}
                                            </strong>
                                          </span>
                                          <div className="text-[11px] text-slate-500 mt-0.5">
                                            {comp.billingEmail} • {comp.phone}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                            {comp.allowanceConfig?.annualFreeHours || 50}h / yr
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 bg-white dark:bg-[#0e1424]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-[#C5A880]">
                  Operator Management
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Edit Coworking Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Apta Administrator"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  placeholder="admin@apta.in"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  placeholder="+91 98450 12345"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Assigned Coworking Hub *
                </label>
                <select
                  required
                  value={editFormData.organizationId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      organizationId: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-600 dark:text-[#C5A880]" />
                  <span>Reset Password (Optional)</span>
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  placeholder="Leave blank to keep existing password"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter a new password (min 6 characters) only if you wish to override the admin password.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editFormData.isActive}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      isActive: e.target.checked
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 dark:border-slate-700 focus:ring-brand-500"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Account is Active (Grant immediate system login access)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submittingEdit ? 'Saving...' : 'Save Admin Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 bg-white dark:bg-[#0e1424]">
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Provision Coworking Administrator
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g. Apta Administrator"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="admin@apta.in"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Assigned Coworking Hub *
                </label>
                <select
                  required
                  value={formData.organizationId}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="+91 98450 12345"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
      />
    </div>
  );
};
