import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  let query = supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.eq("id", search);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data || [] });
}
