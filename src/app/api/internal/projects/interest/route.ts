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

export async function POST(request: NextRequest) {
  try {
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

    const { error } = await supabase
      .from("project_interests")
      .upsert(
        {
          project_id: projectId,
          email: sanitizedEmail,
          name: sanitizedName,
        },
        { onConflict: "project_id,email" }
      );

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
