"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOKEN_PRICE_USD } from "@/types/softwarePlan";
import type { SubscriptionPlan } from "@/types/profile";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [customTokens, setCustomTokens] = useState(1000);
  const [customPlan, setCustomPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    async function loadPlans() {
      try {
        const res = await fetch("/api/internal/subscriptions");
        if (res.ok) {
          const data = await res.json();
          const allPlans: SubscriptionPlan[] = (data.plans || []).map(
            (p: SubscriptionPlan) => ({
              ...p,
              features: p.features || [],
              plan_type: p.plan_type || "subscription",
            })
          );
          setPlans(allPlans.filter((p) => p.plan_type !== "custom"));
          const custom = allPlans.find((p) => p.plan_type === "custom");
          if (custom) {
            setCustomPlan(custom);
            setCustomTokens(
              Math.min(
                Math.max(custom.min_tokens || 100, 1000),
                custom.max_tokens || 100000
              )
            );
          }
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  function handleSubscribe(plan: SubscriptionPlan) {
    // Payment gateway integration point
    // Replace with actual payment flow (Stripe, Paddle, etc.)
    alert(
      `Payment integration pending.\n\nPlan: ${plan.name}\nPrice: $${plan.price_usd}/month\nTokens: ${plan.tokens_per_month.toLocaleString()}/month`
    );
  }

  function handleCustomPurchase() {
    if (!customPlan) return;
    const cost = customTokens * TOKEN_PRICE_USD;
    // Payment gateway integration point  
    // Replace with actual payment flow (Stripe, Paddle, etc.)
    alert(
      `Payment integration pending.\n\nTokens: ${customTokens.toLocaleString()}\nCost: $${cost.toFixed(2)}`
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading plans...</p>
      </main>
    );
  }

  const customCost = customTokens * TOKEN_PRICE_USD;

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-16 md:px-12">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Pricing
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-zinc-500">
            Choose a plan that fits your needs. All plans include access to all
            AI models and the full Software Designer toolkit.
          </p>
        </div>

        {/* Subscription Plans */}
        {plans.length > 0 && (
          <div className="mb-16">
            <div
              className={`grid gap-6 ${
                plans.length === 1
                  ? "mx-auto max-w-sm grid-cols-1"
                  : plans.length === 2
                    ? "mx-auto max-w-2xl grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col rounded-lg border border-zinc-200 bg-white"
                >
                  {/* Plan Header */}
                  <div className="border-b border-zinc-100 px-6 py-6">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {plan.name}
                    </h2>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-zinc-900">
                        ${plan.price_usd}
                      </span>
                      <span className="text-sm text-zinc-500">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">
                      {plan.tokens_per_month.toLocaleString()} tokens per month
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 px-6 py-5">
                    {plan.features.length > 0 ? (
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-zinc-700"
                          >
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">
                        Contact us for plan details.
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="border-t border-zinc-100 px-6 py-4">
                    {user ? (
                      <button
                        onClick={() => handleSubscribe(plan)}
                        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                      >
                        Subscribe
                      </button>
                    ) : (
                      <Link
                        href="/software-designer?auth=signup"
                        className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        Sign up to subscribe
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Token Pack */}
        {customPlan && (
          <div className="mx-auto max-w-lg">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-zinc-900">
                {customPlan.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Buy exactly the tokens you need. No subscription required.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Number of tokens
                </label>
                <input
                  type="number"
                  min={customPlan.min_tokens || 100}
                  max={customPlan.max_tokens || 100000}
                  step={100}
                  value={customTokens}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setCustomTokens(val);
                  }}
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    Min: {(customPlan.min_tokens ?? 100).toLocaleString()}
                  </span>
                  <span>
                    Max: {(customPlan.max_tokens ?? 100000).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mb-5 rounded-md bg-zinc-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Token price</span>
                  <span className="text-zinc-900">
                    ${TOKEN_PRICE_USD} / token
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Total</span>
                  <span className="text-lg font-semibold text-zinc-900">
                    ${customCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {customPlan.features.length > 0 && (
                <ul className="mb-5 space-y-2">
                  {customPlan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-700"
                    >
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {user ? (
                <button
                  onClick={handleCustomPurchase}
                  disabled={
                    customTokens < (customPlan.min_tokens ?? 100) ||
                    customTokens > (customPlan.max_tokens ?? 100000)
                  }
                  className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Purchase {customTokens.toLocaleString()} Tokens &ndash; $
                  {customCost.toFixed(2)}
                  <span className="block text-xs font-normal opacity-70 mt-0.5">
                    {(customPlan.min_tokens ?? 100).toLocaleString()} &ndash;{" "}
                    {(customPlan.max_tokens ?? 100000).toLocaleString()} tokens
                    available
                  </span>
                </button>
              ) : (
                <Link
                  href="/software-designer?auth=signup"
                  className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Sign up to purchase
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {plans.length === 0 && !customPlan && (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              No plans available at this time. Please check back later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
