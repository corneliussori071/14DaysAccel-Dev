import Link from "next/link";
import { getFeaturedProjects } from "@/services/projectService";

const statusStyles: Record<string, string> = {
  available: "bg-zinc-100 text-zinc-700",
  upcoming: "bg-blue-50 text-blue-700",
};

const statusStylesDark: Record<string, string> = {
  available: "bg-white/20 text-white",
  upcoming: "bg-white/20 text-white",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  upcoming: "Upcoming",
};

export default async function FeaturedProjectsSection() {
  const projects = await getFeaturedProjects();

  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Featured Software Systems
            </h2>
            <p className="mt-3 text-base text-white">
              A selection of software systems built using this development
              model.
            </p>
          </div>
          <Link
            href="/projects"
            className="shrink-0 rounded-md border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/20"
          >
            View Full Project Catalogue
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group animate-fade-in-up rounded-lg border border-zinc-500 bg-zinc-700 transition-all hover:-translate-y-1 hover:border-zinc-400 hover:shadow-lg hover:shadow-black/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {project.profile_image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-zinc-600">
                  <img
                    src={project.profile_image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">
                    {project.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStylesDark[project.status] || ""}`}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-white/30 px-2 py-0.5 text-xs text-white/80"
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
