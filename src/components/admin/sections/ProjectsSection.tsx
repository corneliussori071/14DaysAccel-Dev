"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import ProjectFormModal from "@/components/admin/ProjectFormModal";

export default function ProjectsSection() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/projects");
      if (res.status === 401) {
        router.push("/sys/gate");
        return;
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleToggleFeatured(project: Project) {
    await fetch("/api/internal/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, featured: !project.featured }),
    });
    fetchProjects();
  }

  async function handleToggleStatus(project: Project) {
    const newStatus =
      project.status === "available" ? "upcoming" : "available";
    await fetch("/api/internal/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, status: newStatus }),
    });
    fetchProjects();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmed) return;

    await fetch(`/api/internal/projects?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    fetchProjects();
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setShowForm(true);
  }

  function handleCreate() {
    setEditingProject(null);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProject(null);
    fetchProjects();
  }

  const statusStyles: Record<string, string> = {
    available: "bg-zinc-100 text-zinc-700",
    upcoming: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="px-6 py-8 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Project Management
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage the project catalogue, featured items, and project status.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Add Project
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              No projects yet. Add your first project.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600">
                    Project
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">
                        {project.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        /{project.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(project)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusStyles[project.status] || ""
                        }`}
                      >
                        {project.status === "available"
                          ? "Available"
                          : "Upcoming"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.featured
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {project.featured ? "Featured" : "Not Featured"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-sm text-red-500 transition-colors hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <ProjectFormModal
            project={editingProject}
            onClose={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}
