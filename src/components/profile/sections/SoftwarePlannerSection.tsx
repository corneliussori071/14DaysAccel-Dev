"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedPlans, deleteSavedPlan } from "@/services/profileService";
import { AI_MODELS } from "@/types/softwarePlan";
import type { SavedPlan } from "@/types/profile";

export default function SoftwarePlannerSection() {
  const router = useRouter();
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

  async function handleDelete(e: React.MouseEvent, planId: string) {
    e.stopPropagation();
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

  function handleViewPlan(plan: SavedPlan) {
    sessionStorage.setItem(
      "softwarePlanResult",
      JSON.stringify({
        plan: plan.plan_data,
        tokensUsed: plan.tokens_used,
        billedTokens: plan.billed_tokens,
        businessName: plan.business_name,
        modelId: plan.model_id,
        savedPlanId: plan.id,
        generatedPrompts: plan.generated_prompts || {},
      })
    );
    router.push("/software-designer/prompts");
  }

  function getModelLabel(modelId: string): string {
    return AI_MODELS.find((m) => m.id === modelId)?.label ?? modelId;
  }

  function getGeneratedCount(plan: SavedPlan): number {
    if (!plan.generated_prompts) return 0;
    return Object.keys(plan.generated_prompts).length;
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
        Click any plan to view and generate staging prompts.
      </p>

      {plans.length === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No saved plans yet. Generate a plan from the Software Designer to see it here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {plans.map((plan) => {
            const promptCount = getGeneratedCount(plan);
            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                onClick={() => handleViewPlan(plan)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleViewPlan(plan); }}
                className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-white p-5 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {plan.business_name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="capitalize">{plan.goal_type}</span>
                      <span>{getModelLabel(plan.model_id)}</span>
                      <span>{plan.tokens_used} tokens used</span>
                      <span>
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {promptCount > 0 && (
                      <p className="mt-2 text-xs text-zinc-400">
                        {promptCount} of 6 prompts generated
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs text-zinc-400">
                      View prompts
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, plan.id)}
                      disabled={deletingId === plan.id}
                      className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === plan.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {plan.plan_data && (
                  <div className="mt-3">
                    {(plan.plan_data as Record<string, unknown>).software_description ? (
                      <p className="text-sm text-zinc-600 line-clamp-2">
                        {String((plan.plan_data as Record<string, unknown>).software_description)}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
