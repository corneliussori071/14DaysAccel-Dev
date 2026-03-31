"use client";

import { useCallback, useEffect, useState } from "react";
import { TOKEN_PRICE_USD } from "@/types/softwarePlan";

interface SubscriptionPlan {
  id: string;
  name: string;
  tokens_per_month: number;
  price_usd: number;
  is_active: boolean;
  features: string[];
  plan_type: "subscription" | "custom";
  min_tokens?: number;
  max_tokens?: number;
  creem_product_id?: string;
  dodo_product_id?: string;
}

const EMPTY_SUBSCRIPTION: SubscriptionPlan = {
  id: "",
  name: "",
  tokens_per_month: 0,
  price_usd: 0,
  is_active: true,
  features: [],
  plan_type: "subscription",
};

const EMPTY_CUSTOM: SubscriptionPlan = {
  id: "",
  name: "Custom Token Pack",
  tokens_per_month: 0,
  price_usd: 0,
  is_active: true,
  features: [],
  plan_type: "custom",
  min_tokens: 100,
  max_tokens: 100000,
};

export default function SubscriptionFlowSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newFeature, setNewFeature] = useState<Record<string, string>>({});

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/admin/subscription-plans");
      if (res.ok) {
        const data = await res.json();
        const fetched = (data.plans || []).map((p: SubscriptionPlan) => ({
          ...EMPTY_SUBSCRIPTION,
          ...p,
          features: p.features || [],
          plan_type: p.plan_type || "subscription",
        }));
        setPlans(fetched);
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
    value: string | boolean | number
  ) {
    setPlans((prev) => {
      const next = [...prev];
      if (
        field === "tokens_per_month" ||
        field === "price_usd" ||
        field === "min_tokens" ||
        field === "max_tokens"
      ) {
        next[index] = {
          ...next[index],
          [field]: parseFloat(value as string) || 0,
        };
      } else if (field === "creem_product_id" || field === "dodo_product_id") {
        next[index] = {
          ...next[index],
          [field]: value as string,
        };
      } else if (field === "is_active") {
        next[index] = { ...next[index], [field]: value as boolean };
      } else {
        next[index] = { ...next[index], [field]: value as string };
      }
      return next;
    });
  }

  function addFeature(planId: string, index: number) {
    const text = (newFeature[planId] || "").trim();
    if (!text) return;
    setPlans((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        features: [...next[index].features, text],
      };
      return next;
    });
    setNewFeature((prev) => ({ ...prev, [planId]: "" }));
  }

  function removeFeature(planIndex: number, featureIndex: number) {
    setPlans((prev) => {
      const next = [...prev];
      next[planIndex] = {
        ...next[planIndex],
        features: next[planIndex].features.filter((_, i) => i !== featureIndex),
      };
      return next;
    });
  }

  function addPlan(type: "subscription" | "custom") {
    const base = type === "custom" ? EMPTY_CUSTOM : EMPTY_SUBSCRIPTION;
    setPlans((prev) => [
      ...prev,
      { ...base, id: `plan_${Date.now()}` },
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

  const subscriptionPlans = plans.filter((p) => p.plan_type !== "custom");
  const customPlans = plans.filter((p) => p.plan_type === "custom");

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Subscription Flow
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage subscription plans, custom token packs, and plan features.
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
          <div className="space-y-10">
            {/* Subscription Plans */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Subscription Plans
                </h2>
                <button
                  onClick={() => addPlan("subscription")}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Add Plan
                </button>
              </div>

              {subscriptionPlans.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
                  <p className="text-sm text-zinc-500">
                    No subscription plans configured. Add one to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {subscriptionPlans.map((plan) => {
                    const globalIndex = plans.indexOf(plan);
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        index={globalIndex}
                        onRemove={() => removePlan(globalIndex)}
                        onChange={handleChange}
                        newFeature={newFeature[plan.id] || ""}
                        onNewFeatureChange={(val) =>
                          setNewFeature((prev) => ({
                            ...prev,
                            [plan.id]: val,
                          }))
                        }
                        onAddFeature={() => addFeature(plan.id, globalIndex)}
                        onRemoveFeature={(fi) =>
                          removeFeature(globalIndex, fi)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Custom Token Packs */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Custom Token Pack
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Users buy any amount of tokens at ${TOKEN_PRICE_USD}/token.
                    No duration; reusable.
                  </p>
                </div>
                {customPlans.length === 0 && (
                  <button
                    onClick={() => addPlan("custom")}
                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    Add Custom Plan
                  </button>
                )}
              </div>

              {customPlans.map((plan) => {
                const globalIndex = plans.indexOf(plan);
                return (
                  <div
                    key={plan.id}
                    className="rounded-lg border border-zinc-200 bg-white"
                  >
                    <div className="border-b border-zinc-100 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) =>
                            handleChange(globalIndex, "name", e.target.value)
                          }
                          placeholder="Custom plan name"
                          className="text-base font-semibold text-zinc-900 border-none bg-transparent focus:outline-none"
                        />
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <input
                              type="checkbox"
                              checked={plan.is_active}
                              onChange={(e) =>
                                handleChange(
                                  globalIndex,
                                  "is_active",
                                  e.target.checked
                                )
                              }
                              className="rounded border-zinc-300"
                            />
                            Active
                          </label>
                          <button
                            onClick={() => removePlan(globalIndex)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-zinc-500">
                            Minimum Tokens
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={plan.min_tokens ?? 100}
                            onChange={(e) =>
                              handleChange(
                                globalIndex,
                                "min_tokens",
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-zinc-500">
                            Maximum Tokens
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={plan.max_tokens ?? 100000}
                            onChange={(e) =>
                              handleChange(
                                globalIndex,
                                "max_tokens",
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                          />
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-zinc-400">
                        Token price: ${TOKEN_PRICE_USD}/token (system-wide rate)
                      </p>

                      {/* Creem Product ID */}
                      <div className="mt-4">
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          Creem Product ID
                        </label>
                        <input
                          type="text"
                          value={plan.creem_product_id || ""}
                          onChange={(e) =>
                            handleChange(
                              globalIndex,
                              "creem_product_id",
                              e.target.value
                            )
                          }
                          placeholder="e.g. prod_1234567890"
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      </div>

                      {/* Dodo Product ID */}
                      <div className="mt-4">
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          Dodo Product ID
                        </label>
                        <input
                          type="text"
                          value={plan.dodo_product_id || ""}
                          onChange={(e) =>
                            handleChange(
                              globalIndex,
                              "dodo_product_id",
                              e.target.value
                            )
                          }
                          placeholder="e.g. pdt_1234567890"
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      </div>

                      {/* Features for custom plan */}
                      <div className="mt-5 border-t border-zinc-100 pt-4">
                        <p className="mb-2 text-xs font-medium text-zinc-500">
                          Features / Benefits
                        </p>
                        <FeaturesEditor
                          features={plan.features}
                          newFeature={newFeature[plan.id] || ""}
                          onNewFeatureChange={(val) =>
                            setNewFeature((prev) => ({
                              ...prev,
                              [plan.id]: val,
                            }))
                          }
                          onAdd={() => addFeature(plan.id, globalIndex)}
                          onRemove={(fi) => removeFeature(globalIndex, fi)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Save */}
            <div className="flex justify-end border-t border-zinc-200 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save All Plans"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  index,
  onRemove,
  onChange,
  newFeature,
  onNewFeatureChange,
  onAddFeature,
  onRemoveFeature,
}: {
  plan: SubscriptionPlan;
  index: number;
  onRemove: () => void;
  onChange: (
    index: number,
    field: keyof SubscriptionPlan,
    value: string | boolean | number
  ) => void;
  newFeature: string;
  onNewFeatureChange: (val: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (fi: number) => void;
}) {
  const monthlyTokenValue = plan.tokens_per_month * TOKEN_PRICE_USD;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      {/* Card Header */}
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={plan.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            placeholder="Plan name"
            className="text-base font-semibold text-zinc-900 border-none bg-transparent focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={plan.is_active}
                onChange={(e) =>
                  onChange(index, "is_active", e.target.checked)
                }
                className="rounded border-zinc-300"
              />
              Active
            </label>
            <button
              onClick={onRemove}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="px-5 py-4">
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
                onChange(index, "tokens_per_month", e.target.value)
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
                onChange(index, "price_usd", e.target.value)
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
        </div>
        {plan.tokens_per_month > 0 && (
          <p className="mt-2 text-xs text-zinc-400">
            Token value: ~${monthlyTokenValue.toFixed(2)} at system rate
          </p>
        )}

        {/* Creem Product ID */}
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            Creem Product ID
          </label>
          <input
            type="text"
            value={plan.creem_product_id || ""}
            onChange={(e) =>
              onChange(index, "creem_product_id", e.target.value)
            }
            placeholder="e.g. prod_1234567890"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        {/* Dodo Product ID */}
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            Dodo Product ID
          </label>
          <input
            type="text"
            value={plan.dodo_product_id || ""}
            onChange={(e) =>
              onChange(index, "dodo_product_id", e.target.value)
            }
            placeholder="e.g. pdt_1234567890"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-zinc-100 px-5 py-4">
        <p className="mb-2 text-xs font-medium text-zinc-500">
          Features / Benefits
        </p>
        <FeaturesEditor
          features={plan.features}
          newFeature={newFeature}
          onNewFeatureChange={onNewFeatureChange}
          onAdd={onAddFeature}
          onRemove={onRemoveFeature}
        />
      </div>
    </div>
  );
}

function FeaturesEditor({
  features,
  newFeature,
  onNewFeatureChange,
  onAdd,
  onRemove,
}: {
  features: string[];
  newFeature: string;
  onNewFeatureChange: (val: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      {features.map((feature, fi) => (
        <div key={fi} className="flex items-center gap-2">
          <span className="flex-1 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700">
            {feature}
          </span>
          <button
            onClick={() => onRemove(fi)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newFeature}
          onChange={(e) => onNewFeatureChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder="Add a feature benefit"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          onClick={onAdd}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
