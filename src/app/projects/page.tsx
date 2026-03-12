import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/services/projectService";
import ProjectGrid from "@/components/projects/ProjectGrid";

export const metadata: Metadata = {
  title: "Software Systems Catalogue | 14DaysAccel Dev",
  description:
    "Browse available and upcoming software systems built with AI-accelerated development and professional engineering practices.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-zinc-200 px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4">
            <Link
              href="/"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
            >
              Home
            </Link>
            <span className="mx-2 text-sm text-zinc-300">/</span>
            <span className="text-sm text-zinc-600">Projects</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
            Software Systems Catalogue
          </h1>
          <p className="mt-4 text-base text-zinc-500">
            Browse available and upcoming software systems. Each project is
            built using AI-accelerated development with professional engineering
            oversight.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <ProjectGrid projects={projects} />
        </div>
      </section>
    </main>
  );
}
