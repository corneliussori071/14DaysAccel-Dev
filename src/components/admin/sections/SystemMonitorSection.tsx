"use client";

import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "critical";
  source: string;
  message: string;
  details: Record<string, unknown> | null;
  path: string | null;
  user_id: string | null;
  created_at: string;
}

const LEVEL_STYLES: Record<string, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  critical: "bg-red-100 text-red-900 border-red-300 font-semibold",
};

const PER_PAGE = 25;

export default function SystemMonitorSection() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(PER_PAGE),
      });
      if (levelFilter) params.set("level", levelFilter);
      if (sourceFilter) params.set("source", sourceFilter);

      const res = await fetch(`/api/internal/admin/logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, levelFilter, sourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function handleFilterChange(level: string, source: string) {
    setLevelFilter(level);
    setSourceFilter(source);
    setPage(1);
    setExpandedId(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            System Monitor
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {total} log {total === 1 ? "entry" : "entries"}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <select
          value={levelFilter}
          onChange={(e) => handleFilterChange(e.target.value, sourceFilter)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
        >
          <option value="">All levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => handleFilterChange(levelFilter, e.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
        >
          <option value="">All sources</option>
          <option value="server">Server</option>
          <option value="api">API</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">Timestamp</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Level</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Source</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Message</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Path</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  expanded={expandedId === log.id}
                  onToggle={() =>
                    setExpandedId(expandedId === log.id ? null : log.id)
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LogRow({
  log,
  expanded,
  onToggle,
}: {
  log: LogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasDetails = log.details && Object.keys(log.details).length > 0;
  const time = new Date(log.created_at);
  const formatted = `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`;

  return (
    <>
      <tr
        onClick={hasDetails ? onToggle : undefined}
        className={`${hasDetails ? "cursor-pointer hover:bg-zinc-50" : ""} transition-colors`}
      >
        <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
          {formatted}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-xs ${LEVEL_STYLES[log.level] || ""}`}
          >
            {log.level}
          </span>
        </td>
        <td className="px-4 py-3 text-zinc-600">{log.source}</td>
        <td className="max-w-xs truncate px-4 py-3 text-zinc-800">
          {log.message}
        </td>
        <td className="px-4 py-3 text-zinc-400">{log.path || "—"}</td>
      </tr>
      {expanded && hasDetails && (
        <tr>
          <td colSpan={5} className="bg-zinc-50 px-6 py-4">
            <pre className="max-h-64 overflow-auto rounded-md bg-zinc-900 p-4 text-xs text-zinc-100">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
