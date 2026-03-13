import { supabase } from "@/lib/supabase";
import type { SubscriptionPlan } from "@/types/profile";

export async function getPublicSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetch("/api/internal/subscriptions");

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.plans ?? [];
}

export async function getTokenPriceUsd(): Promise<number> {
  const { data } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "token_pricing")
    .single();

  if (!data?.value) return 0.0003;

  const pricing = data.value as Array<{ cost_per_token_usd?: number }>;
  if (pricing.length > 0 && pricing[0].cost_per_token_usd) {
    return pricing[0].cost_per_token_usd;
  }

  return 0.0003;
}
