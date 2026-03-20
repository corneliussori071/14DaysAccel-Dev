import {
  verifyUser,
  getCorsHeaders,
  errorResponse,
  jsonResponse,
  createServiceClient,
} from "../_shared/utils.ts";
import { getProvider, getActiveProviderName } from "../_shared/payment.ts";
import "../_shared/providers/lemonsqueezy.ts";
import "../_shared/providers/fastspring.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders() });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const user = await verifyUser(req.headers.get("Authorization"));

    const { tokens, amountCents, planName, variantId, planId, redirectUrl } = await req.json();

    if (!tokens || !amountCents || tokens <= 0 || amountCents <= 0) {
      return errorResponse("Invalid tokens or amount");
    }

    // Price validation: look up the plan from admin_settings to verify pricing
    const supabase = createServiceClient();
    const { data: plansRow } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "subscription_plans")
      .single();

    const plans = (plansRow?.value ?? []) as Array<{
      id: string;
      price_usd: number;
      tokens_per_month: number;
      plan_type: string;
      lemon_variant_id?: string;
      fastspring_product_path?: string;
    }>;

    const matchedPlan = planId
      ? plans.find((p) => p.id === planId)
      : undefined;

    if (matchedPlan) {
      if (matchedPlan.plan_type === "custom") {
        // Custom plans: validate against per-token rate from token_pricing
        let tokenPriceUsd = 0.0003;
        const { data: pricingRow } = await supabase
          .from("admin_settings")
          .select("value")
          .eq("key", "token_pricing")
          .single();
        if (pricingRow?.value) {
          const models = pricingRow.value as Array<{ cost_per_token_usd: number }>;
          const baseCost = Math.min(...models.map((m) => m.cost_per_token_usd));
          if (baseCost > 0) tokenPriceUsd = baseCost;
        }
        const expectedCents = Math.round(tokens * tokenPriceUsd * 100);
        if (amountCents !== expectedCents) {
          return errorResponse(
            `Price mismatch: expected ${expectedCents} cents for ${tokens} tokens, got ${amountCents}`,
            400
          );
        }
      } else {
        // Subscription plans: validate against the plan's configured price_usd
        const expectedCents = Math.round(matchedPlan.price_usd * 100);
        if (amountCents !== expectedCents) {
          return errorResponse(
            `Price mismatch: expected ${expectedCents} cents for plan, got ${amountCents}`,
            400
          );
        }
      }
    }

    const activeProviderName = await getActiveProviderName();
    const provider = getProvider(activeProviderName);

    // Resolve the correct variant/product ID for the active provider
    let resolvedVariantId = variantId;
    if (matchedPlan) {
      if (activeProviderName === "fastspring") {
        resolvedVariantId = matchedPlan.fastspring_product_path || variantId;
      } else {
        resolvedVariantId = matchedPlan.lemon_variant_id || variantId;
      }
    }

    const siteUrl =
      Deno.env.get("SITE_URL") || "https://14daysaccel.com";
    const finalRedirectUrl =
      redirectUrl || `${siteUrl}/subscriptions?payment=success`;

    const result = await provider.createCheckout({
      userId: user.id,
      userEmail: user.email || "",
      tokens,
      amountCents,
      redirectUrl: finalRedirectUrl,
      planName,
      variantId: resolvedVariantId,
    });

    return jsonResponse({
      checkoutUrl: result.checkoutUrl,
      orderId: result.providerOrderId,
      provider: activeProviderName,
      sessionId: result.sessionId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("create-checkout error:", message);

    if (
      message.includes("Missing authorization") ||
      message.includes("Invalid or expired session")
    ) {
      return errorResponse(message, 401);
    }
    return errorResponse(message, 500);
  }
});
