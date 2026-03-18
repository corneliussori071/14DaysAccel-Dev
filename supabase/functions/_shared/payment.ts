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
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerOrderId: string;
}

export interface WebhookVerification {
  isValid: boolean;
  eventName: string;
  orderId: string;
  userId: string;
  tokens: number;
  amountCents: number;
  currency: string;
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
    name || Deno.env.get("PAYMENT_PROVIDER") || "lemonsqueezy";
  const factory = providers[providerName];
  if (!factory) {
    throw new Error(
      `Payment provider "${providerName}" is not registered. Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return factory();
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
