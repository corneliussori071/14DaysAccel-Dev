import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      );
    }

    // Verify user via their JWT
    const supabase = getSupabaseAdmin();
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tokens, amountCents, planName, redirectUrl, variantId, planId, affiliateReferral } = body;

    if (
      !tokens ||
      !amountCents ||
      typeof tokens !== "number" ||
      typeof amountCents !== "number" ||
      tokens <= 0 ||
      amountCents <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid tokens or amount" },
        { status: 400 }
      );
    }

    // Forward to the Supabase edge function server-side (no CORS)
    const functionsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`;

    const res = await fetch(functionsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokens, amountCents, planName, variantId, planId, redirectUrl, affiliateReferral }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Checkout failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    await logError({
      message: "Failed to create checkout",
      source: "api",
      path: "/api/internal/checkout",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
