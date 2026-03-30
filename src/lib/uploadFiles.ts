export interface UploadProgress {
  fileName: string;
  percent: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Upload a single file to a Supabase signed URL using XMLHttpRequest
 * so we can track upload progress.
 */
function uploadWithProgress(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")));

    xhr.send(file);
  });
}

/**
 * Upload files to Supabase Storage via signed URLs (bypasses Vercel body size limit).
 *
 * 1. Requests signed upload URLs from the API.
 * 2. Uploads each file directly to Supabase Storage with progress tracking.
 * 3. Returns file metadata (url, name, size, type).
 */
export async function uploadFilesViaSignedUrl(
  projectSlug: string,
  uploadType: string,
  files: File[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadResult[]> {
  const progressState: UploadProgress[] = files.map((f) => ({
    fileName: f.name,
    percent: 0,
    status: "pending",
  }));

  function emitProgress() {
    onProgress?.([...progressState]);
  }

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

  // Step 2: Upload each file directly to Supabase Storage with progress
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const upload = uploads[i];

    progressState[i].status = "uploading";
    emitProgress();

    try {
      await uploadWithProgress(
        upload.signedUrl,
        file,
        file.type || "application/octet-stream",
        (percent) => {
          progressState[i].percent = percent;
          emitProgress();
        }
      );

      progressState[i].status = "done";
      progressState[i].percent = 100;
      emitProgress();

      results.push({
        url: upload.publicUrl || upload.path,
        name: upload.name,
        size: file.size,
        type: upload.fileType,
      });
    } catch (err) {
      progressState[i].status = "error";
      progressState[i].error = err instanceof Error ? err.message : "Upload failed";
      emitProgress();
      throw new Error(`Upload failed for "${file.name}"`);
    }
  }

  return results;
}
