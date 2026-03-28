"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Project, ProjectMedia, SupplementaryFile } from "@/types/project";

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".mov",
];

export default function ProjectFormModal({
  project,
  onClose,
}: ProjectFormModalProps) {
  const isEditing = project !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [features, setFeatures] = useState(
    project?.features.join("\n") ?? ""
  );
  const [techStack, setTechStack] = useState(
    project?.tech_stack.join(", ") ?? ""
  );
  const [status, setStatus] = useState<"available" | "upcoming">(
    project?.status ?? "upcoming"
  );
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [upworkLink, setUpworkLink] = useState(project?.upwork_link ?? "");
  const [youtubeLink, setYoutubeLink] = useState(
    project?.youtube_link ?? ""
  );
  const [tiktokLink, setTiktokLink] = useState(project?.tiktok_link ?? "");
  const [mediaFiles, setMediaFiles] = useState<ProjectMedia[]>(
    project?.media_files ?? []
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    project?.profile_image ?? null
  );
  const [testingAvailable, setTestingAvailable] = useState(
    project?.testing_available ?? false
  );
  const [testingInstructions, setTestingInstructions] = useState(
    project?.testing_instructions ?? ""
  );
  const [testingUrl, setTestingUrl] = useState(
    project?.testing_url ?? ""
  );
  const [testingDocUrl, setTestingDocUrl] = useState<string | null>(
    project?.testing_doc_url ?? null
  );
  const [testingDocName, setTestingDocName] = useState<string | null>(
    project?.testing_doc_name ?? null
  );
  const testingDocInputRef = useRef<HTMLInputElement>(null);
  const sourceCodeInputRef = useRef<HTMLInputElement>(null);
  const supplementaryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSourceCode, setUploadingSourceCode] = useState(false);
  const [uploadingSupplementary, setUploadingSupplementary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [priceUsd, setPriceUsd] = useState<string>(
    project?.price_usd != null ? String(project.price_usd) : ""
  );
  const [productPath, setProductPath] = useState(
    project?.product_path ?? ""
  );
  const [productVariable, setProductVariable] = useState(
    project?.product_variable ?? ""
  );
  const [sourceCodeUrl, setSourceCodeUrl] = useState<string | null>(
    project?.source_code_url ?? null
  );
  const [sourceCodeName, setSourceCodeName] = useState<string | null>(
    project?.source_code_name ?? null
  );
  const [sourceCodeSize, setSourceCodeSize] = useState<number | null>(
    project?.source_code_size ?? null
  );
  const [supplementaryFiles, setSupplementaryFiles] = useState<SupplementaryFile[]>(
    project?.supplementary_files ?? []
  );

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleFileUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const currentSlug = slug || generateSlug(title);
    if (!currentSlug) {
      setError("Enter a title or slug before uploading files.");
      return;
    }

    const remaining = MAX_FILES - mediaFiles.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remaining);

    for (const file of filesToUpload) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds 50MB limit.`);
        return;
      }
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`File type "${ext}" is not allowed.`);
        return;
      }
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("projectSlug", currentSlug);
      for (const file of filesToUpload) {
        formData.append("files", file);
      }

      const res = await fetch("/api/internal/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed.");
        return;
      }

      const data = await res.json();
      const newMedia: ProjectMedia[] = data.files;
      setMediaFiles((prev) => [...prev, ...newMedia]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemoveMedia(index: number) {
    setMediaFiles((prev) => {
      const removed = prev[index];
      const updated = prev.filter((_, i) => i !== index);
      if (removed && profileImage === removed.url) {
        setProfileImage(null);
      }
      return updated;
    });
  }

  function handleSetProfileImage(url: string) {
    setProfileImage(profileImage === url ? null : url);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...(isEditing ? { id: project.id } : {}),
      title,
      slug,
      description,
      features: features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      tech_stack: techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      featured,
      upwork_link: upworkLink || null,
      youtube_link: youtubeLink || null,
      tiktok_link: tiktokLink || null,
      media_files: mediaFiles,
      profile_image: profileImage,
      testing_available: testingAvailable,
      testing_instructions: testingInstructions || null,
      testing_url: testingUrl || null,
      testing_doc_url: testingDocUrl,
      testing_doc_name: testingDocName,
      price_usd: priceUsd ? Number(priceUsd) : null,
      product_path: productPath || null,
      product_variable: productVariable || null,
      source_code_url: sourceCodeUrl,
      source_code_name: sourceCodeName,
      source_code_size: sourceCodeSize,
      supplementary_files: supplementaryFiles,
    };

    try {
      const res = await fetch("/api/internal/projects", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save project");
        return;
      }

      onClose();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300";
  const labelClass = "mb-1.5 block text-sm font-medium text-zinc-700";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 px-4 pt-16 pb-16">
      <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            {isEditing ? "Edit Project" : "Add Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEditing) setSlug(generateSlug(e.target.value));
              }}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="features" className={labelClass}>
              Features (one per line)
            </label>
            <textarea
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="techStack" className={labelClass}>
              Tech Stack (comma separated)
            </label>
            <input
              id="techStack"
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "available" | "upcoming")
                }
                className={inputClass}
              >
                <option value="available">Available</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                Featured on homepage
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="upworkLink" className={labelClass}>
              Upwork Link
            </label>
            <input
              id="upworkLink"
              type="url"
              value={upworkLink}
              onChange={(e) => setUpworkLink(e.target.value)}
              className={inputClass}
              placeholder="https://www.upwork.com/..."
            />
          </div>

          <div>
            <label htmlFor="youtubeLink" className={labelClass}>
              YouTube Link
            </label>
            <input
              id="youtubeLink"
              type="url"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className={inputClass}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div>
            <label htmlFor="tiktokLink" className={labelClass}>
              TikTok Link
            </label>
            <input
              id="tiktokLink"
              type="url"
              value={tiktokLink}
              onChange={(e) => setTiktokLink(e.target.value)}
              className={inputClass}
              placeholder="https://tiktok.com/..."
            />
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={testingAvailable}
                onChange={(e) => setTestingAvailable(e.target.checked)}
                className="rounded border-zinc-300"
              />
              Available for Testing
            </label>

            {testingAvailable && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="testingInstructions" className={labelClass}>
                    Testing Instructions
                  </label>
                  <textarea
                    id="testingInstructions"
                    value={testingInstructions}
                    onChange={(e) => setTestingInstructions(e.target.value)}
                    rows={4}
                    className={inputClass}
                    placeholder="Describe how to test this project..."
                  />
                </div>

                <div>
                  <label htmlFor="testingUrl" className={labelClass}>
                    Testing URL
                  </label>
                  <input
                    id="testingUrl"
                    type="url"
                    value={testingUrl}
                    onChange={(e) => setTestingUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://demo.example.com"
                  />
                </div>

                <div>
                  <label className={labelClass}>Instruction Document</label>
                  <p className="mb-2 text-xs text-zinc-400">
                    Upload a PDF or Word document with testing instructions.
                  </p>

                  {testingDocUrl && testingDocName && (
                    <div className="mb-3 flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-200 text-xs text-zinc-500">
                        DOC
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm text-zinc-700">
                        {testingDocName}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTestingDocUrl(null);
                          setTestingDocName(null);
                        }}
                        className="shrink-0 text-xs text-red-500 transition-colors hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {!testingDocUrl && (
                    <div>
                      <input
                        ref={testingDocInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const currentSlug = slug || generateSlug(title);
                          if (!currentSlug) {
                            setError("Enter a title or slug before uploading files.");
                            return;
                          }
                          setUploadingDoc(true);
                          setError("");
                          try {
                            const formData = new FormData();
                            formData.set("projectSlug", currentSlug);
                            formData.append("files", file);
                            const res = await fetch("/api/internal/upload", {
                              method: "POST",
                              body: formData,
                            });
                            if (!res.ok) {
                              const data = await res.json();
                              setError(data.error || "Upload failed.");
                              return;
                            }
                            const data = await res.json();
                            if (data.files?.[0]) {
                              setTestingDocUrl(data.files[0].url);
                              setTestingDocName(data.files[0].name);
                            }
                          } catch {
                            setError("Document upload failed. Please try again.");
                          } finally {
                            setUploadingDoc(false);
                            if (testingDocInputRef.current) {
                              testingDocInputRef.current.value = "";
                            }
                          }
                        }}
                        className="hidden"
                        id="testingDocUpload"
                      />
                      <button
                        type="button"
                        onClick={() => testingDocInputRef.current?.click()}
                        disabled={uploadingDoc}
                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingDoc ? "Uploading..." : "Choose Document"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {status === "available" && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-800">
                Pricing
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="priceUsd" className={labelClass}>
                    Price (USD)
                  </label>
                  <input
                    id="priceUsd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    className={inputClass}
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label htmlFor="productPath" className={labelClass}>
                    Product Path (FastSpring)
                  </label>
                  <input
                    id="productPath"
                    type="text"
                    value={productPath}
                    onChange={(e) => setProductPath(e.target.value)}
                    className={inputClass}
                    placeholder="inventory-system"
                  />
                </div>
                <div>
                  <label htmlFor="productVariable" className={labelClass}>
                    Product Variable (Lemon Squeezy Variant ID)
                  </label>
                  <input
                    id="productVariable"
                    type="text"
                    value={productVariable}
                    onChange={(e) => setProductVariable(e.target.value)}
                    className={inputClass}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">
              Source Code
            </h3>
            <p className="mb-2 text-xs text-zinc-400">
              Upload a zipped source code file (.zip, .tar.gz, .rar). Up to 1GB.
            </p>

            {sourceCodeUrl && sourceCodeName && (
              <div className="mb-3 flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-200 text-xs text-zinc-500">
                  ZIP
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-700">
                    {sourceCodeName}
                  </p>
                  {sourceCodeSize != null && (
                    <p className="text-xs text-zinc-400">
                      {(sourceCodeSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSourceCodeUrl(null);
                    setSourceCodeName(null);
                    setSourceCodeSize(null);
                  }}
                  className="shrink-0 text-xs text-red-500 transition-colors hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}

            {!sourceCodeUrl && (
              <div>
                <input
                  ref={sourceCodeInputRef}
                  type="file"
                  accept=".zip,.tar.gz,.rar,application/zip,application/x-zip-compressed,application/gzip,application/x-rar-compressed"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const currentSlug = slug || generateSlug(title);
                    if (!currentSlug) {
                      setError("Enter a title or slug before uploading files.");
                      return;
                    }
                    setUploadingSourceCode(true);
                    setError("");
                    try {
                      const formData = new FormData();
                      formData.set("projectSlug", currentSlug);
                      formData.set("uploadType", "source-code");
                      formData.append("files", file);
                      const res = await fetch("/api/internal/upload", {
                        method: "POST",
                        body: formData,
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        setError(data.error || "Source code upload failed.");
                        return;
                      }
                      const data = await res.json();
                      if (data.files?.[0]) {
                        setSourceCodeUrl(data.files[0].url);
                        setSourceCodeName(data.files[0].name);
                        setSourceCodeSize(data.files[0].size);
                      }
                    } catch {
                      setError("Source code upload failed. Please try again.");
                    } finally {
                      setUploadingSourceCode(false);
                      if (sourceCodeInputRef.current) {
                        sourceCodeInputRef.current.value = "";
                      }
                    }
                  }}
                  className="hidden"
                  id="sourceCodeUpload"
                />
                <button
                  type="button"
                  onClick={() => sourceCodeInputRef.current?.click()}
                  disabled={uploadingSourceCode}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingSourceCode ? "Uploading..." : "Upload Source Code"}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">
              Supplementary Files ({supplementaryFiles.length}/10)
            </h3>
            <p className="mb-2 text-xs text-zinc-400">
              Upload deployment instructions, documentation, etc. Up to 10 files. Combined total with source code must not exceed 1GB.
            </p>

            {supplementaryFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {supplementaryFiles.map((file, index) => (
                  <div
                    key={file.url}
                    className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-200 text-xs text-zinc-500">
                      FILE
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-700">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSupplementaryFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="shrink-0 text-xs text-red-500 transition-colors hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {supplementaryFiles.length < 10 && (
              <div>
                <input
                  ref={supplementaryInputRef}
                  type="file"
                  accept=".zip,.tar.gz,.rar,.pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
                  multiple
                  onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const currentSlug = slug || generateSlug(title);
                    if (!currentSlug) {
                      setError("Enter a title or slug before uploading files.");
                      return;
                    }
                    const remaining = 10 - supplementaryFiles.length;
                    const filesToUpload = Array.from(e.target.files).slice(
                      0,
                      remaining
                    );
                    setUploadingSupplementary(true);
                    setError("");
                    try {
                      const formData = new FormData();
                      formData.set("projectSlug", currentSlug);
                      formData.set("uploadType", "supplementary");
                      for (const file of filesToUpload) {
                        formData.append("files", file);
                      }
                      const res = await fetch("/api/internal/upload", {
                        method: "POST",
                        body: formData,
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        setError(
                          data.error || "Supplementary file upload failed."
                        );
                        return;
                      }
                      const data = await res.json();
                      if (data.files) {
                        setSupplementaryFiles((prev) => [
                          ...prev,
                          ...data.files.map(
                            (f: { url: string; name: string; size: number; type: string }) => ({
                              url: f.url,
                              name: f.name,
                              size: f.size,
                              type: f.type,
                            })
                          ),
                        ]);
                      }
                    } catch {
                      setError(
                        "Supplementary file upload failed. Please try again."
                      );
                    } finally {
                      setUploadingSupplementary(false);
                      if (supplementaryInputRef.current) {
                        supplementaryInputRef.current.value = "";
                      }
                    }
                  }}
                  className="hidden"
                  id="supplementaryUpload"
                />
                <button
                  type="button"
                  onClick={() => supplementaryInputRef.current?.click()}
                  disabled={uploadingSupplementary}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingSupplementary
                    ? "Uploading..."
                    : "Upload Supplementary Files"}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Media Files ({mediaFiles.length}/{MAX_FILES})
            </label>
            <p className="mb-2 text-xs text-zinc-400">
              Upload up to {MAX_FILES} images or videos. 50MB max per file.
            </p>

            {mediaFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div
                    key={file.url}
                    className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
                  >
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-200 text-xs text-zinc-500">
                        VID
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-700">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-400">{file.type}</p>
                    </div>
                    {file.type === "image" && (
                      <button
                        type="button"
                        onClick={() => handleSetProfileImage(file.url)}
                        className={`shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors ${
                          profileImage === file.url
                            ? "bg-zinc-900 text-white"
                            : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {profileImage === file.url ? "Profile" : "Set Profile"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="shrink-0 text-xs text-red-500 transition-colors hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {mediaFiles.length < MAX_FILES && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="mediaUpload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Choose Files"}
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Project"
                  : "Create Project"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
