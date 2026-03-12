import Link from "next/link";
import { getFeaturedProjects } from "@/services/projectService";

const statusStyles: Record<string, string> = {
  available: "bg-zinc-100 text-zinc-700",
  upcoming: "bg-blue-50 text-blue-700",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  upcoming: "Upcoming",
};

export default async function FeaturedProjectsSection() {
  const projects = await getFeaturedProjects();

  return (
    <section className="border-b border-zinc-200 bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Featured Software Systems
            </h2>
            <p className="mt-3 text-base text-zinc-500">
              A selection of software systems built using this development
              model.
            </p>
          </div>
          <Link
            href="/projects"
            className="shrink-0 rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            View Full Project Catalogue
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
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
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status] || ""}`}
                  >
                    {statusLabels[project.status] || project.status}
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
          ))}
        </div>
      </div>
    </section>
  );
}
