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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── IP-based rate limiting: 5 submissions per 30 minutes ── */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
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

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait 30 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { projectId, email, name } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const sanitizedEmail = String(email || "").trim().toLowerCase().slice(0, 320);
    if (!sanitizedEmail || !EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const sanitizedName = name
      ? String(name).trim().replace(/<[^>]*>/g, "").slice(0, 200)
      : null;

    const supabase = getSupabaseAdmin();

    const { data: project } = await supabase
      .from("projects")
      .select("id, status")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.status !== "upcoming") {
      return NextResponse.json(
        { error: "Interest registration is only available for upcoming projects" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("project_interests")
      .select("id")
      .eq("project_id", projectId)
      .eq("email", sanitizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This email has already registered interest for this project." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("project_interests")
      .insert({
        project_id: projectId,
        email: sanitizedEmail,
        name: sanitizedName,
      });

    if (error) throw error;

    return NextResponse.json(
      { registered: true },
      { status: 201 }
    );
  } catch (err) {
    await logError({
      message: "Failed to register interest",
      source: "api",
      path: "/api/internal/projects/interest",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to register interest" },
      { status: 500 }
    );
  }
}
