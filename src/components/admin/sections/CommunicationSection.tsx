"use client";

import { useCallback, useEffect, useState } from "react";

interface CommunicationConfig {
  support_email: string;
  notification_email_enabled: boolean;
  welcome_email_enabled: boolean;
  low_token_alert_threshold: number;
  low_token_alert_enabled: boolean;
}

interface EmailRecipient {
  id: string;
  email: string;
  full_name: string;
}

interface EmailLogEntry {
  id: string;
  subject: string;
  body: string;
  category: string;
  recipient_count: number;
  created_at: string;
}

const EMAIL_CATEGORIES = [
  { value: "welcome", label: "Welcome Email" },
  { value: "notification", label: "Notification" },
  { value: "low_token", label: "Low Token Alert" },
  { value: "transaction", label: "Transaction" },
  { value: "maintenance", label: "Maintenance" },
  { value: "custom", label: "Custom" },
];

const DEFAULT_CONFIG: CommunicationConfig = {
  support_email: "",
  notification_email_enabled: true,
  welcome_email_enabled: true,
  low_token_alert_threshold: 100,
  low_token_alert_enabled: true,
};

type Tab = "compose" | "settings" | "history";

export default function CommunicationSection() {
  const [activeTab, setActiveTab] = useState<Tab>("compose");
  const [config, setConfig] = useState<CommunicationConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Compose form
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [category, setCategory] = useState("notification");
  const [sendToAll, setSendToAll] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<EmailRecipient[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Email log
  const [emailLog, setEmailLog] = useState<EmailLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/communication");
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch {
      setError("Failed to load communication settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function loadUsers() {
    if (availableUsers.length > 0) return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/internal/admin/users?limit=10000");
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(
          (data.users || []).map(
            (u: { id: string; email: string; full_name: string }) => ({
              id: u.id,
              email: u.email,
              full_name: u.full_name,
            })
          )
        );
      }
    } catch {
      setError("Failed to load users list");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadEmailLog() {
    setLoadingLog(true);
    try {
      const res = await fetch("/api/internal/admin/email");
      if (res.ok) {
        const data = await res.json();
        setEmailLog(data.emails || []);
      }
    } catch {
      setError("Failed to load email history");
    } finally {
      setLoadingLog(false);
    }
  }

  useEffect(() => {
    if (activeTab === "history") loadEmailLog();
    if (!sendToAll && availableUsers.length === 0) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sendToAll]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/internal/admin/communication", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Communication settings updated.");
    } catch {
      setError("Failed to save communication settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendEmail() {
    if (!subject.trim() || !emailBody.trim()) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const recipientIds = sendToAll
        ? ["all"]
        : Array.from(selectedUserIds);

      if (!sendToAll && recipientIds.length === 0) {
        setError("Select at least one recipient.");
        setSending(false);
        return;
      }

      const res = await fetch("/api/internal/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          emailBody: emailBody.trim(),
          category,
          recipientIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      const providerNote =
        data.provider === "log_only"
          ? " (logged only — configure SENDGRID_API_KEY to send real emails)"
          : "";
      setSuccess(
        `Email sent to ${data.sent} of ${data.total} recipients.${providerNote}`
      );
      setSubject("");
      setEmailBody("");
      setSelectedUserIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  const filteredUsers = userSearch
    ? availableUsers.filter(
        (u) =>
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.full_name.toLowerCase().includes(userSearch.toLowerCase())
      )
    : availableUsers;

  const tabs: { id: Tab; label: string }[] = [
    { id: "compose", label: "Compose Email" },
    { id: "settings", label: "Settings" },
    { id: "history", label: "Email History" },
  ];

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Communication
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Compose emails, manage notification settings, and view email
            history.
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

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Compose Tab */}
        {activeTab === "compose" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                >
                  {EMAIL_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Body
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Write your email content here..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Emails are sent from &quot;14DaysAccel Dev&quot; with a
                  professional footer.
                </p>
              </div>

              {/* Recipients */}
              <div className="border-t border-zinc-100 pt-5">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Recipients
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSendToAll(true);
                      setSelectedUserIds(new Set());
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      sendToAll
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => {
                      setSendToAll(false);
                      if (availableUsers.length === 0) loadUsers();
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      !sendToAll
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    Select Recipients
                  </button>
                </div>

                {!sendToAll && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Filter by email or name..."
                      className="mb-3 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                    {selectedUserIds.size > 0 && (
                      <p className="mb-2 text-xs text-zinc-500">
                        {selectedUserIds.size} recipient
                        {selectedUserIds.size !== 1 ? "s" : ""} selected
                      </p>
                    )}
                    {loadingUsers ? (
                      <p className="text-sm text-zinc-500">Loading users...</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200">
                        {filteredUsers.map((u) => (
                          <label
                            key={u.id}
                            className="flex cursor-pointer items-center gap-3 border-b border-zinc-100 px-4 py-2.5 text-sm hover:bg-zinc-50 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUserIds.has(u.id)}
                              onChange={() => toggleUser(u.id)}
                              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                            />
                            <span className="text-zinc-900">{u.email}</span>
                            {u.full_name && (
                              <span className="text-zinc-400">
                                ({u.full_name})
                              </span>
                            )}
                          </label>
                        ))}
                        {filteredUsers.length === 0 && (
                          <p className="px-4 py-3 text-sm text-zinc-400">
                            No users found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSendEmail}
                disabled={
                  sending || !subject.trim() || !emailBody.trim()
                }
                className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                {sending
                  ? "Sending..."
                  : sendToAll
                    ? "Send to All Users"
                    : `Send to ${selectedUserIds.size} Recipient${selectedUserIds.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <>
            {loading ? (
              <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">Loading settings...</p>
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <div className="space-y-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={config.support_email}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          support_email: e.target.value,
                        }))
                      }
                      placeholder="support@example.com"
                      className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900">
                        Welcome Email
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Send a welcome email to new users upon signup.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          welcome_email_enabled: !c.welcome_email_enabled,
                        }))
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        config.welcome_email_enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {config.welcome_email_enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900">
                        Notification Emails
                      </h3>
                      <p className="text-xs text-zinc-500">
                        System-wide notification emails for users.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          notification_email_enabled:
                            !c.notification_email_enabled,
                        }))
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        config.notification_email_enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {config.notification_email_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </button>
                  </div>

                  <div className="border-t border-zinc-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900">
                          Low Token Alert
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Notify users when their token balance falls below the
                          threshold.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setConfig((c) => ({
                            ...c,
                            low_token_alert_enabled:
                              !c.low_token_alert_enabled,
                          }))
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          config.low_token_alert_enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {config.low_token_alert_enabled
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                    {config.low_token_alert_enabled && (
                      <div className="mt-3">
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          Alert Threshold (tokens)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={config.low_token_alert_threshold}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              low_token_alert_threshold:
                                parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="rounded-lg border border-zinc-200 bg-white">
            {loadingLog ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">Loading history...</p>
              </div>
            ) : emailLog.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">No emails sent yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {emailLog.map((entry) => (
                  <div key={entry.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-zinc-900">
                          {entry.subject}
                        </h3>
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                          {entry.body}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                          {entry.category}
                        </span>
                        <p className="mt-1 text-xs text-zinc-400">
                          {entry.recipient_count} recipient
                          {entry.recipient_count !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(entry.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
