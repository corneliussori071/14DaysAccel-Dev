"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Project, ProjectMedia } from "@/types/project";

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
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
