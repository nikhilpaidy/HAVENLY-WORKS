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
  Calendar,
  Users,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AdminTicketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'overrides'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Status update modal / notes
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);

  // Override decision modal
  const [reviewOverrideId, setReviewOverrideId] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getTickets();
      setTickets(Array.isArray(data) ? data : []);
      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
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
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Facilities & Arbitration Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Service Tickets & Slot Overrides
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage corporate tenant inquiries, facilities complaints, and executive emergency slot requests.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-[#141A29] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Helpdesk Tickets ({tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'overrides'
                ? 'bg-white dark:bg-[#141A29] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Emergency Overrides ({overrides.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-5 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading helpdesk tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
                No active service complaints recorded.
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
                      <span>{t.companyId?.name || 'Client Member'}</span>
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

          {/* Ticket Detail & Thread */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#B6925A]">
                      {selectedTicket.ticketNumber} • {selectedTicket.category.replace('_', ' ')}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Raised by {selectedTicket.raisedByUserId?.name || 'Client'} ({selectedTicket.companyId?.name})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                      <>
                        {selectedTicket.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedTicket._id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                          >
                            Mark In Progress
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setResolvingTicketId(selectedTicket._id);
                            setIsResolveModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                        >
                          Resolve Ticket
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedTicket.description}
                </div>

                {selectedTicket.resolutionNotes && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      Resolution Summary
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {selectedTicket.resolutionNotes}
                    </p>
                  </div>
                )}

                {/* Conversation Thread */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Administrative Thread ({selectedTicket.comments?.length || 0})
                  </span>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                      selectedTicket.comments.map((c: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs"
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
                      <div className="text-xs text-slate-400 italic">No replies recorded yet.</div>
                    )}
                  </div>

                  <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add administrative reply..."
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
                Select a ticket to review description and conversation thread.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EMERGENCY OVERRIDES TAB */
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading emergency overrides...</div>
          ) : overrides.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
              No emergency slot override requests currently pending.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overrides.map((ov) => (
                <div
                  key={ov._id}
                  className="p-6 rounded-2xl border border-rose-500/20 bg-white dark:bg-[#0B1120] space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">
                      Emergency Slot Request
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        ov.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : ov.status === 'REJECTED'
                          ? 'bg-slate-500/10 text-slate-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {ov.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {ov.roomId?.name || 'Executive Boardroom'}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span>Requesting: {ov.requestingCompanyId?.name}</span>
                      <span>•</span>
                      <span>Displaced: {ov.existingCompanyId?.name}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Urgent Justification:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">{ov.urgencyReason}</p>
                  </div>

                  {ov.status === 'PENDING' && (
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        onClick={() => {
                          setReviewOverrideId(ov._id);
                          setReviewDecision('REJECT');
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setReviewOverrideId(ov._id);
                          setReviewDecision('APPROVE');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                      >
                        Approve & Reallocate Slot
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolve Ticket Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirm Ticket Resolution
            </h3>
            <p className="text-xs text-slate-400">
              Provide resolution notes outlining the actions taken by facilities staff.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. WiFi AP channels calibrated to 5GHz UNII-3 DFS clean band. Verified 350Mbps."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => resolvingTicketId && handleUpdateStatus(resolvingTicketId, 'RESOLVED', resolutionNotes)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Review Modal */}
      {reviewOverrideId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {reviewDecision === 'APPROVE' ? 'Approve Emergency Override' : 'Decline Override Request'}
            </h3>
            <p className="text-xs text-slate-400">
              {reviewDecision === 'APPROVE'
                ? 'Approving reallocates the meeting slot to the requesting company, refunds the displaced company complimentary quota, and dispatches automated notices to both parties.'
                : 'Declining maintains the current reservation and notifies the requesting party.'}
            </p>
            <textarea
              rows={3}
              placeholder="Administrative notes or remarks..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setReviewOverrideId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewOverride}
                disabled={submittingReview}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white ${
                  reviewDecision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {submittingReview ? 'Processing...' : `Confirm ${reviewDecision === 'APPROVE' ? 'Approval' : 'Decline'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
