"use client";

import { useCallback, useEffect, useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  tokens_per_month: number;
  price_usd: number;
  is_active: boolean;
}

export default function SubscriptionFlowSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/subscription-plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch {
      setError("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function handleChange(
    index: number,
    field: keyof SubscriptionPlan,
    value: string | boolean
  ) {
    setPlans((prev) => {
      const next = [...prev];
      if (field === "tokens_per_month" || field === "price_usd") {
        next[index] = { ...next[index], [field]: parseFloat(value as string) || 0 };
      } else if (field === "is_active") {
        next[index] = { ...next[index], [field]: value as boolean };
      } else {
        next[index] = { ...next[index], [field]: value as string };
      }
      return next;
    });
  }

  function addPlan() {
    setPlans((prev) => [
      ...prev,
      {
        id: `plan_${Date.now()}`,
        name: "",
        tokens_per_month: 0,
        price_usd: 0,
        is_active: true,
      },
    ]);
  }

  function removePlan(index: number) {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/internal/admin/subscription-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Subscription plans updated successfully.");
    } catch {
      setError("Failed to save subscription plans.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Subscription Flow
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage subscription plans with token allocations and pricing.
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
            <p className="text-sm text-zinc-500">Loading plans...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className="rounded-lg border border-zinc-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    placeholder="Plan name"
                    className="text-sm font-semibold text-zinc-900 border-none bg-transparent focus:outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <input
                        type="checkbox"
                        checked={plan.is_active}
                        onChange={(e) =>
                          handleChange(index, "is_active", e.target.checked)
                        }
                        className="rounded border-zinc-300"
                      />
                      Active
                    </label>
                    <button
                      onClick={() => removePlan(index)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500">
                      Tokens per Month
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={plan.tokens_per_month}
                      onChange={(e) =>
                        handleChange(index, "tokens_per_month", e.target.value)
                      }
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500">
                      Price (USD / month)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={plan.price_usd}
                      onChange={(e) =>
                        handleChange(index, "price_usd", e.target.value)
                      }
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={addPlan}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Add Plan
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Plans"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
