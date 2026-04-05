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
    const { projectId, redirectUrl, affiliateReferral } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title, status, price_usd, product_path, product_variable, dodo_product_path, dodo_product_variable")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.status !== "available") {
      return NextResponse.json(
        { error: "Project is not available for purchase" },
        { status: 400 }
      );
    }

    if (!project.price_usd || project.price_usd <= 0) {
      return NextResponse.json(
        { error: "Project does not have a valid price" },
        { status: 400 }
      );
    }

    const { data: existingPurchase } = await supabase
      .from("project_purchases")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You have already purchased this project" },
        { status: 400 }
      );
    }

    const amountCents = Math.round(project.price_usd * 100);

    // Determine which product ID to use based on active payment provider
    const { data: adminSettings } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_providers")
      .single();

    const activeProvider = adminSettings?.value?.active_provider || "creem";
    let variantId: string | undefined;
    if (activeProvider === "dodo") {
      variantId = project.dodo_product_variable || project.dodo_product_path || undefined;
    } else {
      variantId = project.product_variable || project.product_path || undefined;
    }

    // Build a full redirect URL from the request origin
    const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_SITE_URL || "https://14daysaccel.dev";

    const functionsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`;

    const res = await fetch(functionsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokens: 0,
        amountCents,
        planName: project.title,
        variantId,
        projectId: project.id,
        redirectUrl:
          redirectUrl ||
          `${origin}/projects/${project.id}?payment=success`,
        affiliateReferral,
      }),
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
      message: "Failed to create project checkout",
      source: "api",
      path: "/api/internal/projects/checkout",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
