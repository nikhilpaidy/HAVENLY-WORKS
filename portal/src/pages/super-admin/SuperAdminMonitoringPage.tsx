import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Search,
  Server,
  Clock,
  Cpu,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldAlert
} from 'lucide-react';
import { superAdminApi } from '../../services/api';

export const SuperAdminMonitoringPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedResolved, setSelectedResolved] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async (pageNum = 1) => {
    try {
      setRefreshing(true);
      const [statsData, logsRes] = await Promise.all([
        superAdminApi.getMonitoringStats(),
        superAdminApi.getIssueLogs({
          page: pageNum,
          limit: 20,
          level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
          resolved: selectedResolved === 'RESOLVED' ? true : selectedResolved === 'UNRESOLVED' ? false : undefined,
          search: search.trim() || undefined
        })
      ]);
      setStats(statsData);
      setLogs(logsRes.logs);
      setTotal(logsRes.total);
      setPage(logsRes.page);
      setPages(logsRes.pages);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [selectedLevel, selectedResolved]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleResolve = async (id: string) => {
    try {
      await superAdminApi.resolveIssue(id);
      setLogs((prev) =>
        prev.map((item) => (item._id === id ? { ...item, resolved: true, resolvedAt: new Date() } : item))
      );
    } catch {}
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear resolved issue logs older than 7 days?')) return;
    try {
      await superAdminApi.clearIssues(7);
      loadData(page);
    } catch {}
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${seconds % 60}s`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            System Monitoring & Telemetry
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time server health, database connectivity, and backend exception tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(page)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleClearLogs}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Purge Old
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Health Status
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              stats?.status === 'HEALTHY'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
            }`}>
              {stats?.status || 'HEALTHY'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.recent24hErrors === 0 ? 'Optimal' : `${stats?.recent24hErrors} Issues`}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">in last 24h</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Server Uptime
            </span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats ? formatUptime(stats.uptimeSeconds) : '...'}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Running</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Database Cluster
            </span>
            <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              MongoDB
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {stats?.database || 'CONNECTED'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Memory Utilization
            </span>
            <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.memory?.heapUsedMb || 0} MB
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              / {stats?.memory?.heapTotalMb || 0} MB heap
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by path, error message, or user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <option value="ALL">All Severities</option>
              <option value="ERROR">Errors (5xx)</option>
              <option value="WARN">Warnings (4xx)</option>
            </select>

            <select
              value={selectedResolved}
              onChange={(e) => setSelectedResolved(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <option value="ALL">All States</option>
              <option value="UNRESOLVED">Unresolved</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading monitoring telemetry...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-200">No issues recorded</p>
            <p className="text-xs text-gray-400 mt-1">All systems and API endpoints operating within normal parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Endpoint & Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Exception Message</th>
                  <th className="py-3 px-3">User & IP</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => {
                  const isExpanded = expandedId === log._id;
                  return (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log._id)}>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                              log.level === 'ERROR'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {log.level === 'ERROR' ? <ShieldAlert className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {log.level}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-gray-800 dark:text-gray-200">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-1.5">{log.method}</span>
                          {log.path}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`font-mono text-xs font-bold ${log.statusCode >= 500 ? 'text-red-600' : 'text-amber-600'}`}>
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs max-w-xs truncate text-gray-700 dark:text-gray-300">
                          {log.message}
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {log.userEmail || 'Anonymous'} {log.ip ? `• ${log.ip}` : ''}
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {log.resolved ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="w-3.5 h-3.5" /> Resolved
                            </span>
                          ) : (
                            <button
                              onClick={() => handleResolve(log._id)}
                              className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 text-gray-700 dark:text-gray-300 transition"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-gray-900/60">
                          <td colSpan={7} className="p-4 text-xs font-mono text-gray-800 dark:text-gray-300">
                            <div className="space-y-2">
                              <div>
                                <span className="font-semibold text-gray-500">Full Message: </span>
                                <span>{log.message}</span>
                              </div>
                              {log.userAgent && (
                                <div>
                                  <span className="font-semibold text-gray-500">User Agent: </span>
                                  <span>{log.userAgent}</span>
                                </div>
                              )}
                              {log.stack && (
                                <div className="mt-2">
                                  <span className="font-semibold text-gray-500 block mb-1">Stack Trace:</span>
                                  <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap max-h-56">
                                    {log.stack}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 text-xs text-gray-500">
            <span>Showing page {page} of {pages} ({total} total entries)</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => loadData(page - 1)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pages}
                onClick={() => loadData(page + 1)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};