import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/services/projectService";
import ProjectDetail from "@/components/projects/ProjectDetail";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found | 14DaysAccel Dev" };
  }

  return {
    title: `${project.title} | 14DaysAccel Dev`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Link
              href="/projects"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
            >
              Back to Projects
            </Link>
          </div>
          <ProjectDetail project={project} />
        </div>
      </section>
    </main>
  );
}
