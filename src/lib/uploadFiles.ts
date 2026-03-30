/**
 * Upload files to Supabase Storage via signed URLs (bypasses Vercel body size limit).
 *
 * 1. Requests signed upload URLs from the API.
 * 2. Uploads each file directly to Supabase Storage using PUT.
 * 3. Returns file metadata (url, name, size, type).
 */
export async function uploadFilesViaSignedUrl(
  projectSlug: string,
  uploadType: string,
  files: File[]
): Promise<Array<{ url: string; name: string; size: number; type: string }>> {
  // Step 1: Get signed upload URLs
  const res = await fetch("/api/internal/upload/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectSlug,
      uploadType,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to get upload URLs");
  }

  const { uploads } = (await res.json()) as {
    uploads: Array<{
      signedUrl: string;
      token: string;
      path: string;
      publicUrl: string | null;
      name: string;
      size: number;
      type: string;
      fileType: string;
    }>;
  };

  // Step 2: Upload each file directly to Supabase Storage
  const results: Array<{ url: string; name: string; size: number; type: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const upload = uploads[i];

    const uploadRes = await fetch(upload.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed for "${file.name}"`);
    }

    results.push({
      url: upload.publicUrl || upload.path,
      name: upload.name,
      size: file.size,
      type: upload.fileType,
    });
  }

  return results;
}
