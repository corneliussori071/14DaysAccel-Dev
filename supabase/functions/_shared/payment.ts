import { createServiceClient } from "./utils.ts";

// --- Payment Provider Interface ---

export interface CheckoutParams {
  userId: string;
  userEmail: string;
  tokens: number;
  amountCents: number;
  redirectUrl: string;
  planName?: string;
  variantId?: string;
  projectId?: string;
  affiliateReferral?: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerOrderId: string;
  /** Session ID for session-based checkout integrations */
  sessionId?: string;
}

export interface WebhookVerification {
  isValid: boolean;
  eventName: string;
  orderId: string;
  userId: string;
  tokens: number;
  amountCents: number;
  currency: string;
  projectId?: string;
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  verifyWebhook(
    rawBody: string,
    signature: string
  ): Promise<WebhookVerification>;
}

// --- Provider Registry ---

const providers: Record<string, () => PaymentProvider> = {};

export function registerProvider(
  name: string,
  factory: () => PaymentProvider
): void {
  providers[name] = factory;
}

export function getProvider(name?: string): PaymentProvider {
  const providerName =
    name || Deno.env.get("PAYMENT_PROVIDER") || "creem";
  const factory = providers[providerName];
  if (!factory) {
    throw new Error(
      `Payment provider "${providerName}" is not registered. Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return factory();
}

/** Reads the active payment provider name from admin_settings DB. */
export async function getActiveProviderName(): Promise<string> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_providers")
      .single();
    if (data?.value && typeof data.value === "object") {
      const config = data.value as { active_provider?: string };
      if (config.active_provider) return config.active_provider;
    }
  } catch {
    // Fall back to env var / default
  }
  return Deno.env.get("PAYMENT_PROVIDER") || "creem";
}

// --- Token crediting (shared across all providers) ---

export async function creditTokensToUser(
  userId: string,
  tokens: number,
  providerName: string,
  providerOrderId: string,
  amountCents: number,
  currency: string
): Promise<void> {
  const supabase = createServiceClient();

  // Check for duplicate processing
  const { data: existing } = await supabase
    .from("payment_orders")
    .select("id")
    .eq("provider", providerName)
    .eq("provider_order_id", providerOrderId)
    .eq("status", "completed")
    .maybeSingle();

  if (existing) {
    return; // Already processed, idempotent
  }

  // Insert or update the payment order
  await supabase.from("payment_orders").upsert(
    {
      user_id: userId,
      provider: providerName,
      provider_order_id: providerOrderId,
      tokens,
      amount_cents: amountCents,
      currency,
      status: "completed",
    },
    { onConflict: "provider,provider_order_id" }
  );

  // Credit tokens to user wallet
  const { data: wallet } = await supabase
    .from("token_wallets")
    .select("balance_tokens")
    .eq("user_id", userId)
    .single();

  if (wallet) {
    await supabase
      .from("token_wallets")
      .update({ balance_tokens: wallet.balance_tokens + tokens })
      .eq("user_id", userId);
  } else {
    // Auto-provision wallet if it doesn't exist
    await supabase
      .from("token_wallets")
      .insert({ user_id: userId, balance_tokens: tokens });
  }

  // Log the token transaction
  await supabase.from("token_transactions").insert({
    user_id: userId,
    tokens_used: -tokens, // Negative = credit
    operation_type: "purchase",
    description: `Purchased ${tokens.toLocaleString()} tokens via ${providerName} (order: ${providerOrderId})`,
  });
}

// --- Project purchase recording ---

export async function recordProjectPurchase(
  userId: string,
  projectId: string,
  providerName: string,
  providerOrderId: string,
  amountCents: number,
  currency: string
): Promise<void> {
  const supabase = createServiceClient();

  // Idempotency: check if already recorded
  const { data: existing } = await supabase
    .from("project_purchases")
    .select("id")
    .eq("provider_order_id", providerOrderId)
    .eq("status", "completed")
    .maybeSingle();

  if (existing) return;

  const downloadExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabase.from("project_purchases").insert({
    user_id: userId,
    project_id: projectId,
    provider: providerName,
    provider_order_id: providerOrderId,
    amount_cents: amountCents,
    currency,
    status: "completed",
    download_expires_at: downloadExpiresAt,
  });
}
