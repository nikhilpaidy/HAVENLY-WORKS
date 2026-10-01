import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api.js';
import { Building, Plus, MapPin, Globe, DollarSign, Edit3, Phone, Mail, CheckCircle2, Sliders } from 'lucide-react';
import { AlertModal } from '../../components/AlertModal.js';

export const SuperAdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '+91 98450 12345',
    website: 'https://aptaspaces.in',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    street: '100 Feet Road, 4th Block, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560034'
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    website: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    allowOverdraft: true,
    requireBookingApproval: false,
    cancellationNoticeHours: 2
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; title: string; message: string; type?: 'error' | 'success' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  const loadOrgs = () => {
    setLoading(true);
    superAdminApi
      .getOrganizations()
      .then((data) => setOrganizations(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.createOrganization({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        currency: formData.currency,
        timezone: formData.timezone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode
        },
        settings: {
          allowOverdraft: true,
          requireBookingApproval: false,
          cancellationNoticeHours: 2
        }
      });
      setIsModalOpen(false);
      loadOrgs();
      setAlertInfo({
        isOpen: true,
        title: 'Organization Registered',
        message: `${formData.name} was successfully created.`,
        type: 'success'
      });
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Organization Creation Failed',
        message: err.message || 'Failed to create organization. Please verify your details.',
        type: 'error'
      });
    }
  };

  const openEditModal = (org: any) => {
    setEditingOrg(org);
    setEditFormData({
      name: org.name || '',
      slug: org.slug || '',
      email: org.email || '',
      phone: org.phone || '',
      website: org.website || '',
      currency: org.currency || 'INR',
      timezone: org.timezone || 'Asia/Kolkata',
      street: org.address?.street || '',
      city: org.address?.city || 'Bangalore',
      state: org.address?.state || 'Karnataka',
      country: org.address?.country || 'India',
      postalCode: org.address?.postalCode || '560034',
      allowOverdraft: org.settings?.allowOverdraft !== false,
      requireBookingApproval: !!org.settings?.requireBookingApproval,
      cancellationNoticeHours: org.settings?.cancellationNoticeHours || 2
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setSubmittingEdit(true);

    try {
      const payload = {
        name: editFormData.name.trim(),
        slug: editFormData.slug.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        website: editFormData.website.trim(),
        currency: editFormData.currency,
        timezone: editFormData.timezone,
        address: {
          street: editFormData.street.trim(),
          city: editFormData.city.trim(),
          state: editFormData.state.trim(),
          country: editFormData.country.trim(),
          postalCode: editFormData.postalCode.trim()
        },
        settings: {
          allowOverdraft: editFormData.allowOverdraft,
          requireBookingApproval: editFormData.requireBookingApproval,
          cancellationNoticeHours: Number(editFormData.cancellationNoticeHours || 2)
        }
      };

      await superAdminApi.updateOrganization(editingOrg._id, payload);
      setIsEditModalOpen(false);
      setEditingOrg(null);
      loadOrgs();

      setAlertInfo({
        isOpen: true,
        title: 'Organization Updated',
        message: `Saved configuration changes for ${editFormData.name}.`,
        type: 'success'
      });
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Update Failed',
        message: err.message || 'Could not update organization settings.',
        type: 'error'
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-[#C5A880]">
            Multi-Tenant Hierarchy
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Coworking Organizations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure enterprise coworking tenants, regional currency, operational rules, and timezone.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Organization</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-20 text-slate-500">Loading organizations...</div>
        ) : (
          organizations.map((org) => (
            <div
              key={org._id}
              className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-brand-500/50 dark:hover:border-[#C5A880]/50 transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-[#C5A880]/15 text-brand-600 dark:text-[#C5A880] flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {org.currency === 'INR' ? '₹ INR' : org.currency}
                    </span>
                    <button
                      onClick={() => openEditModal(org)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-[#C5A880] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Organization"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {org.name}
                  </h3>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">slug: {org.slug}</div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{org.address?.city || 'Bangalore'}, {org.address?.country || 'India'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Timezone: {org.timezone || 'Asia/Kolkata'}</span>
                  </div>
                  {org.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{org.email}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Overdraft: {org.settings?.allowOverdraft ? 'Allowed' : 'Disabled'}</span>
                <button
                  onClick={() => openEditModal(org)}
                  className="font-bold text-brand-600 dark:text-[#C5A880] hover:underline"
                >
                  Configure Hub →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Organization Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 bg-white dark:bg-[#0e1424] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-[#C5A880]">
                  Tenant Configuration
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Edit Coworking Organization
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Apta Executive Spaces India"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Unique Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    placeholder="apta-spaces-india"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    placeholder="contact@aptaspaces.in"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    placeholder="+91 98450 12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Currency *
                  </label>
                  <select
                    value={editFormData.currency}
                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Primary Timezone *
                  </label>
                  <select
                    value={editFormData.timezone}
                    onChange={(e) => setEditFormData({ ...editFormData, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              {/* Address Fields */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Headquarters Location
                </span>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editFormData.street}
                    onChange={(e) => setEditFormData({ ...editFormData, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    placeholder="100 Feet Road, 4th Block, Koramangala"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      placeholder="Bangalore"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      placeholder="Karnataka"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Country</label>
                    <input
                      type="text"
                      value={editFormData.country}
                      onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      placeholder="India"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={editFormData.postalCode}
                      onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      placeholder="560034"
                    />
                  </div>
                </div>
              </div>

              {/* Operational Policies */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Operational Booking Policies
                </span>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="overdraftPolicy"
                      checked={editFormData.allowOverdraft}
                      onChange={(e) => setEditFormData({ ...editFormData, allowOverdraft: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 border-slate-300"
                    />
                    <label htmlFor="overdraftPolicy" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      Allow Overdraft (Let clients book past free allowance with automatic overage billing)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="approvalPolicy"
                      checked={editFormData.requireBookingApproval}
                      onChange={(e) => setEditFormData({ ...editFormData, requireBookingApproval: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 border-slate-300"
                    />
                    <label htmlFor="approvalPolicy" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      Require Booking Approval (Operator must confirm reservations)
                    </label>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Free Cancellation Window (Hours before start)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    value={editFormData.cancellationNoticeHours}
                    onChange={(e) => setEditFormData({ ...editFormData, cancellationNoticeHours: Number(e.target.value) })}
                    className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
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
                  {submittingEdit ? 'Saving...' : 'Save Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Organization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 bg-white dark:bg-[#0e1424]">
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Create Coworking Organization
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g. Apta Executive Spaces India"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="contact@aptaspaces.in"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Billing Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Primary Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold"
                >
                  Register Organization
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
