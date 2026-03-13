import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "subscription_plans")
      .single();

    if (error || !data) {
      return NextResponse.json({ plans: [] });
    }

    const allPlans = (data.value as Array<Record<string, unknown>>) || [];
    const activePlans = allPlans.filter(
      (plan) => plan.is_active !== false
    );

    return NextResponse.json({ plans: activePlans });
  } catch {
    return NextResponse.json({ plans: [] });
  }
}
