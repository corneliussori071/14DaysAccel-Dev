"use client";

import { useCallback, useEffect, useState } from "react";

interface Ticket {
  id: string;
  name: string;
  email: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  message: string;
  admin_name: string;
  created_at: string;
}

interface TicketActivity {
  id: string;
  ticket_id: string;
  action: string;
  admin_name: string;
  details: string | null;
  created_at: string;
}

type TimelineEntry =
  | { type: "reply"; data: TicketReply }
  | { type: "activity"; data: TicketActivity };

const CATEGORY_TABS = [
  { value: "all", label: "All" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "purchases", label: "Purchases" },
  { value: "enquiry", label: "Enquiry" },
  { value: "partner_affiliate", label: "Partner / Affiliate" },
  { value: "others", label: "Others" },
];

const CATEGORY_LABELS: Record<string, string> = {
  subscriptions: "Subscriptions",
  purchases: "Purchases",
  enquiry: "Enquiry",
  partner_affiliate: "Partner / Affiliate",
  others: "Others",
};

export default function TicketsSection() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [adminName, setAdminName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_staff_name") || "";
    }
    return "";
  });
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const persistAdminName = (name: string) => {
    setAdminName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_staff_name", name);
    }
  };

  const fetchTimeline = useCallback(async (ticketId: string) => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/internal/admin/tickets/${ticketId}`);
      if (!res.ok) {
        setTimeline([]);
        return;
      }
      const data = await res.json();
      const replies: TicketReply[] = data.replies || [];
      const activity: TicketActivity[] = data.activity || [];

      const entries: TimelineEntry[] = [
        ...replies.map((r) => ({ type: "reply" as const, data: r })),
        ...activity
          .filter((a) => a.action !== "replied")
          .map((a) => ({ type: "activity" as const, data: a })),
      ];
      entries.sort(
        (a, b) =>
          new Date(a.data.created_at).getTime() -
          new Date(b.data.created_at).getTime()
      );
      setTimeline(entries);
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search
        ? `/api/internal/admin/tickets?search=${encodeURIComponent(search)}`
        : "/api/internal/admin/tickets";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    fetchTickets(trimmed || undefined);
  }

  function clearSearch() {
    setSearchInput("");
    setSearchQuery("");
    fetchTickets();
  }

  async function handleStatusChange(ticketId: string, newStatus: "open" | "closed") {
    setActionLoading(ticketId);
    setActionMessage("");
    try {
      const res = await fetch(`/api/internal/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionMessage(data.error || "Failed to update status");
        return;
      }
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      setActionMessage(`Ticket ${newStatus === "closed" ? "closed" : "re-opened"} and user notified.`);
      fetchTimeline(ticketId);
    } catch {
      setActionMessage("Failed to update ticket status.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReply(ticketId: string) {
    if (!replyText.trim()) return;
    setReplying(true);
    setActionMessage("");
    try {
      const res = await fetch(`/api/internal/admin/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim(), adminName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionMessage(data.error || "Failed to send reply");
        return;
      }
      setReplyText("");
      setActionMessage("Reply sent to user.");
      fetchTimeline(ticketId);
    } catch {
      setActionMessage("Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }

  const filteredTickets =
    activeTab === "all"
      ? tickets
      : tickets.filter((t) => t.category === activeTab);

  const openCount = filteredTickets.filter((t) => t.status === "open").length;
  const closedCount = filteredTickets.filter((t) => t.status === "closed").length;

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Tickets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage support tickets from users.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by ticket ID"
            className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Clear
            </button>
          )}
        </form>

        {/* Category Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 border-b border-zinc-200">
          {CATEGORY_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? tickets.length
                : tickets.filter((t) => t.category === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-zinc-400">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mb-4 flex gap-4 text-sm text-zinc-500">
          <span>Open: {openCount}</span>
          <span>Closed: {closedCount}</span>
        </div>

        {actionMessage && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Ticket List */}
        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              {searchQuery ? "No tickets found matching that ID." : "No tickets in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const isExpanded = expandedTicket === ticket.id;
              return (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-zinc-200 bg-white"
                >
                  <button
                    onClick={() => {
                      const opening = !isExpanded;
                      setExpandedTicket(opening ? ticket.id : null);
                      setReplyText("");
                      setActionMessage("");
                      if (opening) {
                        fetchTimeline(ticket.id);
                      } else {
                        setTimeline([]);
                      }
                    }}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-zinc-900">
                          {ticket.id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            ticket.status === "open"
                              ? "bg-green-100 text-green-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                          {CATEGORY_LABELS[ticket.category] || ticket.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {ticket.name} &middot; {ticket.email} &middot;{" "}
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-zinc-100 px-5 py-4">
                      {/* Admin Name */}
                      <div className="mb-4">
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          Your staff name
                        </label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => persistAdminName(e.target.value)}
                          placeholder="Enter your name"
                          maxLength={100}
                          className="w-full max-w-xs rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      </div>

                      {/* Original description */}
                      <div className="mb-4">
                        <p className="mb-1 text-xs font-medium text-zinc-500">Description</p>
                        <p className="whitespace-pre-wrap text-sm text-zinc-700">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Conversation Timeline */}
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium text-zinc-500">Activity</p>
                        {timelineLoading ? (
                          <p className="text-xs text-zinc-400">Loading activity...</p>
                        ) : timeline.length === 0 ? (
                          <p className="text-xs text-zinc-400">No activity yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {timeline.map((entry) => {
                              if (entry.type === "reply") {
                                const r = entry.data;
                                return (
                                  <div
                                    key={`reply-${r.id}`}
                                    className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2 text-xs text-blue-600">
                                      <span className="font-medium">{r.admin_name}</span>
                                      <span>replied</span>
                                      <span className="ml-auto text-blue-400">
                                        {new Date(r.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                                      {r.message}
                                    </p>
                                  </div>
                                );
                              }
                              const a = entry.data;
                              return (
                                <div
                                  key={`activity-${a.id}`}
                                  className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2"
                                >
                                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span className="font-medium">{a.admin_name}</span>
                                    <span>{a.details || a.action}</span>
                                    <span className="ml-auto text-zinc-400">
                                      {new Date(a.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mb-4 flex gap-2">
                        {ticket.status === "open" ? (
                          <button
                            onClick={() => handleStatusChange(ticket.id, "closed")}
                            disabled={actionLoading === ticket.id}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {actionLoading === ticket.id ? "Closing..." : "Close Ticket"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(ticket.id, "open")}
                            disabled={actionLoading === ticket.id}
                            className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
                          >
                            {actionLoading === ticket.id ? "Re-opening..." : "Re-open Ticket"}
                          </button>
                        )}
                      </div>

                      {/* Reply */}
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-zinc-500">Reply to user</p>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          maxLength={2000}
                          placeholder="Type your reply..."
                          className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-zinc-400">
                            {replyText.length}/2000
                          </span>
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={replying || !replyText.trim()}
                            className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                          >
                            {replying ? "Sending..." : "Send Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
