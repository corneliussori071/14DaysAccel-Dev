import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";
import { logError } from "@/lib/logger";

const MEDIA_TYPES = [
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

const SOURCE_CODE_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-gzip",
  "application/x-tar",
  "application/x-compressed-tar",
  "application/octet-stream",
];

const SUPPLEMENTARY_TYPES = [...SOURCE_CODE_TYPES, ...MEDIA_TYPES, "text/plain", "text/markdown"];

/** Extensions allowed for source-code uploads (fallback when MIME is generic). */
const SOURCE_CODE_EXTENSIONS = [".zip", ".rar", ".gz", ".tar", ".tgz", ".tar.gz"];
const SUPPLEMENTARY_EXTENSIONS = [
  ...SOURCE_CODE_EXTENSIONS, ".pdf", ".doc", ".docx", ".txt", ".md",
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov",
];
const MEDIA_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov", ".pdf", ".doc", ".docx"];

function isAllowedFile(
  fileName: string,
  fileType: string,
  allowedTypes: string[],
  allowedExtensions: string[]
): boolean {
  if (allowedTypes.includes(fileType)) return true;
  const ext = "." + (fileName.split(".").pop() || "").toLowerCase();
  return allowedExtensions.includes(ext);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

/**
 * Returns signed upload URLs so the client can upload directly to Supabase Storage,
 * bypassing the Vercel body size limit.
 */
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectSlug, uploadType, files } = body as {
      projectSlug: string;
      uploadType: string;
      files: Array<{ name: string; size: number; type: string }>;
    };

    if (!projectSlug || typeof projectSlug !== "string") {
      return NextResponse.json({ error: "Project slug is required" }, { status: 400 });
    }

    const sanitizedSlug = projectSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 200);

    if (!sanitizedSlug) {
      return NextResponse.json({ error: "Invalid project slug" }, { status: 400 });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files specified" }, { status: 400 });
    }

    let allowedTypes: string[];
    let allowedExtensions: string[];
    let bucketName: string;
    let maxFileSize: number;
    let maxFiles: number;

    if (uploadType === "source-code") {
      allowedTypes = SOURCE_CODE_TYPES;
      allowedExtensions = SOURCE_CODE_EXTENSIONS;
      bucketName = "project-source-code";
      maxFileSize = 1024 * 1024 * 1024;
      maxFiles = 1;
    } else if (uploadType === "supplementary") {
      allowedTypes = SUPPLEMENTARY_TYPES;
      allowedExtensions = SUPPLEMENTARY_EXTENSIONS;
      bucketName = "project-source-code";
      maxFileSize = 1024 * 1024 * 1024;
      maxFiles = 10;
    } else {
      allowedTypes = MEDIA_TYPES;
      allowedExtensions = MEDIA_EXTENSIONS;
      bucketName = "project-media";
      maxFileSize = 50 * 1024 * 1024;
      maxFiles = 5;
    }

    if (files.length > maxFiles) {
      return NextResponse.json(
        { error: `Maximum ${maxFiles} files allowed for ${uploadType} upload` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        const limitLabel = maxFileSize >= 1024 * 1024 * 1024 ? "1GB" : "50MB";
        return NextResponse.json(
          { error: `File "${file.name}" exceeds ${limitLabel} limit` },
          { status: 400 }
        );
      }
      if (!isAllowedFile(file.name, file.type, allowedTypes, allowedExtensions)) {
        return NextResponse.json(
          { error: `File type "${file.type}" is not allowed for ${uploadType} uploads` },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const isPrivate = uploadType === "source-code" || uploadType === "supplementary";
    const results: Array<{
      signedUrl: string;
      token: string;
      path: string;
      publicUrl: string | null;
      name: string;
      size: number;
      type: string;
      fileType: string;
    }> = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const timestamp = Date.now();
      const storagePath = `${sanitizedSlug}/${timestamp}-${safeName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUploadUrl(storagePath);

      if (error || !data) {
        return NextResponse.json(
          { error: `Failed to create upload URL for "${file.name}": ${error?.message}` },
          { status: 500 }
        );
      }

      const fileType = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
          ? "image"
          : "document";

      let publicUrl: string | null = null;
      if (!isPrivate) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
        publicUrl = urlData.publicUrl;
      }

      results.push({
        signedUrl: data.signedUrl,
        token: data.token,
        path: storagePath,
        publicUrl,
        name: safeName,
        size: file.size,
        type: file.type,
        fileType,
      });
    }

    return NextResponse.json({ uploads: results }, { status: 200 });
  } catch (err) {
    await logError({
      message: "Failed to create signed upload URLs",
      source: "api",
      path: "/api/internal/upload/signed-url",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json({ error: "Failed to create upload URLs" }, { status: 500 });
  }
}
