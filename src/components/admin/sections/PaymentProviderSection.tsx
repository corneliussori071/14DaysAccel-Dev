"use client";

import { useCallback, useEffect, useState } from "react";

interface PaymentProvidersConfig {
  active_provider: "lemonsqueezy" | "fastspring";
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
          </>
        )}
      </div>
    </div>
  );
}
