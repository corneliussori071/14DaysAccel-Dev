import {
  verifyUser,
  getCorsHeaders,
  errorResponse,
  jsonResponse,
} from "../_shared/utils.ts";
import { getProvider } from "../_shared/payment.ts";
import "../_shared/providers/lemonsqueezy.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders() });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const user = await verifyUser(req.headers.get("Authorization"));

    const { tokens, amountCents, planName, redirectUrl } = await req.json();

    if (!tokens || !amountCents || tokens <= 0 || amountCents <= 0) {
      return errorResponse("Invalid tokens or amount");
    }

    const provider = getProvider();

    const siteUrl =
      Deno.env.get("SITE_URL") || "https://14daysaccel.com";
    const finalRedirectUrl =
      redirectUrl || `${siteUrl}/subscriptions?payment=success`;

    const result = await provider.createCheckout({
      userId: user.id,
      userEmail: user.email || "",
      tokens,
      amountCents,
      redirectUrl: finalRedirectUrl,
      planName,
    });

    return jsonResponse({
      checkoutUrl: result.checkoutUrl,
      orderId: result.providerOrderId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("create-checkout error:", message);

    if (
      message.includes("authorization") ||
      message.includes("session")
    ) {
      return errorResponse(message, 401);
    }
    return errorResponse(message, 500);
  }
});
