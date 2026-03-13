"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROMPT_STAGES, TOKEN_PRICE_USD } from "@/types/softwarePlan";
import type { SoftwarePlanResponse } from "@/types/softwarePlan";
import { generatePromptStage } from "@/services/aiPlannerService";
import { getTokenBalance } from "@/services/tokenService";
import CopyButton from "@/components/software-designer/CopyButton";

interface GeneratedPrompt {
  stage: number;
  title: string;
  prompt: string;
  tokensUsed: number;
}

interface StoredResult {
  plan: SoftwarePlanResponse;
  tokensUsed: number;
  businessName: string;
}

export default function PromptsPage() {
  const router = useRouter();
  const [storedResult, setStoredResult] = useState<StoredResult | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<
    Map<number, GeneratedPrompt>
  >(new Map());
  const [loadingStage, setLoadingStage] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("softwarePlanResult");
    if (!stored) {
      router.push("/software-designer");
      return;
    }
    setStoredResult(JSON.parse(stored));

    getTokenBalance()
      .then(setTokenBalance)
      .catch(() => setTokenBalance(0));
  }, [router]);

  async function handleGenerate(stage: number) {
    if (!storedResult) return;

    setLoadingStage(stage);
    setError("");

    try {
      const result = await generatePromptStage(
        stage,
        storedResult.businessName,
        storedResult.plan.software_description,
        storedResult.plan.app_architecture,
        storedResult.plan.recommended_stack
      );

      setGeneratedPrompts((prev) => {
        const next = new Map(prev);
        next.set(stage, {
          stage: result.stage,
          title: result.title,
          prompt: result.prompt,
          tokensUsed: result.tokensUsed,
        });
        return next;
      });

      const balance = await getTokenBalance();
      setTokenBalance(balance);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate prompt."
      );
    } finally {
      setLoadingStage(null);
    }
  }

  if (!storedResult) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <div className="mb-4">
          <Link
            href="/software-designer/result"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to results
          </Link>
        </div>

        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Build Prompts
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Generate staged prompts to build your application step by step.
              Each stage costs tokens based on AI usage.
            </p>
          </div>
          {tokenBalance !== null && (
            <div className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm">
              <span className="text-zinc-500">Token Balance: </span>
              <span className="font-medium text-zinc-900">
                {tokenBalance.toLocaleString()}
              </span>
              <span className="ml-1 text-xs text-zinc-400">
                (~${(tokenBalance * TOKEN_PRICE_USD).toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {PROMPT_STAGES.map((stageDef) => {
            const generated = generatedPrompts.get(stageDef.stage);
            const isLoading = loadingStage === stageDef.stage;

            return (
              <div
                key={stageDef.stage}
                className="rounded-lg border border-zinc-200 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                        {stageDef.stage}
                      </span>
                      <h2 className="text-base font-semibold text-zinc-900">
                        {stageDef.title}
                      </h2>
                    </div>
                    <p className="mt-2 ml-10 text-sm text-zinc-500">
                      {stageDef.description}
                    </p>
                  </div>

                  {!generated && (
                    <button
                      onClick={() => handleGenerate(stageDef.stage)}
                      disabled={isLoading || loadingStage !== null}
                      className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                    >
                      {isLoading ? "Generating..." : "Generate"}
                    </button>
                  )}
                </div>

                {generated && (
                  <div className="mt-5 ml-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        Tokens used: {generated.tokensUsed}
                      </span>
                      <CopyButton text={generated.prompt} />
                    </div>
                    <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                        {generated.prompt}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/software-designer/result"
            className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Back to Results
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
