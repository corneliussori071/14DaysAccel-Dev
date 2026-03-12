"use client";

import { useState, type FormEvent } from "react";
import type { Project } from "@/types/project";

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectFormModal({
  project,
  onClose,
}: ProjectFormModalProps) {
  const isEditing = project !== null;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
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
