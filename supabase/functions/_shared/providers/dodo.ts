import {
  registerProvider,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentProvider,
  type WebhookVerification,
} from "../payment.ts";

function getConfig() {
  const apiKey = Deno.env.get("DODO_API_KEY");
  const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");
  const isTestMode = Deno.env.get("DODO_TEST_MODE") === "true";

  if (!apiKey) throw new Error("Missing DODO_API_KEY");

  const baseUrl = isTestMode
    ? "https://test.dodopayments.com"
    : "https://live.dodopayments.com";

  return { apiKey, webhookSecret, baseUrl };
}

function createDodoProvider(): PaymentProvider {
  return {
    name: "dodo",

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
      const { apiKey, baseUrl } = getConfig();

      const productId = params.variantId;
      if (!productId) {
        throw new Error("No Dodo product ID provided for checkout");
      }

      const body: Record<string, unknown> = {
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: params.redirectUrl,
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
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Dodo checkout creation failed: ${response.status} - ${errText}`
        );
      }

      const data = await response.json();
      const checkoutUrl = data.checkout_url;
      const sessionId = data.session_id;

      if (!checkoutUrl || !sessionId) {
        throw new Error("Invalid checkout response from Dodo");
      }

      return {
        checkoutUrl,
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
        throw new Error("Missing DODO_WEBHOOK_SECRET");
      }

      // Dodo follows the Standard Webhooks specification:
      // The signature header format is "v1,<base64-signature>"
      // The signed content is "<webhook-id>.<webhook-timestamp>.<rawBody>"
      // We receive the concatenated header values as: "id|timestamp|signature"
      // (parsed by the webhook handler before calling this)
      const parts = signature.split("|");
      if (parts.length !== 3) {
        return invalidResult();
      }

      const [webhookId, webhookTimestamp, webhookSignature] = parts;

      // Verify timestamp is within tolerance (5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const ts = parseInt(webhookTimestamp, 10);
      if (isNaN(ts) || Math.abs(now - ts) > 300) {
        return invalidResult();
      }

      // Build the signed content per Standard Webhooks spec
      const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

      // The webhook secret from Dodo starts with "whsec_" followed by base64
      const secretBytes = base64Decode(
        webhookSecret.startsWith("whsec_")
          ? webhookSecret.slice(6)
          : webhookSecret
      );

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signed = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(signedContent)
      );

      const computedSig = btoa(
        String.fromCharCode(...new Uint8Array(signed))
      );

      // The webhook-signature header may contain multiple signatures: "v1,<sig1> v1,<sig2>"
      const expectedSigs = webhookSignature
        .split(" ")
        .map((s) => s.replace(/^v1,/, ""));

      const isValid = expectedSigs.some((expected) => expected === computedSig);

      if (!isValid) {
        return invalidResult();
      }

      const payload = JSON.parse(rawBody);
      const eventType = payload.type || "";
      const eventData = payload.data || {};

      // Extract metadata and payment details
      const metadata = eventData.metadata || {};
      const paymentId = eventData.payment_id || "";
      const totalAmount = eventData.total_amount || 0;
      const currency = eventData.currency || "USD";

      return {
        isValid: true,
        eventName: eventType,
        orderId: paymentId,
        userId: String(metadata.user_id || ""),
        tokens: parseInt(String(metadata.tokens || "0"), 10),
        amountCents: totalAmount,
        currency,
        projectId: metadata.project_id
          ? String(metadata.project_id)
          : undefined,
      };
    },
  };
}

function invalidResult(): WebhookVerification {
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

function base64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

registerProvider("dodo", createDodoProvider);
