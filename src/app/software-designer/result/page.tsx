"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SoftwarePlanResponse } from "@/types/softwarePlan";
import CopyButton from "@/components/software-designer/CopyButton";

interface StoredResult {
  plan: SoftwarePlanResponse;
  tokensUsed: number;
  businessName: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("softwarePlanResult");
    if (!stored) {
      router.push("/software-designer");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading results...</p>
      </main>
    );
  }

  const { plan, tokensUsed, businessName } = result;

  const descriptionText = [
    plan.software_description,
    plan.recommended_stack
      ? `\nRecommended Stack: ${plan.recommended_stack}`
      : "",
    plan.modules?.length
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
                {plan.software_description}
              </p>
              {plan.recommended_stack && (
                <div>
                  <h3 className="mb-1 font-medium text-zinc-900">
                    Recommended Stack
                  </h3>
                  <p className="whitespace-pre-wrap">
                    {plan.recommended_stack}
                  </p>
                </div>
              )}
              {plan.modules?.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-zinc-900">Modules</h3>
                  <div className="space-y-2">
                    {plan.modules.map((mod, i) => (
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
                        <p className="mt-1 text-zinc-600">{mod.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Recommended App Architecture
              </h2>
              <CopyButton text={plan.app_architecture} />
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {plan.app_architecture}
            </p>
          </section>
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
