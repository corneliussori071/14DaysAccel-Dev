type ProjectStatus = "Available" | "Upcoming";

interface Project {
  name: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
}

const projects: Project[] = [
  {
    name: "Inventory Management System",
    description:
      "A multi-location inventory tracking system with real-time updates and reporting.",
    stack: ["React", "Node.js", "PostgreSQL"],
    status: "Available",
  },
  {
    name: "Restaurant POS Platform",
    description:
      "A full-service point-of-sale system supporting dine-in, takeaway, and delivery operations.",
    stack: ["React", "Supabase", "TypeScript"],
    status: "Available",
  },
  {
    name: "Client Booking Portal",
    description:
      "An online booking and scheduling portal for service-based businesses.",
    stack: ["Next.js", "Supabase", "Tailwind CSS"],
    status: "Upcoming",
  },
];

const statusStyles: Record<ProjectStatus, string> = {
  Available: "bg-zinc-100 text-zinc-700",
  Upcoming: "bg-blue-50 text-blue-700",
};

export default function FeaturedProjectsSection() {
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
          <button className="shrink-0 rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            View Full Project Catalogue
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.name}
              className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-zinc-900">
                  {project.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
