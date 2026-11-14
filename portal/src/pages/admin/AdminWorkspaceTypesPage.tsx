import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useAuth, UserRole } from '../../context/AuthContext.js';
import {
  Layers,
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Briefcase,
  DoorOpen,
  Lock,
  Globe,
  Building2
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

interface WorkspaceTypeItem {
  _id: string;
  organizationId?: string;
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [capacityDefault, setCapacityDefault] = useState(4);
  const [hourlyRateDefault, setHourlyRateDefault] = useState(500);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await adminApi.createWorkspaceType({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        capacityDefault: Number(capacityDefault),
        hourlyRateDefault: Number(hourlyRateDefault)
      });
      setIsModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace type');
    } finally {
      setSubmitting(false);
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

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SUPER_ADMIN_STAFF;
  const totalRooms = types.reduce((acc, t) => acc + (t.roomCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Workspace Types
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard categories and custom workspace definitions for meeting rooms and desks.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Workspace Type
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Types</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{types.length}</p>
          <span className="text-[11px] text-slate-400">Configured categories</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Inventory</span>
            <DoorOpen className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalRooms}</p>
          <span className="text-[11px] text-slate-400">Assigned rooms & desks</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Max Capacity</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {types.length > 0 ? Math.max(...types.map((t) => t.capacityDefault || 1)) : 0} Seats
          </p>
          <span className="text-[11px] text-slate-400">Largest layout</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Starting Rate</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {types.length > 0
              ? formatCurrency(Math.min(...types.map((t) => t.hourlyRateDefault || 150)))
              : '₹0'}
          </p>
          <span className="text-[11px] text-slate-400">Per hour standard</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-3" />
          Loading workspace categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((type) => {
            const isGlobal = !type.organizationId;
            const canDelete = isSuperAdmin || (type.organizationId && user?.organizationId === type.organizationId);

            return (
              <div
                key={type._id}
                className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {type.name}
                        </h3>
                        <span className="inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {type.code}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isGlobal ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                          <Globe className="w-3 h-3" />
                          Platform Standard
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <Building2 className="w-3 h-3" />
                          Hub Custom
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {type.roomCount || 0} {type.roomCount === 1 ? 'room' : 'rooms'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-3">
                    {type.description || 'Configured for high-performance coworking.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Capacity</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {type.capacityDefault || 1} {type.capacityDefault === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hourly Rate</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(type.hourlyRateDefault || 0)} / hr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Status: <span className="text-emerald-600 font-medium">Active</span>
                  </span>

                  {canDelete ? (
                    <button
                      onClick={() => handleDelete(type._id, type.name)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      title="Deactivate Type"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400" title="Platform standard managed by Super Admin">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Add Workspace Type {isSuperAdmin ? '(Platform Standard)' : '(Hub Custom)'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateType} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phone Booth, Podcast Studio, Boardroom"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!code) {
                      setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  System Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. PHONE_BOOTH"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 font-mono text-xs"
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
                    value={capacityDefault}
                    onChange={(e) => setCapacityDefault(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 text-xs"
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
                    value={hourlyRateDefault}
                    onChange={(e) => setHourlyRateDefault(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of this workspace unit type..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Workspace Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
