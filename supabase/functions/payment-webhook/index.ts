import { getCorsHeaders, errorResponse, jsonResponse } from "../_shared/utils.ts";
import { getProvider, getActiveProviderName, creditTokensToUser, recordProjectPurchase } from "../_shared/payment.ts";
import "../_shared/providers/creem.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders() });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const rawBody = await req.text();

    // Creem uses creem-signature header for webhook verification
    const signature = req.headers.get("creem-signature") || "";

    if (!signature) {
      console.error("Webhook received without signature");
      return errorResponse("Missing signature", 401);
    }

    const provider = getProvider("creem");
    const verification = await provider.verifyWebhook(rawBody, signature);

    if (!verification.isValid) {
      console.error("Webhook signature verification failed");
      return errorResponse("Invalid signature", 401);
    }

    // Process completed checkout events from Creem
    const completedEvents = ["checkout.completed"];
    if (!completedEvents.includes(verification.eventName)) {
      return jsonResponse({ received: true, skipped: verification.eventName });
    }

    if (!verification.userId) {
      console.error("Webhook missing user ID:", {
        userId: verification.userId,
      });
      return errorResponse("Missing custom data in webhook", 400);
    }

    // Route to project purchase or token credit based on projectId
    if (verification.projectId) {
      await recordProjectPurchase(
        verification.userId,
        verification.projectId,
        provider.name,
        verification.orderId,
        verification.amountCents,
        verification.currency
      );

      console.log(
        `Project purchase processed: project ${verification.projectId} for user ${verification.userId}`
      );
    } else {
      if (!verification.tokens || verification.tokens <= 0) {
        console.error("Webhook missing tokens for token purchase:", {
          tokens: verification.tokens,
        });
        return errorResponse("Missing token count in webhook", 400);
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
    }

    return jsonResponse({ received: true, processed: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("payment-webhook error:", message);
    return errorResponse(message, 500);
  }
});
