import { getCorsHeaders, errorResponse, jsonResponse } from "../_shared/utils.ts";
import { getProvider, getActiveProviderName, creditTokensToUser } from "../_shared/payment.ts";
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
    const rawBody = await req.text();

    // Detect provider by signature header:
    // LemonSqueezy uses X-Signature, FastSpring uses X-FS-Signature
    const lsSignature = req.headers.get("X-Signature") || "";
    const fsSignature = req.headers.get("X-FS-Signature") || "";
    const signature = lsSignature || fsSignature;

    if (!signature) {
      console.error("Webhook received without signature");
      return errorResponse("Missing signature", 401);
    }

    // Pick provider based on which signature header was present
    const providerName = fsSignature ? "fastspring" : "lemonsqueezy";
    const provider = getProvider(providerName);
    const verification = await provider.verifyWebhook(rawBody, signature);

    if (!verification.isValid) {
      console.error("Webhook signature verification failed");
      return errorResponse("Invalid signature", 401);
    }

    // Process completed order events from either provider
    // LemonSqueezy: "order_created", FastSpring: "order.completed"
    const completedEvents = ["order_created", "order.completed"];
    if (!completedEvents.includes(verification.eventName)) {
      return jsonResponse({ received: true, skipped: verification.eventName });
    }

    if (!verification.userId || !verification.tokens || verification.tokens <= 0) {
      console.error("Webhook missing required custom data:", {
        userId: verification.userId,
        tokens: verification.tokens,
      });
      return errorResponse("Missing custom data in webhook", 400);
    }

    await creditTokensToUser(
      verification.userId,
      verification.tokens,
      provider.name,
      verification.orderId,
      verification.amountCents,
      verification.currency
    );

    console.log(
      `Payment processed: ${verification.tokens} tokens credited to user ${verification.userId}`
    );

    return jsonResponse({ received: true, processed: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("payment-webhook error:", message);
    return errorResponse(message, 500);
  }
});
