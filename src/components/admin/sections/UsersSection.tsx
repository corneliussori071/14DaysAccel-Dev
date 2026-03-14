"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  status: "active" | "suspended";
  balance_tokens: number;
  is_frozen: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

interface AdjustModal {
  user: AdminUser;
  amount: string;
  reason: string;
  type: "credit" | "debit";
}

interface EmailModal {
  user: AdminUser;
  subject: string;
  body: string;
}

export default function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adjustModal, setAdjustModal] = useState<AdjustModal | null>(null);
  const [emailModal, setEmailModal] = useState<EmailModal | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/internal/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function performAction(
    userId: string,
    action: string,
    extra?: Record<string, string | number>
  ) {
    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/internal/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setSuccess(data.message || "Action completed");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
      setOpenMenuId(null);
    }
  }

  async function sendDirectEmail() {
    if (!emailModal) return;
    setActionLoading(emailModal.user.id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/internal/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailModal.subject,
          emailBody: emailModal.body,
          category: "custom",
          recipientIds: [emailModal.user.id],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setSuccess(
        `Email sent to ${emailModal.user.email}${data.provider === "log_only" ? " (logged, no email provider configured)" : ""}`
      );
      setEmailModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setActionLoading(null);
    }
  }

  function handleSearch() {
    setPage(1);
    setSearch(searchInput);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage user accounts, tokens, and access. {total} total users.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by email or name..."
            className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <button
            onClick={handleSearch}
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">No users found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">
                      User
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-600">
                      Tokens
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">
                      Last Sign In
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900">
                          {user.email}
                        </div>
                        {user.full_name && (
                          <div className="text-xs text-zinc-500">
                            {user.full_name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                        {user.is_frozen && (
                          <span className="ml-1.5 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            frozen
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-900">
                        {user.balance_tokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {formatDate(user.last_sign_in_at)}
                      </td>
                      <td className="relative px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === user.id ? null : user.id
                            )
                          }
                          disabled={actionLoading === user.id}
                          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                        >
                          {actionLoading === user.id
                            ? "..."
                            : "Actions"}
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-4 top-full z-10 mt-1 w-52 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                            {user.status === "active" ? (
                              <button
                                onClick={() =>
                                  performAction(user.id, "suspend")
                                }
                                className="flex w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-50"
                              >
                                Suspend Account
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  performAction(user.id, "activate")
                                }
                                className="flex w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-zinc-50"
                              >
                                Activate Account
                              </button>
                            )}
                            {user.is_frozen ? (
                              <button
                                onClick={() =>
                                  performAction(user.id, "unfreeze_tokens")
                                }
                                className="flex w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                              >
                                Unfreeze Tokens
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  performAction(user.id, "freeze_tokens")
                                }
                                className="flex w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-zinc-50"
                              >
                                Freeze Tokens
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setAdjustModal({
                                  user,
                                  amount: "",
                                  reason: "",
                                  type: "credit",
                                });
                              }}
                              className="flex w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              Adjust Tokens
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setEmailModal({
                                  user,
                                  subject: "",
                                  body: "",
                                });
                              }}
                              className="flex w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                              Send Email
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
                <p className="text-xs text-zinc-500">
                  Page {page} of {totalPages} ({total} users)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adjust Tokens Modal */}
        {adjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-zinc-900">
                Adjust Tokens
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {adjustModal.user.email} (current:{" "}
                {adjustModal.user.balance_tokens.toLocaleString()})
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setAdjustModal((m) => (m ? { ...m, type: "credit" } : m))
                    }
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      adjustModal.type === "credit"
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    Credit (+)
                  </button>
                  <button
                    onClick={() =>
                      setAdjustModal((m) => (m ? { ...m, type: "debit" } : m))
                    }
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      adjustModal.type === "debit"
                        ? "bg-red-100 text-red-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    Debit (-)
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustModal.amount}
                    onChange={(e) =>
                      setAdjustModal((m) =>
                        m ? { ...m, amount: e.target.value } : m
                      )
                    }
                    placeholder="Enter token amount"
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={adjustModal.reason}
                    onChange={(e) =>
                      setAdjustModal((m) =>
                        m ? { ...m, reason: e.target.value } : m
                      )
                    }
                    placeholder="Reason for adjustment"
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setAdjustModal(null)}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const rawAmount = parseInt(adjustModal.amount, 10);
                    if (isNaN(rawAmount) || rawAmount <= 0) return;
                    const signedAmount =
                      adjustModal.type === "debit" ? -rawAmount : rawAmount;
                    performAction(adjustModal.user.id, "adjust_tokens", {
                      amount: signedAmount,
                      reason: adjustModal.reason,
                    });
                    setAdjustModal(null);
                  }}
                  disabled={
                    !adjustModal.amount ||
                    parseInt(adjustModal.amount, 10) <= 0
                  }
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Email Modal */}
        {emailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-zinc-900">
                Send Email
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                To: {emailModal.user.email}
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailModal.subject}
                    onChange={(e) =>
                      setEmailModal((m) =>
                        m ? { ...m, subject: e.target.value } : m
                      )
                    }
                    placeholder="Email subject"
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Body
                  </label>
                  <textarea
                    value={emailModal.body}
                    onChange={(e) =>
                      setEmailModal((m) =>
                        m ? { ...m, body: e.target.value } : m
                      )
                    }
                    rows={6}
                    placeholder="Email content..."
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEmailModal(null)}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendDirectEmail}
                  disabled={
                    !emailModal.subject.trim() || !emailModal.body.trim()
                  }
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
