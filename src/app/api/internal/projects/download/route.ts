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

    const { searchParams } = new URL(request.url);
    const listAll = searchParams.get("list");

    if (listAll === "true") {
      const { data: purchases, error: listError } = await supabase
        .from("project_purchases")
        .select("*, project:projects(title, slug, profile_image)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (listError) {
        return NextResponse.json(
          { error: "Failed to fetch purchases" },
          { status: 500 }
        );
      }

      const mapped = (purchases ?? []).map((p) => {
        const proj = p.project && typeof p.project === "object"
          ? (p.project as { title: string; slug: string; profile_image: string | null })
          : null;
        return {
          ...p,
          project: undefined,
          project_title: proj?.title,
          project_slug: proj?.slug,
          project_image: proj?.profile_image,
        };
      });

      return NextResponse.json({ purchases: mapped });
    }

    const purchaseId = searchParams.get("purchaseId");

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      );
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("project_purchases")
      .select("*, project:projects(source_code_url, source_code_name, supplementary_files)")
      .eq("id", purchaseId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    const expiresAt = new Date(purchase.download_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 410 }
      );
    }

    const project =
      purchase.project && typeof purchase.project === "object"
        ? (purchase.project as {
            source_code_url: string | null;
            source_code_name: string | null;
            supplementary_files: { url: string; name: string }[];
          })
        : null;

    let sourceCode: { name: string; url: string } | null = null;
    if (project?.source_code_url) {
      const { data: signedData, error: signError } = await supabase.storage
        .from("project-source-code")
        .createSignedUrl(project.source_code_url, 3600);

      if (!signError && signedData?.signedUrl) {
        sourceCode = {
          name: project.source_code_name || "source-code.zip",
          url: signedData.signedUrl,
        };
      }
    }

    const supplementaryFiles: { name: string; url: string }[] = [];
    if (project?.supplementary_files && Array.isArray(project.supplementary_files)) {
      for (const file of project.supplementary_files) {
        const { data: signedData, error: signError } = await supabase.storage
          .from("project-source-code")
          .createSignedUrl(file.url, 3600);

        if (!signError && signedData?.signedUrl) {
          supplementaryFiles.push({
            name: file.name,
            url: signedData.signedUrl,
          });
        }
      }
    }

    return NextResponse.json({
      sourceCodeUrl: sourceCode?.url ?? null,
      sourceCodeName: sourceCode?.name ?? null,
      supplementaryFiles,
      expiresAt: purchase.download_expires_at,
    });
  } catch (err) {
    await logError({
      message: "Failed to generate download links",
      source: "api",
      path: "/api/internal/projects/download",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to generate download links" },
      { status: 500 }
    );
  }
}
