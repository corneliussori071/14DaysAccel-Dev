import type { Project } from "@/types/project";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
        <p className="text-sm text-zinc-500">
          No projects available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
