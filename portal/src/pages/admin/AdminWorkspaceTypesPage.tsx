import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useAuth, UserRole } from '../../context/AuthContext.js';
import {
  Layers,
  Plus,
  Users,
  Clock,
  AlertCircle,
  X,
  Trash2,
  Briefcase,
  DoorOpen,
  Lock,
  Globe,
  Building2,
  Edit2
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

interface WorkspaceTypeItem {
  _id: string;
  organizationId?: string | { _id: string; name: string };
  name: string;
  code: string;
  description?: string;
  icon?: string;
  capacityDefault: number;
  hourlyRateDefault: number;
  roomCount: number;
  scopedLocationId?: string;
  isActive: boolean;
}

export const AdminWorkspaceTypesPage: React.FC = () => {
  const { user } = useAuth();
  const [types, setTypes] = useState<WorkspaceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCode, setAddCode] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addCapacityDefault, setAddCapacityDefault] = useState<number | ''>('');
  const [addHourlyRateDefault, setAddHourlyRateDefault] = useState<number | ''>('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<WorkspaceTypeItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCapacityDefault, setEditCapacityDefault] = useState<number>(4);
  const [editHourlyRateDefault, setEditHourlyRateDefault] = useState<number>(500);
  const [editIsActive, setEditIsActive] = useState(true);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getWorkspaceTypes();
      setTypes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace types');
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SUPER_ADMIN_STAFF;

  const canManageType = (type: WorkspaceTypeItem) => {
    if (isSuperAdmin) return true;
    const orgId = typeof type.organizationId === 'object' && type.organizationId !== null
      ? type.organizationId._id
      : type.organizationId;
    return Boolean(orgId && user?.organizationId && orgId === user.organizationId);
  };

  const openAddModal = () => {
    setAddName('');
    setAddCode('');
    setAddDescription('');
    setAddCapacityDefault('');
    setAddHourlyRateDefault('');
    setIsAddModalOpen(true);
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    try {
      setSubmittingAdd(true);
      await adminApi.createWorkspaceType({
        name: addName.trim(),
        code: addCode.trim() || undefined,
        description: addDescription.trim() || undefined,
        capacityDefault: addCapacityDefault ? Number(addCapacityDefault) : 4,
        hourlyRateDefault: addHourlyRateDefault ? Number(addHourlyRateDefault) : 500
      });
      setIsAddModalOpen(false);
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace type');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const openEditModal = (type: WorkspaceTypeItem) => {
    setEditingType(type);
    setEditName(type.name);
    setEditCode(type.code);
    setEditDescription(type.description || '');
    setEditCapacityDefault(type.capacityDefault || 4);
    setEditHourlyRateDefault(type.hourlyRateDefault || 500);
    setEditIsActive(type.isActive);
    setIsEditModalOpen(true);
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !editName.trim()) return;

    try {
      setSubmittingEdit(true);
      await adminApi.updateWorkspaceType(editingType._id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        capacityDefault: Number(editCapacityDefault),
        hourlyRateDefault: Number(editHourlyRateDefault),
        isActive: editIsActive
      });
      setIsEditModalOpen(false);
      setEditingType(null);
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to update workspace type');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate "${name}"?`)) return;
    try {
      await adminApi.deleteWorkspaceType(id);
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to remove workspace type');
    }
  };

  const totalRooms = types.reduce((acc, t) => acc + (t.roomCount || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Workspace Types & Layouts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure room classifications, standard capacities, and default hourly pricing.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Workspace Type</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Types</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{types.length}</p>
          <span className="text-[10px] text-slate-400">Configured categories</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Inventory</span>
            <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{totalRooms}</p>
          <span className="text-[10px] text-slate-400">Assigned units</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Max Capacity</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {types.length > 0 ? Math.max(...types.map((t) => t.capacityDefault || 1)) : 0} Seats
          </p>
          <span className="text-[10px] text-slate-400">Largest layout</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Starting Rate</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {types.length > 0
              ? formatCurrency(Math.min(...types.map((t) => t.hourlyRateDefault || 150)))
              : '₹0'}
          </p>
          <span className="text-[10px] text-slate-400">Per hour standard</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
          Loading workspace types...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {types.map((type) => {
            const orgId = typeof type.organizationId === 'object' && type.organizationId !== null
              ? type.organizationId._id
              : type.organizationId;
            const isGlobal = !orgId;
            const canManage = canManageType(type);

            return (
              <div
                key={type._id}
                className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-xs">
                          {type.name}
                        </h3>
                        <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {type.code}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      {isGlobal ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                          <Globe className="w-2.5 h-2.5" />
                          Platform Standard
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <Building2 className="w-2.5 h-2.5" />
                          Hub Custom
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {type.roomCount || 0} {type.roomCount === 1 ? 'room' : 'rooms'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[28px] mb-2.5 leading-relaxed">
                    {type.description || 'Configured for high-performance coworking.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Default Capacity</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                        {type.capacityDefault || 1} {type.capacityDefault === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hourly Rate</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                        {formatCurrency(type.hourlyRateDefault || 0)} / hr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Status: <span className={type.isActive ? 'text-emerald-600 font-medium' : 'text-slate-400'}>{type.isActive ? 'Active' : 'Inactive'}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    {canManage ? (
                      <>
                        <button
                          onClick={() => openEditModal(type)}
                          className="px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-medium flex items-center space-x-1 transition-colors"
                          title="Edit Workspace Type"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(type._id, type.name)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          title="Deactivate Type"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-1 py-0.5" title="Platform standard managed by Super Admin">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Add Workspace Type {isSuperAdmin ? '(Platform Standard)' : '(Hub Custom)'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateType} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phone Booth, Podcast Studio, Team Pod"
                  value={addName}
                  onChange={(e) => {
                    setAddName(e.target.value);
                    if (!addCode) {
                      setAddCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  System Identifier Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. PHONE_BOOTH"
                  value={addCode}
                  onChange={(e) => setAddCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Default Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 4"
                    value={addCapacityDefault}
                    onChange={(e) => setAddCapacityDefault(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Default Rate (₹ / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="e.g. 500"
                    value={addHourlyRateDefault}
                    onChange={(e) => setAddHourlyRateDefault(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline who this space is for and what amenities are included..."
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {submittingAdd ? 'Saving...' : 'Save Workspace Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Edit Workspace Type: {editingType.name}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateType} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Type Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  System Identifier Code
                </label>
                <input
                  type="text"
                  disabled
                  value={editCode}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Default Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editCapacityDefault}
                    onChange={(e) => setEditCapacityDefault(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Default Rate (₹ / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editHourlyRateDefault}
                    onChange={(e) => setEditHourlyRateDefault(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <label htmlFor="editIsActive" className="text-xs text-slate-700 dark:text-slate-300">
                  Active (available for new rooms and inventory allocation)
                </label>
              </div>

              <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {submittingEdit ? 'Saving...' : 'Update Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
