import {
  registerProvider,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentProvider,
  type WebhookVerification,
} from "../payment.ts";
import { createServiceClient } from "../utils.ts";

function getConfig() {
  const username = Deno.env.get("FASTSPRING_API_USERNAME");
  const password = Deno.env.get("FASTSPRING_API_PASSWORD");
  const webhookSecret = Deno.env.get("FASTSPRING_WEBHOOK_SECRET");
  const rawStorefront = (Deno.env.get("FASTSPRING_STOREFRONT") || "").trim();

  if (!username || !password) {
    throw new Error("Missing FASTSPRING_API_USERNAME or FASTSPRING_API_PASSWORD");
  }
  if (!rawStorefront) {
    throw new Error(
      "Missing FASTSPRING_STOREFRONT (e.g. '14daysaccel.test.onfastspring.com')"
    );
  }

  const credentials = btoa(`${username}:${password}`);
  // Strip protocol and trailing slashes so we can build clean URLs
  const storefront = rawStorefront
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  return { credentials, webhookSecret, storefront };
}

/** Look up the plan's token count by its FastSpring product path. */
async function resolveTokensByProductPath(
  productPath: string
): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "subscription_plans")
    .single();

  const plans = (data?.value ?? []) as Array<{
    fastspring_product_path?: string;
    tokens_per_month: number;
  }>;

  const plan = plans.find((p) => p.fastspring_product_path === productPath);
  return plan?.tokens_per_month ?? 0;
}

function createFastSpringProvider(): PaymentProvider {
  return {
    name: "fastspring",

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
      const { storefront } = getConfig();

      const productPath = params.variantId || "tokens";

      // Build a direct storefront URL: storefront/{product_path}?referrer={userId}
      // The referrer field is passed through to FastSpring webhooks automatically.
      const checkoutUrl =
        `https://${storefront}/${productPath}?referrer=${encodeURIComponent(params.userId)}`;

      return {
        checkoutUrl,
        providerOrderId: "",
      };
    },

    async verifyWebhook(
      rawBody: string,
      signature: string
    ): Promise<WebhookVerification> {
      const { webhookSecret } = getConfig();

      if (!webhookSecret) {
        throw new Error("Missing FASTSPRING_WEBHOOK_SECRET");
      }

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signed = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody)
      );

      const computedBase64 = btoa(
        String.fromCharCode(...new Uint8Array(signed))
      );

      if (computedBase64 !== signature) {
        return {
          isValid: false,
          eventName: "",
          orderId: "",
          userId: "",
          tokens: 0,
          amountCents: 0,
          currency: "USD",
        };
      }

      const payload = JSON.parse(rawBody);

      // FastSpring sends an array of events
      const events = payload.events || [payload];
      const event = events[0] || {};
      const eventType = event.type || "";
      const orderData = event.data || {};

      // User ID is passed via the referrer query parameter
      const tags = orderData.tags || {};
      const userId = String(
        tags.user_id || orderData.referrer || ""
      );

      // Determine token count from the purchased product path
      const items = orderData.items || [];
      const firstProductPath = items[0]?.product || "";
      let tokens = parseInt(String(tags.tokens || "0"), 10);
      if (!tokens && firstProductPath) {
        tokens = await resolveTokensByProductPath(firstProductPath);
      }

      const totalDollars = orderData.total || orderData.subtotal || 0;
      const amountCents = Math.round(totalDollars * 100);

      return {
        isValid: true,
        eventName: eventType,
        orderId: String(orderData.id || orderData.order || ""),
        userId,
        tokens,
        amountCents,
        currency: orderData.currency || "USD",
      };
    },
  };
}

registerProvider("fastspring", createFastSpringProvider);
