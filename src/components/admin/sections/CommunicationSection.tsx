"use client";

import { useCallback, useEffect, useState } from "react";

interface CommunicationConfig {
  support_email: string;
  notification_email_enabled: boolean;
  welcome_email_enabled: boolean;
  low_token_alert_threshold: number;
  low_token_alert_enabled: boolean;
}

const DEFAULT_CONFIG: CommunicationConfig = {
  support_email: "",
  notification_email_enabled: true,
  welcome_email_enabled: true,
  low_token_alert_threshold: 100,
  low_token_alert_enabled: true,
};

export default function CommunicationSection() {
  const [config, setConfig] = useState<CommunicationConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Communication
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure email notifications, support contact, and alert settings.
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
                  {config.notification_email_enabled ? "Enabled" : "Disabled"}
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
                        low_token_alert_enabled: !c.low_token_alert_enabled,
                      }))
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      config.low_token_alert_enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {config.low_token_alert_enabled ? "Enabled" : "Disabled"}
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
      </div>
    </div>
  );
}
