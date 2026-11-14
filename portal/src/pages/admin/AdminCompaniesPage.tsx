import React, { useEffect, useState } from 'react';
import { adminApi, staffApi } from '../../services/api.js';
import {
  Building2,
  Users,
  Clock,
  KeyRound,
  Plus,
  Sliders,
  UserPlus,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Mail,
  Shield,
  Edit2
} from 'lucide-react';

interface Company {
  _id: string;
  name: string;
  slug: string;
  domain?: string;
  gstin?: string;
  panNumber?: string;
  verificationStatus?: string;
  locationId?: {
    _id: string;
    name: string;
  } | string;
  allowanceConfig: {
    monthlyFreeHours: number;
    annualFreeHours?: number;
    allowancePeriodType?: string;
    extraHourRate?: number;
    additionalHourlyRate?: number;
    currency: string;
    resetDayOfMonth?: number;
  };
  isActive: boolean;
  createdAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Onboard modal
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [annualFreeHours, setAnnualFreeHours] = useState(240);
  const [extraRate, setExtraRate] = useState(500);
  const [currency, setCurrency] = useState('INR');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [submittingOnboard, setSubmittingOnboard] = useState(false);

  // Allowance adjust modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [adjustmentHours, setAdjustmentHours] = useState<number>(5);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Edit company modal
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyDomain, setEditCompanyDomain] = useState('');
  const [editLocationId, setEditLocationId] = useState('');
  const [editAnnualFreeHours, setEditAnnualFreeHours] = useState<number>(240);
  const [editMonthlyFreeHours, setEditMonthlyFreeHours] = useState<number>(20);
  const [editExtraRate, setEditExtraRate] = useState<number>(500);
  const [editGstin, setEditGstin] = useState('');
  const [editPanNumber, setEditPanNumber] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [submittingEditCompany, setSubmittingEditCompany] = useState(false);

  // Password reset modal
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetCompany, setResetCompany] = useState<Company | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submittingReset, setSubmittingReset] = useState(false);

  // Members modal
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('EMPLOYEE');
  const [submittingMember, setSubmittingMember] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const [compData, locData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getLocations()
      ]);
      setCompanies(compData);
      setLocations(locData);
      if (locData.length > 0 && !selectedLocationId) {
        setSelectedLocationId(locData[0]._id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openOnboardModal = () => {
    setCompanyName('');
    setCompanyDomain('');
    setAnnualFreeHours(240);
    setExtraRate(500);
    setCurrency('INR');
    setOwnerName('');
    setOwnerEmail('');
    setGstin('');
    setPanNumber('');
    if (locations.length > 0) {
      setSelectedLocationId(locations[0]._id);
    }
    setIsOnboardOpen(true);
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOnboard(true);
    setError(null);

    try {
      await adminApi.createCompany({
        name: companyName,
        domain: companyDomain,
        locationId: selectedLocationId,
        gstin: gstin.trim() || undefined,
        panNumber: panNumber.trim() || undefined,
        allowanceConfig: {
          allowancePeriodType: 'ANNUAL',
          annualFreeHours: Number(annualFreeHours),
          monthlyFreeHours: Math.round(Number(annualFreeHours) / 12),
          additionalHourlyRate: Number(extraRate),
          currency: 'INR',
          billingCycleStartDay: 1
        },
        ownerName,
        ownerEmail
      });
      setIsOnboardOpen(false);
      setSuccessMsg(`Successfully onboarded ${companyName}`);
      fetchCompanies();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to onboard company');
    } finally {
      setSubmittingOnboard(false);
    }
  };

  const openAdjustModal = (company: Company) => {
    setSelectedCompany(company);
    setAdjustmentHours(5);
    setAdjustNotes('');
    setIsAdjustOpen(true);
  };

  const openEditCompanyModal = (company: Company) => {
    setEditingCompany(company);
    setEditCompanyName(company.name);
    setEditCompanyDomain(company.domain || '');
    const locId = typeof company.locationId === 'object' && company.locationId !== null
      ? company.locationId._id
      : (company.locationId || '');
    setEditLocationId(locId);
    setEditAnnualFreeHours(company.allowanceConfig?.annualFreeHours || 240);
    setEditMonthlyFreeHours(company.allowanceConfig?.monthlyFreeHours || 20);
    setEditExtraRate(company.allowanceConfig?.extraHourRate || company.allowanceConfig?.additionalHourlyRate || 500);
    setEditGstin(company.gstin || '');
    setEditPanNumber(company.panNumber || '');
    setEditIsActive(company.isActive);
    setIsEditCompanyOpen(true);
  };

  const handleEditCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editCompanyName.trim()) return;

    setSubmittingEditCompany(true);
    setError(null);
    try {
      await adminApi.updateCompany(editingCompany._id, {
        name: editCompanyName.trim(),
        domain: editCompanyDomain.trim() || undefined,
        locationId: editLocationId || undefined,
        gstin: editGstin.trim() || undefined,
        panNumber: editPanNumber.trim() || undefined,
        allowanceConfig: {
          ...editingCompany.allowanceConfig,
          annualFreeHours: Number(editAnnualFreeHours),
          monthlyFreeHours: Number(editMonthlyFreeHours),
          extraHourRate: Number(editExtraRate),
          additionalHourlyRate: Number(editExtraRate)
        },
        isActive: editIsActive
      });
      setIsEditCompanyOpen(false);
      setEditingCompany(null);
      setSuccessMsg('Client company profile updated successfully');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchCompanies();
    } catch (err: any) {
      setError(err.message || 'Failed to update company');
    } finally {
      setSubmittingEditCompany(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setSubmittingAdjust(true);
    setError(null);

    try {
      await adminApi.adjustCompanyAllowance({
        companyId: selectedCompany._id,
        hours: Number(adjustmentHours),
        notes: adjustNotes
      });
      setIsAdjustOpen(false);
      setSuccessMsg(`Allowance for ${selectedCompany.name} adjusted by ${adjustmentHours} hrs`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to adjust company allowance');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const openResetPasswordModal = (company: Company) => {
    setResetCompany(company);
    setNewPassword('');
    setIsResetPasswordOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCompany || !newPassword.trim()) return;
    setSubmittingReset(true);
    setError(null);

    try {
      await staffApi.resetClientPassword(resetCompany._id, newPassword.trim());
      setIsResetPasswordOpen(false);
      setSuccessMsg(`Primary owner password for ${resetCompany.name} has been successfully reset.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset client password');
    } finally {
      setSubmittingReset(false);
    }
  };

  const openMembersModal = async (company: Company) => {
    setSelectedCompany(company);
    setIsMembersOpen(true);
    setLoadingMembers(true);
    try {
      const data = await adminApi.getCompanyMembers(company._id);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load company members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setSubmittingMember(true);
    setError(null);

    try {
      await adminApi.addCompanyMember(selectedCompany._id, {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole
      });
      setNewMemberName('');
      setNewMemberEmail('');
      const updated = await adminApi.getCompanyMembers(selectedCompany._id);
      setMembers(updated);
      setSuccessMsg('Member added successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setSubmittingMember(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Tenancy Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Client Companies & Quotas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Onboard client companies, configure monthly free-hour pools, and manage team members.
          </p>
        </div>

        <button
          onClick={openOnboardModal}
          className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Client</span>
        </button>
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

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading client companies...</div>
      ) : companies.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No client companies onboarded
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Onboard enterprise teams to grant free monthly meeting room allowances.
          </p>
          <button
            onClick={openOnboardModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-semibold"
          >
            Onboard First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:border-[#B6925A]/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[#B6925A] dark:text-[#C5A880]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      company.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {company.isActive ? 'Active Plan' : 'Suspended'}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-4">
                  {company.name}
                </h3>
                {company.domain && (
                  <span className="text-xs text-slate-400 block mt-0.5">@{company.domain}</span>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Assigned Hub:</span>
                  <span className="font-semibold underline">
                    {typeof company.locationId === 'object' && company.locationId !== null
                      ? company.locationId.name
                      : 'All Hub Locations'}
                  </span>
                </div>

                {/* Allowance Config Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 space-y-2 border border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Annual Free Quota:</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {company.allowanceConfig?.annualFreeHours || 0} hrs / yr
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center space-x-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Overage Rate:</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{company.allowanceConfig?.extraHourRate || company.allowanceConfig?.additionalHourlyRate || 0}/hr
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                    <span className="text-slate-500 flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>GSTIN Compliance:</span>
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {company.gstin || 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openEditCompanyModal(company)}
                    className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => openMembersModal(company)}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Team</span>
                  </button>

                  <button
                    onClick={() => openResetPasswordModal(company)}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:opacity-80 flex items-center space-x-1"
                    title="Reset Client Company Account Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Pwd</span>
                  </button>
                </div>

                <button
                  onClick={() => openAdjustModal(company)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-[#B6925A] dark:text-[#C5A880]"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Adjust Quota</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditCompanyOpen && editingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Edit Client Company: {editingCompany.name}</span>
              </h2>
              <button
                onClick={() => setIsEditCompanyOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCompanySubmit} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Corporate Domain
                  </label>
                  <input
                    type="text"
                    value={editCompanyDomain}
                    onChange={(e) => setEditCompanyDomain(e.target.value)}
                    placeholder="e.g. acme.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Assigned Hub Location
                  </label>
                  <select
                    value={editLocationId}
                    onChange={(e) => setEditLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="">No Location Assigned</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Annual Free Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editAnnualFreeHours}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditAnnualFreeHours(val);
                      setEditMonthlyFreeHours(Math.round(val / 12));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Extra Hour Rate (₹ / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editExtraRate}
                    onChange={(e) => setEditExtraRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    GSTIN Identifier
                  </label>
                  <input
                    type="text"
                    value={editGstin}
                    onChange={(e) => setEditGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 36AABCA1234F1Z5"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={editPanNumber}
                    onChange={(e) => setEditPanNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editCompanyActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <label htmlFor="editCompanyActive" className="text-xs text-slate-700 dark:text-slate-300">
                  Active (allows company members to book rooms using monthly allowance)
                </label>
              </div>

              <div className="pt-2.5 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditCompanyOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEditCompany}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-opacity disabled:opacity-50"
                >
                  {submittingEditCompany ? 'Saving...' : 'Update Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Company Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Onboard Client Company
              </h2>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Aptapace Technologies"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Coworking Hub / Location *
                  </label>
                  <select
                    required
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name} ({loc.address?.city || 'Hyderabad'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    This company will only see and reserve meeting spaces belonging to this registered location.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Domain
                  </label>
                  <input
                    type="text"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="aptapace.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Annual Free Hours (Yearly Quota) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={annualFreeHours}
                    onChange={(e) => setAnnualFreeHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Extra Hour Rate ($/hr) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={extraRate}
                    onChange={(e) => setExtraRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Company Primary Owner / Contact
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Marcus Chen"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="marcus.chen@nexusai.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOnboard}
                  className="px-5 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {submittingOnboard ? 'Onboarding...' : 'Confirm & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Allowance Modal */}
      {isAdjustOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Adjust Quota Allowance
                </h2>
                <span className="text-xs text-slate-500">{selectedCompany.name}</span>
              </div>
              <button
                onClick={() => setIsAdjustOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hours to Grant (positive) or Deduct (negative) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={adjustmentHours}
                  onChange={(e) => setAdjustmentHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Example: enter 5 to grant 5 complimentary hours, or -2 to deduct.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Audit Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Compensation for network maintenance window on Tuesday."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-5 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {submittingAdjust ? 'Updating Ledger...' : 'Post Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {isMembersOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Team Members
                </h2>
                <span className="text-xs text-slate-500">{selectedCompany.name}</span>
              </div>
              <button
                onClick={() => setIsMembersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Member list */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Current Registered Members
                </h4>
                {loadingMembers ? (
                  <div className="text-center py-6 text-slate-400 text-xs">Loading members...</div>
                ) : members.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No members found.</div>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div
                        key={m._id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{m.email}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#B6925A]/10 text-[#B6925A] dark:text-[#C5A880] border border-[#B6925A]/20">
                          {m.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add member form */}
              <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Add New Team Member
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <option value="EMPLOYEE">Employee (Book with Allowance)</option>
                    <option value="COMPANY_BOOKING_MANAGER">Booking Manager (Full Team Access)</option>
                    <option value="COMPANY_OWNER">Company Owner (Billing & Allowance Admin)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={submittingMember}
                    className="px-4 py-2 rounded-lg bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold hover:opacity-95 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Client Password Modal */}
      {isResetPasswordOpen && resetCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Client Password
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {resetCompany.name} (Primary Owner)
                </p>
              </div>
              <button
                onClick={() => setIsResetPasswordOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter temporary password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  The client company primary owner account will be updated with this password immediately.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReset}
                  className="px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold hover:opacity-95 disabled:opacity-50"
                >
                  {submittingReset ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
