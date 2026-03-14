"use client";

import { useCallback, useEffect, useState } from "react";

interface EmergencyConfig {
  maintenance_mode: boolean;
  maintenance_message: string;
  ai_services_disabled: boolean;
  signups_disabled: boolean;
  disable_reason: string;
}

const DEFAULT_CONFIG: EmergencyConfig = {
  maintenance_mode: false,
  maintenance_message: "",
  ai_services_disabled: false,
  signups_disabled: false,
  disable_reason: "",
};

export default function EmergencyControlSection() {
  const [config, setConfig] = useState<EmergencyConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/emergency", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch {
      setError("Failed to load emergency controls");
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
      const res = await fetch("/api/internal/admin/emergency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save");
      }
      const result = await res.json();
      if (result.saved) {
        setConfig(result.saved);
      }
      setSuccess("Emergency controls updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save emergency controls."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Emergency Control
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Emergency controls for maintenance mode, disabling services, and
            restricting signups.
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
            <p className="text-sm text-zinc-500">Loading controls...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Maintenance Mode
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Puts the entire platform in maintenance mode. Users see a
                    maintenance page.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      maintenance_mode: !c.maintenance_mode,
                    }))
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    config.maintenance_mode
                      ? "bg-red-100 text-red-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {config.maintenance_mode ? "ON" : "OFF"}
                </button>
              </div>
              {config.maintenance_mode && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    Maintenance Message
                  </label>
                  <textarea
                    value={config.maintenance_message}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        maintenance_message: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="We are performing scheduled maintenance..."
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-amber-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Disable AI Services
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Temporarily disable all AI API calls. Users see a service
                    unavailable message.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      ai_services_disabled: !c.ai_services_disabled,
                    }))
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    config.ai_services_disabled
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {config.ai_services_disabled ? "Disabled" : "Active"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Disable New Signups
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Prevent new user registrations.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      signups_disabled: !c.signups_disabled,
                    }))
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    config.signups_disabled
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {config.signups_disabled ? "Disabled" : "Active"}
                </button>
              </div>
            </div>

            {(config.ai_services_disabled || config.signups_disabled) && (
              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Reason for Disabling
                </label>
                <textarea
                  value={config.disable_reason}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      disable_reason: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Internal note: reason for disabling services"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Controls"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
