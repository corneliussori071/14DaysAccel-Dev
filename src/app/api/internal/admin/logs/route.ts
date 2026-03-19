import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

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

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("perPage") || "25", 10)));
  const level = searchParams.get("level") || "";
  const source = searchParams.get("source") || "";

  const supabase = getSupabaseAdmin();
  const offset = (page - 1) * perPage;

  // Build query for count
  let countQuery = supabase
    .from("system_logs")
    .select("id", { count: "exact", head: true });

  if (level) countQuery = countQuery.eq("level", level);
  if (source) countQuery = countQuery.eq("source", source);

  const { count, error: countError } = await countQuery;

  if (countError) {
    return NextResponse.json(
      { error: "Failed to count logs" },
      { status: 500 }
    );
  }

  // Build query for data
  let dataQuery = supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (level) dataQuery = dataQuery.eq("level", level);
  if (source) dataQuery = dataQuery.eq("source", source);

  const { data, error: dataError } = await dataQuery;

  if (dataError) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }

  const total = count ?? 0;

  return NextResponse.json({
    logs: data || [],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}
