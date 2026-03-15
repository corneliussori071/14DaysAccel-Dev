import {
  registerProvider,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentProvider,
  type WebhookVerification,
} from "../payment.ts";

const LEMON_SQUEEZY_API = "https://api.lemonsqueezy.com/v1";

function getConfig() {
  const apiKey =
    Deno.env.get("LEMON_SQUEEZY_API_KEY") ||
    Deno.env.get("LEMON_SQUEEZY_TEST_API_KEY");
  const storeId = Deno.env.get("LEMON_SQUEEZY_STORE_ID");
  const variantId = Deno.env.get("LEMON_SQUEEZY_VARIANT_ID");
  const webhookSecret = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET");

  if (!apiKey) throw new Error("Missing LEMON_SQUEEZY_API_KEY");
  if (!storeId) throw new Error("Missing LEMON_SQUEEZY_STORE_ID");
  if (!variantId) throw new Error("Missing LEMON_SQUEEZY_VARIANT_ID");

  return { apiKey, storeId, variantId, webhookSecret };
}

function createLemonSqueezyProvider(): PaymentProvider {
  return {
    name: "lemonsqueezy",

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
      const { apiKey, storeId, variantId } = getConfig();

      const body = {
        data: {
          type: "checkouts",
          attributes: {
            custom_price: params.amountCents,
            product_options: {
              name: params.planName || `${params.tokens.toLocaleString()} Tokens`,
              redirect_url: params.redirectUrl,
              enabled_variants: [parseInt(variantId, 10)],
            },
            checkout_data: {
              email: params.userEmail,
              custom: {
                user_id: params.userId,
                tokens: String(params.tokens),
              },
            },
            test_mode: !!Deno.env.get("LEMON_SQUEEZY_TEST_API_KEY"),
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId },
            },
            variant: {
              data: { type: "variants", id: variantId },
            },
          },
        },
      };

      const response = await fetch(`${LEMON_SQUEEZY_API}/checkouts`, {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Lemon Squeezy checkout creation failed: ${response.status} - ${errText}`
        );
      }

      const data = await response.json();
      const checkoutUrl = data.data?.attributes?.url;
      const checkoutId = data.data?.id;

      if (!checkoutUrl || !checkoutId) {
        throw new Error("Invalid checkout response from Lemon Squeezy");
      }

      return {
        checkoutUrl,
        providerOrderId: checkoutId,
      };
    },

    async verifyWebhook(
      rawBody: string,
      signature: string
    ): Promise<WebhookVerification> {
      const { webhookSecret } = getConfig();

      if (!webhookSecret) {
        throw new Error("Missing LEMON_SQUEEZY_WEBHOOK_SECRET");
      }

      // Verify HMAC-SHA256 signature
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

      const computedHex = Array.from(new Uint8Array(signed))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (computedHex !== signature) {
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
      const eventName = payload.meta?.event_name || "";
      const customData = payload.meta?.custom_data || {};
      const attributes = payload.data?.attributes || {};

      return {
        isValid: true,
        eventName,
        orderId: String(payload.data?.id || ""),
        userId: String(customData.user_id || ""),
        tokens: parseInt(String(customData.tokens || "0"), 10),
        amountCents: attributes.total || attributes.subtotal || 0,
        currency: attributes.currency || "USD",
      };
    },
  };
}

// Auto-register the provider
registerProvider("lemonsqueezy", createLemonSqueezyProvider);
