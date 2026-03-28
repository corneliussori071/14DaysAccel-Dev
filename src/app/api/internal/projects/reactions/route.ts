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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ reaction: null });
    }

    const supabase = getSupabaseAdmin();
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ reaction: null });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("project_reactions")
      .select("id, reaction_type")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ reaction: data });
  } catch (err) {
    await logError({
      message: "Failed to fetch reaction",
      source: "api",
      path: "/api/internal/projects/reactions",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to fetch reaction" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { projectId, reactionType } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!["like", "dislike"].includes(reactionType)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("project_reactions")
      .select("id, reaction_type")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    let action: "added" | "removed" | "switched";

    if (existing) {
      if (existing.reaction_type === reactionType) {
        await supabase
          .from("project_reactions")
          .delete()
          .eq("id", existing.id);
        action = "removed";
      } else {
        await supabase
          .from("project_reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existing.id);
        action = "switched";
      }
    } else {
      await supabase.from("project_reactions").insert({
        project_id: projectId,
        user_id: user.id,
        reaction_type: reactionType,
      });
      action = "added";
    }

    const { data: project } = await supabase
      .from("projects")
      .select("likes_count, dislikes_count")
      .eq("id", projectId)
      .single();

    return NextResponse.json({
      action,
      likes_count: project?.likes_count ?? 0,
      dislikes_count: project?.dislikes_count ?? 0,
    });
  } catch (err) {
    await logError({
      message: "Failed to toggle reaction",
      source: "api",
      path: "/api/internal/projects/reactions",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
