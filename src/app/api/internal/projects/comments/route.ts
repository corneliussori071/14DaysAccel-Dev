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

/* ── IP-based rate limiting: 5 comments per 30 minutes ── */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 20;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const from = (page - 1) * pageSize;
    const to = from + pageSize;

    const { data, error } = await supabase
      .from("project_comments")
      .select("id, project_id, user_id, content, created_at, updated_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const comments = (data || []).slice(0, pageSize);
    const hasMore = (data || []).length > pageSize;

    const userIds = [...new Set(comments.map((c) => c.user_id))];
    let emailMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      if (profiles) {
        for (const p of profiles) {
          emailMap[p.user_id] = p.full_name || "User";
        }
      }
    }

    const enriched = comments.map((c) => ({
      ...c,
      user_display_name: emailMap[c.user_id] || "User",
    }));

    return NextResponse.json({ comments: enriched, hasMore });
  } catch (err) {
    await logError({
      message: "Failed to fetch comments",
      source: "api",
      path: "/api/internal/projects/comments",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many comments. Please wait 30 minutes before posting again." },
        { status: 429 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
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
    const { projectId, content } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const sanitizedContent = String(content || "")
      .trim()
      .replace(/<[^>]*>/g, "")
      .slice(0, 2000);

    if (!sanitizedContent) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("project_comments")
      .insert({
        project_id: projectId,
        user_id: user.id,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err) {
    await logError({
      message: "Failed to add comment",
      source: "api",
      path: "/api/internal/projects/comments",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("project_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (err) {
    await logError({
      message: "Failed to delete comment",
      source: "api",
      path: "/api/internal/projects/comments",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
