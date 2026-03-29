"use client";

import { useCallback, useEffect, useState } from "react";

interface PaymentProvidersConfig {
  active_provider: "lemonsqueezy" | "fastspring";
  payments_disabled?: boolean;
  disabled_message?: string;
  disabled_redirect?: string;
}

const PROVIDERS = [
  {
    id: "lemonsqueezy" as const,
    label: "Lemon Squeezy",
    description:
      "Digital payments platform with built-in tax compliance and merchant of record services.",
  },
  {
    id: "fastspring" as const,
    label: "FastSpring",
    description:
      "Global digital commerce platform with international payment processing and tax management.",
  },
];

const DEFAULT_CONFIG: PaymentProvidersConfig = {
  active_provider: "lemonsqueezy",
};

export default function PaymentProviderSection() {
  const [config, setConfig] = useState<PaymentProvidersConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/payment-providers", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch {
      setError("Failed to load payment provider settings");
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
      const res = await fetch("/api/internal/admin/payment-providers", {
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
      setSuccess("Payment provider updated. All new payments will use the selected provider.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save payment provider settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDeactivation() {
    if (config.payments_disabled && !(config.disabled_message || "").trim()) {
      setError("A message is required when deactivating payments.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: PaymentProvidersConfig = {
        ...config,
        disabled_message: config.payments_disabled
          ? (config.disabled_message || "").trim()
          : config.disabled_message,
        disabled_redirect: config.payments_disabled
          ? (config.disabled_redirect || "").trim() || undefined
          : config.disabled_redirect,
      };
      const res = await fetch("/api/internal/admin/payment-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: payload }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save");
      }
      const result = await res.json();
      if (result.saved) {
        setConfig(result.saved);
      }
      setSuccess(
        config.payments_disabled
          ? "Payments have been deactivated. Users will see the configured message."
          : "Payments have been re-enabled."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save deactivation settings."
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
            Payment Providers
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Select the active payment provider. Only one provider processes
            payments at a time. Switching takes effect immediately for all new
            transactions.
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
            <p className="text-sm text-zinc-500">Loading provider settings...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {PROVIDERS.map((provider) => {
                const isActive = config.active_provider === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() =>
                      setConfig({ active_provider: provider.id })
                    }
                    className={`flex w-full items-start gap-4 rounded-lg border p-5 text-left transition-colors ${
                      isActive
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isActive
                          ? "border-zinc-900"
                          : "border-zinc-300"
                      }`}
                    >
                      {isActive && (
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-900" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        {provider.label}
                      </h3>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {provider.description}
                      </p>
                      {isActive && (
                        <span className="mt-2 inline-block rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">
                          Active
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-6">
              <p className="text-xs text-zinc-400">
                Existing completed orders are unaffected by provider changes.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Provider"}
              </button>
            </div>

            {/* Payment Deactivation Toggle */}
            <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Deactivate All Payments
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    When enabled, all payment buttons will be disabled and users
                    will see your custom message instead of proceeding to
                    checkout.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.payments_disabled ?? false}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      payments_disabled: !prev.payments_disabled,
                      disabled_message: !prev.payments_disabled
                        ? prev.disabled_message || ""
                        : prev.disabled_message,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    config.payments_disabled
                      ? "bg-red-600"
                      : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.payments_disabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {config.payments_disabled && (
                <div className="mt-5 space-y-4 border-t border-zinc-100 pt-5">
                  <div>
                    <label
                      htmlFor="disabledMessage"
                      className="mb-1.5 block text-sm font-medium text-zinc-700"
                    >
                      Message to display
                      <span className="ml-1 text-red-400">*</span>
                    </label>
                    <textarea
                      id="disabledMessage"
                      value={config.disabled_message || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          disabled_message: e.target.value,
                        }))
                      }
                      maxLength={500}
                      rows={3}
                      placeholder="e.g. Payments are temporarily unavailable while we upgrade our systems."
                      className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                    <p className="mt-1 text-xs text-zinc-400">
                      {(config.disabled_message || "").length}/500 — This
                      message will be shown to users who attempt any payment
                      action.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="disabledRedirect"
                      className="mb-1.5 block text-sm font-medium text-zinc-700"
                    >
                      Redirect link (optional)
                    </label>
                    <input
                      id="disabledRedirect"
                      type="url"
                      value={config.disabled_redirect || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          disabled_redirect: e.target.value,
                        }))
                      }
                      maxLength={500}
                      placeholder="https://example.com/maintenance-info"
                      className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                    <p className="mt-1 text-xs text-zinc-400">
                      If provided, users will see a link to this URL alongside
                      the message.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveDeactivation}
                    disabled={
                      saving || !(config.disabled_message || "").trim()
                    }
                    className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Deactivation Settings"}
                  </button>
                </div>
              )}

              {!config.payments_disabled && (
                <button
                  onClick={handleSaveDeactivation}
                  disabled={saving}
                  className="mt-4 rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Re-enable Payments"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
