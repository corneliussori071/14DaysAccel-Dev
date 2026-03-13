"use client";

import { useCallback, useEffect, useState } from "react";

interface FreeBenefitsConfig {
  free_tokens_on_signup: number;
  free_trial_days: number;
  trial_token_limit: number;
  is_free_trial_active: boolean;
}

const DEFAULT_CONFIG: FreeBenefitsConfig = {
  free_tokens_on_signup: 1000,
  free_trial_days: 14,
  trial_token_limit: 5000,
  is_free_trial_active: true,
};

export default function FreeBenefitsSection() {
  const [config, setConfig] = useState<FreeBenefitsConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/free-benefits");
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch {
      setError("Failed to load free benefits configuration");
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
      const res = await fetch("/api/internal/admin/free-benefits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Free benefits configuration updated.");
    } catch {
      setError("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Free Benefits Duration
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure free signup tokens, trial duration, and limits.
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
            <p className="text-sm text-zinc-500">Loading configuration...</p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-zinc-900">
                    Free Trial Active
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Enable or disable the free trial for new users.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      is_free_trial_active: !c.is_free_trial_active,
                    }))
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    config.is_free_trial_active
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {config.is_free_trial_active ? "Active" : "Inactive"}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Free Tokens on Signup
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.free_tokens_on_signup}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      free_tokens_on_signup: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Number of tokens awarded to new users upon registration.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Free Trial Duration (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.free_trial_days}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      free_trial_days: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Trial Token Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.trial_token_limit}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      trial_token_limit: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Maximum token usage allowed during the trial period.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
