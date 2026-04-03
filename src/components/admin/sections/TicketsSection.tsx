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
        body: JSON.stringify({ status: newStatus }),
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
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionMessage(data.error || "Failed to send reply");
        return;
      }
      setReplyText("");
      setActionMessage("Reply sent to user.");
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
                      setExpandedTicket(isExpanded ? null : ticket.id);
                      setReplyText("");
                      setActionMessage("");
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
                      <div className="mb-4">
                        <p className="mb-1 text-xs font-medium text-zinc-500">Description</p>
                        <p className="whitespace-pre-wrap text-sm text-zinc-700">
                          {ticket.description}
                        </p>
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
