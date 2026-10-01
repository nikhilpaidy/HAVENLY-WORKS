import React, { useState, useEffect } from 'react';
import { staffApi } from '../../services/api.js';
import {
  Users,
  Shield,
  Plus,
  CheckCircle2,
  X,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail
} from 'lucide-react';

const CLIENT_STAFF_PERMISSIONS = [
  { key: 'book_rooms', label: 'Reserve Meeting Rooms', desc: 'Book executive suites & pods using the company quota pool.' },
  { key: 'view_allowance', label: 'Inspect Quota Ledgers', desc: 'View monthly complimentary hour balance and consumption statements.' },
  { key: 'raise_tickets', label: 'Raise Facilities Helpdesk', desc: 'Submit and follow up on complaints regarding WiFi, AC, or pantry.' }
];

export const ClientStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'book_rooms',
    'view_allowance',
    'raise_tickets'
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Edit Permissions
  const [editStaff, setEditStaff] = useState<any | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getStaff();
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load company staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    try {
      setSubmitting(true);
      await staffApi.createStaff({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        designation: designation.trim() || undefined,
        permissions: selectedPermissions
      });
      setIsAddOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setDesignation('');
      setSuccessMsg('Team member onboarded with designated access privileges.');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to onboard team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!editStaff) return;
    try {
      setUpdating(true);
      await staffApi.updateStaffPermissions(editStaff._id, editPermissions);
      setEditStaff(null);
      setSuccessMsg('Team privileges updated. Changes apply live without logout.');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to update privileges');
    } finally {
      setUpdating(false);
    }
  };

  const togglePermission = (key: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditPermissions((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      setSelectedPermissions((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Corporate Team Hierarchy
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Company Team & Staff Privileges
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Delegate meeting room booking and facilities management privileges to HR and operational personnel.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading company team members...</div>
      ) : staffList.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No company staff delegated
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Add team members to allow booking rooms or submitting facilities requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff._id}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-[#B6925A]/10 text-[#B6925A] dark:text-[#C5A880]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Team Member
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                  {staff.name}
                </h3>
                {staff.designation && (
                  <span className="text-xs font-semibold text-[#B6925A] dark:text-[#C5A880] block mt-0.5">
                    {staff.designation}
                  </span>
                )}

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.email}</span>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Granted Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {staff.permissions && staff.permissions.length > 0 ? (
                      staff.permissions.map((pKey: string) => {
                        const match = CLIENT_STAFF_PERMISSIONS.find((x) => x.key === pKey);
                        return (
                          <span
                            key={pKey}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#B6925A]/10 text-[#B6925A] dark:text-[#C5A880] border border-[#B6925A]/20 flex items-center space-x-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{match ? match.label : pKey}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                <button
                  onClick={() => {
                    setEditStaff(staff);
                    setEditPermissions(staff.permissions || []);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#B6925A] dark:text-[#C5A880] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Configure Privileges</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Company Team Member
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ananya Deshmukh"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@aptapace.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Secure password"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 55667"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="People & Culture Partner"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Access Privileges
                </label>
                <div className="space-y-2">
                  {CLIENT_STAFF_PERMISSIONS.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => togglePermission(perm.key, false)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'border-[#B6925A] bg-[#B6925A]/5'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-[#B6925A]"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {perm.label}
                          </span>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            {perm.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold"
                >
                  {submitting ? 'Adding...' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Configure Team Member Privileges
                </h3>
                <span className="text-xs text-[#B6925A] dark:text-[#C5A880]">
                  {editStaff.name} ({editStaff.email})
                </span>
              </div>
              <button
                onClick={() => setEditStaff(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 italic">
              Privilege modifications sync automatically to active sessions without requiring the staff member to log out.
            </p>

            <div className="space-y-2">
              {CLIENT_STAFF_PERMISSIONS.map((perm) => {
                const isSelected = editPermissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key, true)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-[#B6925A] bg-[#B6925A]/5'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-[#B6925A]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {perm.label}
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        {perm.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditStaff(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold"
              >
                {updating ? 'Saving...' : 'Save Privileges'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
