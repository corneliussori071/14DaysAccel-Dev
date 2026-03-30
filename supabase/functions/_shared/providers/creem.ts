import {
  registerProvider,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentProvider,
  type WebhookVerification,
} from "../payment.ts";

function getConfig() {
  const apiKey = Deno.env.get("CREEM_API_KEY");
  const webhookSecret = Deno.env.get("CREEM_WEBHOOK_SECRET");
  const isTestMode = Deno.env.get("CREEM_TEST_MODE") === "true";

  if (!apiKey) throw new Error("Missing CREEM_API_KEY");

  const baseUrl = isTestMode
    ? "https://test-api.creem.io/v1"
    : "https://api.creem.io/v1";

  return { apiKey, webhookSecret, baseUrl };
}

function createCreemProvider(): PaymentProvider {
  return {
    name: "creem",

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
      const { apiKey, baseUrl } = getConfig();

      const productId = params.variantId;
      if (!productId) {
        throw new Error("No Creem product ID provided for checkout");
      }

      const body: Record<string, unknown> = {
        product_id: productId,
        success_url: params.redirectUrl,
        customer: {
          email: params.userEmail,
        },
        metadata: {
          user_id: params.userId,
          tokens: String(params.tokens),
          ...(params.projectId ? { project_id: params.projectId } : {}),
        },
      };

      const response = await fetch(`${baseUrl}/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Creem checkout creation failed: ${response.status} - ${errText}`
        );
      }

      const data = await response.json();
      const checkoutUrl = data.checkout_url;
      const checkoutId = data.id;

      if (!checkoutUrl || !checkoutId) {
        throw new Error("Invalid checkout response from Creem");
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
        throw new Error("Missing CREEM_WEBHOOK_SECRET");
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
      const eventName = payload.eventType || "";
      const metadata = payload.object?.metadata || {};
      const order = payload.object?.order || payload.object || {};

      return {
        isValid: true,
        eventName,
        orderId: String(order.id || payload.object?.id || ""),
        userId: String(metadata.user_id || ""),
        tokens: parseInt(String(metadata.tokens || "0"), 10),
        amountCents: order.amount || 0,
        currency: order.currency || "USD",
        projectId: metadata.project_id
          ? String(metadata.project_id)
          : undefined,
      };
    },
  };
}

registerProvider("creem", createCreemProvider);
