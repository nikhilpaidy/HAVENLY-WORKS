import React, { useState, useEffect } from 'react';
import { ticketsApi } from '../../services/api.js';
import {
  HelpCircle,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Wifi,
  Wind,
  Coffee,
  Droplets,
  Tv,
  Zap,
  Wrench,
  X
} from 'lucide-react';

const CATEGORIES = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'WIFI_NETWORK', label: 'Wi-Fi & Network', icon: Wifi },
  { key: 'AIR_CONDITIONING', label: 'Air Conditioning', icon: Wind },
  { key: 'WATER_REFRESHMENTS', label: 'Pantry & Coffee', icon: Coffee },
  { key: 'WASHROOM_HYGIENE', label: 'Washroom & Hygiene', icon: Droplets },
  { key: 'DISPLAY_AV', label: 'Display & AV', icon: Tv },
  { key: 'POWER_ELECTRICAL', label: 'Power & Sockets', icon: Zap },
  { key: 'OTHER', label: 'Other Facilities', icon: Wrench }
];

const PRIORITIES = [
  { key: 'LOW', label: 'Low', color: 'emerald' },
  { key: 'MEDIUM', label: 'Medium', color: 'blue' },
  { key: 'HIGH', label: 'High', color: 'amber' },
  { key: 'URGENT', label: 'Urgent', color: 'rose' }
];

export const ClientTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // New ticket modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('WIFI_NETWORK');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      const data = await ticketsApi.getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load client tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedCategory]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    try {
      setSubmittingCreate(true);
      await ticketsApi.createTicket({
        category: newCategory,
        priority: newPriority,
        title: newTitle.trim(),
        description: newDescription.trim()
      });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
      setSuccessMsg('Helpdesk ticket submitted to facility management.');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      setSubmittingReply(true);
      const updated = await ticketsApi.addComment(selectedTicket._id, replyMessage.trim());
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket._id ? { ...t, comments: updated.comments } : t))
      );
      setSelectedTicket((prev: any) => ({ ...prev, comments: updated.comments }));
      setReplyMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Hub Concierge
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Facilities Helpdesk & Complaints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Report facilities issues directly to CWS ONE management for immediate resolution.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.key
                ? 'bg-[#B6925A] text-white border-[#B6925A]'
                : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading company tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-sm">No Active Tickets</p>
              <p className="text-xs text-slate-400 mt-1">All workspace facilities are working normally.</p>
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?._id === t._id;
              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#B6925A] bg-[#B6925A]/5 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#B6925A] dark:text-[#C5A880]">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-indigo-500/10 text-indigo-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                    {t.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span>{t.category.replace('_', ' ')}</span>
                    <span>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-[#B6925A]">
                  {selectedTicket.ticketNumber} • {selectedTicket.category.replace('_', ' ')}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedTicket.title}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <span>Priority: {selectedTicket.priority}</span>
                  <span>•</span>
                  <span>Status: {selectedTicket.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTicket.description}
              </div>

              {selectedTicket.resolutionNotes && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                    Facilities Resolution Summary:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {selectedTicket.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Comments Thread */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Support Updates ({selectedTicket.comments?.length || 0})
                </span>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          c.authorRole.includes('ADMIN')
                            ? 'bg-[#B6925A]/5 border-[#B6925A]/20'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {c.authorName} ({c.authorRole})
                          </span>
                          <span className="text-[10px]">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{c.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No responses recorded yet.</div>
                  )}
                </div>

                <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type reply or follow-up note..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              Select a ticket to review status and updates.
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Facilities Ticket
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {CATEGORIES.filter((c) => c.key !== 'ALL').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi dropping packets in 4th Floor Boardroom"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify location, room code, symptoms, or assistance required..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold"
                >
                  {submittingCreate ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
