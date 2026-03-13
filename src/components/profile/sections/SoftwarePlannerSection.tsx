"use client";

import { useState, useEffect } from "react";
import { getSavedPlans, deleteSavedPlan } from "@/services/profileService";
import { AI_MODELS } from "@/types/softwarePlan";
import type { SavedPlan } from "@/types/profile";

export default function SoftwarePlannerSection() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    const data = await getSavedPlans();
    setPlans(data);
    setLoading(false);
  }

  async function handleDelete(planId: string) {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    setDeletingId(planId);
    try {
      await deleteSavedPlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch {
      alert("Failed to delete plan.");
    } finally {
      setDeletingId(null);
    }
  }

  function getModelLabel(modelId: string): string {
    return AI_MODELS.find((m) => m.id === modelId)?.label ?? modelId;
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Software Planner History
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        View and manage your generated plans and prompts.
      </p>

      {plans.length === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No saved plans yet. Generate a plan from the Software Designer to see it here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {plan.business_name}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="capitalize">{plan.goal_type}</span>
                    <span>{getModelLabel(plan.model_id)}</span>
                    <span>{plan.tokens_used} tokens used</span>
                    <span>
                      {new Date(plan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletingId === plan.id}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === plan.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {plan.plan_data && (
                <div className="mt-3 space-y-2">
                  {(plan.plan_data as Record<string, unknown>).software_description ? (
                    <p className="text-sm text-zinc-600 line-clamp-2">
                      {String((plan.plan_data as Record<string, unknown>).software_description)}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
