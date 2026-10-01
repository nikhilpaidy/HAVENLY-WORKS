import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api.js';
import { ClipboardList, Search, Shield, Clock } from 'lucide-react';

export const SuperAdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = () => {
    setLoading(true);
    superAdminApi
      .getAuditLogs({ action: actionFilter || undefined, limit: 50 })
      .then((data) => setLogs(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            System Traceability
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Privileged Audit Log Stream
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-panel border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="BOOKING_CREATED">BOOKING_CREATED</option>
            <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
            <option value="PAYMENT_RECORDED">PAYMENT_RECORDED</option>
            <option value="PAYMENT_VERIFIED">PAYMENT_VERIFIED</option>
            <option value="INVOICE_GENERATED">INVOICE_GENERATED</option>
            <option value="ALLOWANCE_ADJUSTED">ALLOWANCE_ADJUSTED</option>
            <option value="ADMIN_USER_CREATED">ADMIN_USER_CREATED</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Actor Email</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Target Entity</th>
                <th className="py-3.5 px-6">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">No audit logs matching criteria.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-6 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                      {log.userEmail}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-[#B6925A] dark:text-[#C5A880]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-600 dark:text-slate-300">
                      {log.entityType} ({log.entityId?.slice(-6)})
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate font-mono text-[11px]">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
