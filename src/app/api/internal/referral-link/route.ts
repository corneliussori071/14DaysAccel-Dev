import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      );
    }

    const affonsoApiKey = process.env.AFFONSO_API_KEY;
    if (!affonsoApiKey) {
      return NextResponse.json(
        { error: "Affiliate program is not configured" },
        { status: 503 }
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

    const res = await fetch("https://api.affonso.io/v1/embed/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${affonsoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        programId: "cmnhrlrmv007t12yp8mr2hqls",
        partner: {
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email || "",
        },
        externalUserId: user.id,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Affonso referral link error:", res.status, errText);
      return NextResponse.json(
        { error: "Failed to retrieve referral information" },
        { status: 502 }
      );
    }

    const { data } = await res.json();

    const referralLink = data.referralLink || data.link || `https://14daysacceldev.com/?ref=${user.id}`;

    return NextResponse.json({
      referralLink,
      userId: user.id,
      partnerEmail: user.email,
    });
  } catch (err) {
    console.error("referral-link error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve referral link" },
      { status: 500 }
    );
  }
}
