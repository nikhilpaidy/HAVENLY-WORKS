import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
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
  DoorOpen
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

interface WorkspaceTypeItem {
  _id: string;
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

  const totalRooms = types.reduce((acc, t) => acc + (t.roomCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Workspace Types & Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage distinct categories of workspace inventory with custom room allocation rules
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Workspace Type
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Types</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{types.length}</p>
          <span className="text-xs text-slate-400">Configured categories</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Inventory</span>
            <DoorOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalRooms}</p>
          <span className="text-xs text-slate-400">Assigned rooms & desks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Max Capacity Option</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {types.length > 0 ? Math.max(...types.map((t) => t.capacityDefault || 1)) : 0} Seats
          </p>
          <span className="text-xs text-slate-400">Largest unit layout</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Starting Rate</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {types.length > 0
              ? formatCurrency(Math.min(...types.map((t) => t.hourlyRateDefault || 150)))
              : '₹0'}
          </p>
          <span className="text-xs text-slate-400">Per hour standard</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
          Loading workspace categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((type) => (
            <div
              key={type._id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {type.name}
                      </h3>
                      <span className="inline-block text-[11px] font-mono uppercase px-2 py-0.5 mt-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {type.code}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <DoorOpen className="w-3.5 h-3.5" />
                    {type.roomCount || 0} {type.roomCount === 1 ? 'Room' : 'Rooms'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                  {type.description || 'Configured for high-performance coworking.'}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Base Capacity</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {type.capacityDefault || 1} {type.capacityDefault === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Base Price</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(type.hourlyRateDefault || 0)} / hr
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className="text-emerald-600">Active</strong>
                </span>
                <button
                  onClick={() => handleDelete(type._id, type.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Deactivate Type"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add New Workspace Type
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateType} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flex Desk, Fixed Desk, Boardroom"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!code) {
                      setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'));
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  System Code (Uppercase Identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLEX_DESK"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-emerald-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Default Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacityDefault}
                    onChange={(e) => setCapacityDefault(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Default Rate (₹ / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={hourlyRateDefault}
                    onChange={(e) => setHourlyRateDefault(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline who this space is for and what amenities are included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-emerald-500 text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
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
