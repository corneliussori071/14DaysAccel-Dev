import {
  registerProvider,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentProvider,
  type WebhookVerification,
} from "../payment.ts";

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

function createFastSpringProvider(): PaymentProvider {
  return {
    name: "fastspring",

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
      const { credentials } = getConfig();

      const productPath = params.variantId || "tokens";

      const sessionPayload = {
        account: {
          contact: {
            email: params.userEmail,
          },
        },
        items: [
          {
            product: productPath,
            quantity: 1,
            pricing: {
              price: {
                USD: params.amountCents / 100,
              },
            },
          },
        ],
        tags: {
          user_id: params.userId,
          tokens: String(params.tokens),
        },
        checkout: true,
        paymentContact: {
          email: params.userEmail,
        },
      };

      const response = await fetch(`${FASTSPRING_API}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      // FastSpring checkout URL uses the session ID
      const checkoutUrl = `https://14daysaccel.onfastspring.com/session/${sessionId}`;

      return {
        checkoutUrl,
        providerOrderId: sessionId,
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

      // FastSpring uses HMAC-SHA256 with base64 encoding via X-FS-Signature header
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

      // Extract tags containing our custom data
      const tags = orderData.tags || {};
      const userId = String(tags.user_id || "");
      const tokens = parseInt(String(tags.tokens || "0"), 10);

      // Order total is in dollars, convert to cents
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

// Auto-register the provider
registerProvider("fastspring", createFastSpringProvider);
