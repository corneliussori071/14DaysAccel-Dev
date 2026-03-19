import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";
import { logError } from "@/lib/logger";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 5;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const projectSlug = formData.get("projectSlug");

    if (!projectSlug || typeof projectSlug !== "string") {
      return NextResponse.json(
        { error: "Project slug is required" },
        { status: 400 }
      );
    }

    const sanitizedSlug = projectSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 200);

    if (!sanitizedSlug) {
      return NextResponse.json(
        { error: "Invalid project slug" },
        { status: 400 }
      );
    }

    const files: File[] = [];
    for (const entry of formData.getAll("files")) {
      if (entry instanceof File) {
        files.push(entry);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 50MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type "${file.type}" is not allowed` },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const uploaded: { url: string; type: "image" | "video" | "document"; name: string }[] =
      [];

    for (const file of files) {
      const ext = file.name.split(".").pop() || "bin";
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 100);
      const timestamp = Date.now();
      const storagePath = `${sanitizedSlug}/${timestamp}-${safeName}`;

      const buffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload failed for "${file.name}": ${uploadError.message}` },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-media").getPublicUrl(storagePath);

      const fileType: "image" | "video" | "document" = file.type.startsWith("video/")
        ? "video"
        : file.type === "application/pdf" ||
            file.type === "application/msword" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ? "document"
          : "image";

      uploaded.push({
        url: publicUrl,
        type: fileType,
        name: safeName,
      });
    }

    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (err) {
    await logError({
      message: "File upload failed",
      source: "api",
      path: "/api/internal/upload",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Upload failed" },
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
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("project-media")
      .remove([filePath]);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (err) {
    await logError({
      message: "Failed to delete file",
      source: "api",
      path: "/api/internal/upload",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
