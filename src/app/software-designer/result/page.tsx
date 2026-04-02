"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SoftwarePlanResponse, SoftwarePlanRequest, AiModelId } from "@/types/softwarePlan";
import { generateBusinessPlan } from "@/services/aiPlannerService";
import { supabase } from "@/lib/supabase";
import CopyButton from "@/components/software-designer/CopyButton";
import TypewriterText from "@/components/software-designer/TypewriterText";
import ThinkingIndicator from "@/components/software-designer/ThinkingIndicator";

interface StoredResult {
  plan: SoftwarePlanResponse;
  tokensUsed: number;
  businessName: string;
  modelId?: AiModelId;
}

interface PendingRequest {
  request: SoftwarePlanRequest;
  businessName: string;
  modelId: AiModelId;
  goalType: string;
}

function toDisplayString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }
  return String(value ?? "");
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<StoredResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNewResult, setIsNewResult] = useState(false);
  const [error, setError] = useState("");
  const [pendingBusinessName, setPendingBusinessName] = useState("");
  const hasStartedRef = useRef(false);

  // Tracks which sequential section is currently being revealed (typewriter)
  // 0 = description, 1 = stack, 2..N = modules, N+1 = architecture
  const [revealedUpTo, setRevealedUpTo] = useState(0);
  const advanceReveal = useCallback(() => {
    setRevealedUpTo((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Check for existing result first
    const storedResult = sessionStorage.getItem("softwarePlanResult");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
      return;
    }

    // Check for pending request
    const pendingStr = sessionStorage.getItem("softwarePlanPending");
    if (!pendingStr) {
      router.push("/software-designer");
      return;
    }

    // Prevent double execution in React strict mode
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const pending: PendingRequest = JSON.parse(pendingStr);
    sessionStorage.removeItem("softwarePlanPending");
    setPendingBusinessName(pending.businessName);
    setIsGenerating(true);

    generateBusinessPlan(pending.request)
      .then(async (apiResult) => {
        const stored: StoredResult = {
          plan: apiResult.plan,
          tokensUsed: apiResult.tokensUsed,
          businessName: pending.businessName,
          modelId: pending.modelId,
        };

        const sessionData = {
          ...stored,
          billedTokens: apiResult.billedTokens,
          promptTokens: apiResult.promptTokens,
          completionTokens: apiResult.completionTokens,
        };

        // Persist plan to database for history and capture the saved ID
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: insertedPlan } = await supabase
            .from("saved_plans")
            .insert({
              user_id: session.user.id,
              business_name: pending.businessName,
              goal_type: pending.goalType,
              model_id: pending.modelId,
              plan_data: apiResult.plan,
              tokens_used: apiResult.tokensUsed,
              billed_tokens: apiResult.billedTokens,
            })
            .select("id")
            .single();

          if (insertedPlan?.id) {
            (sessionData as Record<string, unknown>).savedPlanId = insertedPlan.id;
          }
        }

        sessionStorage.setItem(
          "softwarePlanResult",
          JSON.stringify(sessionData)
        );

        setResult(stored);
        setIsNewResult(true);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to generate plan."
        );
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [router]);

  // Thinking state while API call is in progress
  if (isGenerating) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8">
            <Link
              href="/software-designer"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Back to planner
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
              Software Plan: {pendingBusinessName}
            </h1>
          </div>
          <div className="flex justify-center py-20">
            <ThinkingIndicator />
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8">
            <Link
              href="/software-designer"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Back to planner
            </Link>
          </div>
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            {error.toLowerCase().includes("insufficient") && (
              <Link
                href="/subscriptions"
                className="mt-2 inline-block text-sm font-medium text-red-700 underline hover:text-red-900"
              >
                Purchase tokens
              </Link>
            )}
            <div className="mt-4">
              <Link
                href="/software-designer"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Try again
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading results...</p>
      </main>
    );
  }

  const { plan, tokensUsed, businessName } = result;

  const stackText = toDisplayString(plan.recommended_stack);
  const archText = toDisplayString(plan.app_architecture);
  const moduleCount = plan.modules?.length ?? 0;

  // Sequential reveal indices:
  // 0 = description, 1 = stack, 2..2+moduleCount-1 = modules, 2+moduleCount = architecture
  const stackIndex = 1;
  const moduleBaseIndex = 2;
  const archIndex = moduleBaseIndex + moduleCount;

  const descriptionText = [
    toDisplayString(plan.software_description),
    stackText ? `\nRecommended Stack: ${stackText}` : "",
    moduleCount
      ? `\nModules:\n${plan.modules.map((m) => `- ${m.name}: ${m.description} (Priority: ${m.priority})`).join("\n")}`
      : "",
  ].join("");

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <div className="mb-8">
          <Link
            href="/software-designer"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to planner
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Software Plan: {businessName}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Tokens used for this generation: {tokensUsed}
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Software System Description
              </h2>
              <CopyButton text={descriptionText} />
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
              <p className="whitespace-pre-wrap">
                {isNewResult ? (
                  <TypewriterText
                    text={toDisplayString(plan.software_description)}
                    onComplete={advanceReveal}
                  />
                ) : (
                  toDisplayString(plan.software_description)
                )}
              </p>
              {stackText && (!isNewResult || revealedUpTo >= stackIndex) && (
                <div>
                  <h3 className="mb-1 font-medium text-zinc-900">
                    Recommended Stack
                  </h3>
                  <p className="whitespace-pre-wrap">
                    {isNewResult && revealedUpTo === stackIndex ? (
                      <TypewriterText
                        text={stackText}
                        onComplete={advanceReveal}
                      />
                    ) : (
                      stackText
                    )}
                  </p>
                </div>
              )}
              {moduleCount > 0 && (!isNewResult || revealedUpTo >= moduleBaseIndex) && (
                <div>
                  <h3 className="mb-2 font-medium text-zinc-900">Modules</h3>
                  <div className="space-y-2">
                    {plan.modules.map((mod, i) => {
                      const idx = moduleBaseIndex + i;
                      if (isNewResult && revealedUpTo < idx) return null;
                      const isTyping = isNewResult && revealedUpTo === idx;
                      return (
                        <div
                          key={i}
                          className="rounded-md border border-zinc-100 bg-zinc-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-zinc-900">
                              {mod.name}
                            </span>
                            <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                              {mod.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-zinc-600">
                            {isTyping ? (
                              <TypewriterText
                                text={mod.description}
                                onComplete={advanceReveal}
                              />
                            ) : (
                              mod.description
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {(!isNewResult || revealedUpTo >= archIndex) && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Recommended App Architecture
                </h2>
                <CopyButton text={archText} />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {isNewResult && revealedUpTo === archIndex ? (
                  <TypewriterText text={archText} onComplete={advanceReveal} />
                ) : (
                  archText
                )}
              </p>
            </section>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/software-designer/prompts"
            className="rounded-md bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Generate Build Prompts
          </Link>
          <a
            href="https://www.upwork.com/freelancers/14daysaccel"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Work With Us on Upwork
          </a>
        </div>
      </div>
    </main>
  );
}
