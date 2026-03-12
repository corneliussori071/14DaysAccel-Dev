import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(url, serviceKey);
}

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ projects: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, description, features, tech_stack, status, featured, upwork_link, youtube_link, tiktok_link, media_files, profile_image } = body;

    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: "Title, slug, and description are required" },
        { status: 400 }
      );
    }

    const sanitizedSlug = String(slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 200);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: String(title).slice(0, 500),
        slug: sanitizedSlug,
        description: String(description).slice(0, 5000),
        features: Array.isArray(features) ? features.map(String) : [],
        tech_stack: Array.isArray(tech_stack) ? tech_stack.map(String) : [],
        status: status === "available" ? "available" : "upcoming",
        featured: featured === true,
        upwork_link: upwork_link ? String(upwork_link).slice(0, 1000) : null,
        youtube_link: youtube_link ? String(youtube_link).slice(0, 1000) : null,
        tiktok_link: tiktok_link ? String(tiktok_link).slice(0, 1000) : null,
        media_files: Array.isArray(body.media_files) ? body.media_files : [],
        profile_image: body.profile_image ? String(body.profile_image).slice(0, 2000) : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ project: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const sanitized: Record<string, unknown> = {};
    if (updates.title !== undefined) sanitized.title = String(updates.title).slice(0, 500);
    if (updates.slug !== undefined)
      sanitized.slug = String(updates.slug).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 200);
    if (updates.description !== undefined) sanitized.description = String(updates.description).slice(0, 5000);
    if (updates.features !== undefined)
      sanitized.features = Array.isArray(updates.features) ? updates.features.map(String) : [];
    if (updates.tech_stack !== undefined)
      sanitized.tech_stack = Array.isArray(updates.tech_stack) ? updates.tech_stack.map(String) : [];
    if (updates.status !== undefined)
      sanitized.status = updates.status === "available" ? "available" : "upcoming";
    if (updates.featured !== undefined) sanitized.featured = updates.featured === true;
    if (updates.upwork_link !== undefined)
      sanitized.upwork_link = updates.upwork_link ? String(updates.upwork_link).slice(0, 1000) : null;
    if (updates.youtube_link !== undefined)
      sanitized.youtube_link = updates.youtube_link ? String(updates.youtube_link).slice(0, 1000) : null;
    if (updates.tiktok_link !== undefined)
      sanitized.tiktok_link = updates.tiktok_link ? String(updates.tiktok_link).slice(0, 1000) : null;
    if (updates.media_files !== undefined)
      sanitized.media_files = Array.isArray(updates.media_files) ? updates.media_files : [];
    if (updates.profile_image !== undefined)
      sanitized.profile_image = updates.profile_image ? String(updates.profile_image).slice(0, 2000) : null;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .update(sanitized)
      .eq("id", String(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ project: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", String(id));

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
