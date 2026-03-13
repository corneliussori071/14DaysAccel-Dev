"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SoftwarePlanRequest } from "@/types/softwarePlan";
import { AI_MODELS, MIN_TOKENS_REQUIRED } from "@/types/softwarePlan";
import type { AiModelId } from "@/types/softwarePlan";
import { generateBusinessPlan } from "@/services/aiPlannerService";
import AuthModal from "@/components/software-designer/AuthModal";

const INDUSTRIES = [
  "Agriculture",
  "Automotive",
  "Construction",
  "Education",
  "Energy",
  "Entertainment",
  "Finance",
  "Food and Beverage",
  "Healthcare",
  "Hospitality",
  "Insurance",
  "Legal",
  "Logistics",
  "Manufacturing",
  "Media",
  "Nonprofits",
  "Real Estate",
  "Retail",
  "SaaS",
  "Sports",
  "Technology",
  "Telecommunications",
  "Transportation",
  "Travel",
  "Other",
];

type GoalType = "prompts" | "ideas";

export default function SoftwareDesignerPage() {
  return (
    <Suspense>
      <SoftwareDesignerContent />
    </Suspense>
  );
}

function SoftwareDesignerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [softwareFeatures, setSoftwareFeatures] = useState("");
  const [techStack, setTechStack] = useState("");
  const [dailyOperations, setDailyOperations] = useState("");
  const [softwareProblem, setSoftwareProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [modelId, setModelId] = useState<AiModelId>("gpt-5.3-codex");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "signup") {
      if (!isAuthenticated) {
        setAuthMode(authParam);
        setShowAuth(true);
      }
    }
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && pendingSubmit) {
      setPendingSubmit(false);
      handleSubmit();
    }
  }, [isAuthenticated, pendingSubmit]);

  const selectedIndustry = industry === "Other" ? customIndustry : industry;

  function buildRequest(): SoftwarePlanRequest {
    if (goalType === "prompts") {
      return {
        businessName,
        goalType: "prompts",
        modelId,
        industry: selectedIndustry,
        softwareFeatures,
        techStack,
      };
    }
    return {
      businessName,
      goalType: "ideas",
      modelId,
      dailyOperations,
      softwareProblem,
    };
  }

  function isFormValid(): boolean {
    if (!businessName.trim() || !goalType) return false;
    if (goalType === "prompts") {
      return !!(selectedIndustry.trim() && softwareFeatures.trim());
    }
    return !!(dailyOperations.trim() && softwareProblem.trim());
  }

  async function handleSubmit() {
    if (!isFormValid()) return;

    if (!isAuthenticated) {
      setPendingSubmit(true);
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const request = buildRequest();
      const result = await generateBusinessPlan(request);

      sessionStorage.setItem(
        "softwarePlanResult",
        JSON.stringify({
          plan: result.plan,
          tokensUsed: result.tokensUsed,
          billedTokens: result.billedTokens,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          businessName,
          modelId,
        })
      );

      router.push("/software-designer/result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate plan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            AI Software Planner
          </h1>
          <p className="mt-3 text-base text-zinc-500">
            Describe your business or software concept. The planner generates a
            structured development plan with architecture recommendations and
            staged build prompts.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="businessName"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              Business Name / Software Name
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter the name of your business or software"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              What do you want to do today?
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setGoalType("prompts")}
                className={`w-full rounded-md border p-4 text-left text-sm transition-colors ${
                  goalType === "prompts"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                }`}
              >
                <span className="font-medium">
                  Option 1: Software Engineering Prompts
                </span>
                <span className="mt-1 block text-xs opacity-80">
                  Professional prompts that ensure proper app structure, commit
                  best practices, performance, security, and future scalability.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setGoalType("ideas")}
                className={`w-full rounded-md border p-4 text-left text-sm transition-colors ${
                  goalType === "ideas"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                }`}
              >
                <span className="font-medium">
                  Option 2: Business Idea Generation
                </span>
                <span className="mt-1 block text-xs opacity-80">
                  Generate business ideas with professional software engineering
                  AI prompts.
                </span>
              </button>
            </div>
          </div>

          {goalType === "prompts" && (
            <div className="space-y-5 rounded-md border border-zinc-200 bg-white p-5">
              <div>
                <label
                  htmlFor="industry"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Industry
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                {industry === "Other" && (
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="Enter your industry"
                    className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="softwareFeatures"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Describe Software Features
                </label>
                <textarea
                  id="softwareFeatures"
                  value={softwareFeatures}
                  onChange={(e) => setSoftwareFeatures(e.target.value)}
                  rows={4}
                  placeholder="List the key features and capabilities you need"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor="techStack"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Preferred Tech Stack
                </label>
                <textarea
                  id="techStack"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  rows={2}
                  placeholder="e.g. React, Node.js, PostgreSQL, Supabase"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>
          )}

          {goalType === "ideas" && (
            <div className="space-y-5 rounded-md border border-zinc-200 bg-white p-5">
              <div>
                <label
                  htmlFor="dailyOperations"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Describe Daily Operations of Your Business
                </label>
                <textarea
                  id="dailyOperations"
                  value={dailyOperations}
                  onChange={(e) => setDailyOperations(e.target.value)}
                  rows={4}
                  placeholder="Describe what your business does on a daily basis"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor="softwareProblem"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Describe the Software Problem You Want to Solve
                </label>
                <textarea
                  id="softwareProblem"
                  value={softwareProblem}
                  onChange={(e) => setSoftwareProblem(e.target.value)}
                  rows={4}
                  placeholder="What specific problem should the software address?"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              AI Model
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setModelId(model.id)}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${
                    modelId === model.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  <span className="font-medium">{model.label}</span>
                  <span
                    className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      modelId === model.id
                        ? model.tokenMultiplier > 1
                          ? "bg-amber-400 text-amber-900"
                          : "bg-zinc-700 text-zinc-200"
                        : model.tokenMultiplier > 1
                          ? "bg-amber-50 text-amber-700"
                          : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {model.tokenMultiplier}x tokens
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              Minimum {MIN_TOKENS_REQUIRED} tokens required per request. Higher
              multiplier models consume more tokens.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="w-full rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Generating Plan..." : "Generate Plan"}
          </button>
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false);
            setPendingSubmit(false);
          }}
          initialMode={authMode}
        />
      )}
    </main>
  );
}

