import Link from "next/link";
import type { Project } from "@/types/project";

const statusStyles: Record<Project["status"], string> = {
  available: "bg-zinc-100 text-zinc-700",
  upcoming: "bg-blue-50 text-blue-700",
};

const statusLabels: Record<Project["status"], string> = {
  available: "Available",
  upcoming: "Upcoming",
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-sm"
    >
      {project.profile_image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-zinc-100">
          <img
            src={project.profile_image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-700">
            {project.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
          >
            {statusLabels[project.status]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
