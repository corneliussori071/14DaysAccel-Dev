"use client";

import { useCallback, useEffect, useState } from "react";

interface TokenPricing {
  model_id: string;
  model_label: string;
  token_multiplier: number;
  cost_per_token_usd: number;
}

export default function TokenPricingSection() {
  const [pricing, setPricing] = useState<TokenPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPricing = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/token-pricing");
      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing || []);
      }
    } catch {
      setError("Failed to load token pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  function handleChange(
    index: number,
    field: keyof TokenPricing,
    value: string
  ) {
    setPricing((prev) => {
      const next = [...prev];
      if (field === "token_multiplier" || field === "cost_per_token_usd") {
        next[index] = { ...next[index], [field]: parseFloat(value) || 0 };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/internal/admin/token-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Token pricing updated successfully.");
    } catch {
      setError("Failed to save token pricing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Token Pricing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure per-model token pricing and multipliers for AI requests.
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
            <p className="text-sm text-zinc-500">Loading pricing...</p>
          </div>
        ) : pricing.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              No token pricing configured yet. Pricing will be created when the
              admin settings Edge Function is deployed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pricing.map((item, index) => (
              <div
                key={item.model_id}
                className="rounded-lg border border-zinc-200 bg-white p-5"
              >
                <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                  {item.model_label}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500">
                      Token Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={item.token_multiplier}
                      onChange={(e) =>
                        handleChange(index, "token_multiplier", e.target.value)
                      }
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500">
                      Cost per Token (USD)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={item.cost_per_token_usd}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "cost_per_token_usd",
                          e.target.value
                        )
                      }
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Pricing"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
