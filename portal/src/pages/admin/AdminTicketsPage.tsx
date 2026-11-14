import React, { useState, useEffect } from 'react';
import { ticketsApi, overridesApi } from '../../services/api.js';
import {
  HelpCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Building2,
  ShieldAlert,
  Search,
  User,
  Check,
  RefreshCw,
  X
} from 'lucide-react';
import { formatDateIST, formatTimeIST } from '../../utils/formatters.js';

export const AdminTicketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'overrides'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const [reviewOverrideId, setReviewOverrideId] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getTickets();
      const list = Array.isArray(data) ? data : [];
      setTickets(list);
      if (list.length > 0) {
        if (!selectedTicket || !list.some((t: any) => t._id === selectedTicket._id)) {
          setSelectedTicket(list[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverrides = async () => {
    try {
      setLoading(true);
      const data = await overridesApi.getOverrides();
      setOverrides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch overrides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    } else {
      fetchOverrides();
    }
  }, [activeTab]);

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

  const handleUpdateStatus = async (ticketId: string, status: string, notes?: string) => {
    try {
      await ticketsApi.updateTicketStatus(ticketId, status, notes);
      setIsResolveModalOpen(false);
      setResolvingTicketId(null);
      setResolutionNotes('');
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket((prev: any) => ({
          ...prev,
          status,
          resolutionNotes: notes || prev.resolutionNotes
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId) return;
    try {
      setSubmittingResolve(true);
      await handleUpdateStatus(resolvingTicketId, 'RESOLVED', resolutionNotes.trim() || undefined);
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleReviewOverride = async () => {
    if (!reviewOverrideId) return;
    try {
      setSubmittingReview(true);
      await overridesApi.reviewOverride(reviewOverrideId, reviewDecision, reviewNotes);
      setReviewOverrideId(null);
      setReviewNotes('');
      fetchOverrides();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      const num = t.ticketNumber?.toLowerCase() || '';
      const title = t.title?.toLowerCase() || '';
      const comp = typeof t.companyId === 'object' && t.companyId !== null ? t.companyId.name?.toLowerCase() || '' : '';
      return num.includes(q) || title.includes(q) || comp.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Support Helpdesk & Complaints
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Resolve facility requests, member inquiries, and emergency booking overrides.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tickets ({tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'overrides'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Overrides ({overrides.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search ticket #, subject, or company..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading tickets...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No service tickets match criteria.
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?._id === t._id;
                  const compName = typeof t.companyId === 'object' && t.companyId !== null
                    ? t.companyId.name
                    : 'Client Company';

                  return (
                    <div
                      key={t._id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                          {t.ticketNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {t.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                          {compName}
                        </span>
                        <span>{formatDateIST(t.createdAt, false)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {selectedTicket.ticketNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {selectedTicket.category ? selectedTicket.category.replace(/_/g, ' ') : 'GENERAL'}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {selectedTicket.title}
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Raised by {selectedTicket.raisedByUserId?.name || 'Member'} • {typeof selectedTicket.companyId === 'object' && selectedTicket.companyId !== null ? selectedTicket.companyId.name : 'Client Company'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                      {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' ? (
                        <>
                          {selectedTicket.status === 'OPEN' && (
                            <button
                              onClick={() => handleUpdateStatus(selectedTicket._id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium transition-colors"
                            >
                              Mark In Progress
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setResolvingTicketId(selectedTicket._id);
                              setResolutionNotes('');
                              setIsResolveModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium transition-colors"
                          >
                            Resolve Ticket
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket._id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                        >
                          Reopen Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Issue Description
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {selectedTicket.resolutionNotes && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-0.5">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300 block text-[11px]">
                        Resolution Summary
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {selectedTicket.resolutionNotes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Activity Thread ({selectedTicket.comments?.length || 0})
                    </span>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                        selectedTicket.comments.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center justify-between text-slate-400 mb-0.5 text-[10px]">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {c.authorName || 'Staff'} <span className="font-normal text-slate-400">({c.authorRole || 'OPERATOR'})</span>
                              </span>
                              <span>{formatTimeIST(c.createdAt)}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                              {c.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 italic">
                          No replies recorded yet.
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add staff update or notes..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={submittingReply || !replyMessage.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                  Select a ticket from the left column to view details and replies.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading overrides...
            </div>
          ) : overrides.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              No emergency slot override requests currently pending.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {overrides.map((ov) => (
                <div
                  key={ov._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 uppercase">
                      Emergency Override
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        ov.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : ov.status === 'REJECTED'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {ov.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {ov.roomId?.name || 'Workspace Room'}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Requesting: {ov.requestingCompanyId?.name} • Displaced: {ov.existingCompanyId?.name}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-0.5">
                      Justification:
                    </span>
                    {ov.reason}
                  </div>

                  {ov.status === 'PENDING' && (
                    <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setReviewOverrideId(ov._id);
                          setReviewDecision('REJECT');
                          setReviewNotes('');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setReviewOverrideId(ov._id);
                          setReviewDecision('APPROVE');
                          setReviewNotes('');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Approve Displacement
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Resolve Support Ticket
              </h2>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Resolution Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline actions taken to resolve the issue..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve || !resolutionNotes.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {submittingResolve ? 'Saving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewOverrideId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                {reviewDecision === 'APPROVE' ? 'Approve Displacement' : 'Reject Override'}
              </h2>
              <button
                onClick={() => setReviewOverrideId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Decision Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional review reason or instructions..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setReviewOverrideId(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewOverride}
                  disabled={submittingReview}
                  className={`px-4 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors ${
                    reviewDecision === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingReview ? 'Submitting...' : `Confirm ${reviewDecision}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
