import {
  registerProvider,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentProvider,
  type WebhookVerification,
} from "../payment.ts";
import { createServiceClient } from "../utils.ts";

const FASTSPRING_API = "https://api.fastspring.com";

function getConfig() {
  const username = Deno.env.get("FASTSPRING_API_USERNAME");
  const password = Deno.env.get("FASTSPRING_API_PASSWORD");
  const webhookSecret = Deno.env.get("FASTSPRING_WEBHOOK_SECRET");

  if (!username || !password) {
    throw new Error("Missing FASTSPRING_API_USERNAME or FASTSPRING_API_PASSWORD");
  }

  const credentials = btoa(`${username}:${password}`);
  return { credentials, webhookSecret };
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
      const { credentials } = getConfig();
      const productPath = params.variantId || "tokens";

      const sessionPayload = {
        contact: {
          email: params.userEmail,
        },
        items: [
          {
            product: productPath,
            quantity: 1,
          },
        ],
        tags: {
          user_id: params.userId,
          tokens: String(params.tokens),
        },
      };

      const response = await fetch(`${FASTSPRING_API}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `FastSpring session creation failed: ${response.status} - ${errText}`
        );
      }

      const data = await response.json();
      const sessionId = data.id;

      if (!sessionId) {
        throw new Error("Invalid session response from FastSpring");
      }

      // Session ID is consumed by the Store Builder Library on the frontend
      return {
        checkoutUrl: "",
        providerOrderId: sessionId,
        sessionId,
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

      // User ID and tokens are passed via session tags
      const tags = orderData.tags || {};
      const userId = String(tags.user_id || "");
      let tokens = parseInt(String(tags.tokens || "0"), 10);

      // Fallback: resolve tokens from the purchased product path
      if (!tokens) {
        const items = orderData.items || [];
        const firstProductPath = items[0]?.product || "";
        if (firstProductPath) {
          tokens = await resolveTokensByProductPath(firstProductPath);
        }
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
