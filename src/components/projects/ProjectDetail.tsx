import type { Project } from "@/types/project";

const statusStyles: Record<Project["status"], string> = {
  available: "bg-zinc-100 text-zinc-700",
  upcoming: "bg-blue-50 text-blue-700",
};

const statusLabels: Record<Project["status"], string> = {
  available: "Available",
  upcoming: "Upcoming",
};

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="mx-auto max-w-3xl">
      {project.profile_image && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100">
          <img
            src={project.profile_image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        {project.title}
      </h1>

      <p className="mt-6 text-base leading-relaxed text-zinc-500">
        {project.description}
      </p>

      {project.media_files && project.media_files.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">Media</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.media_files.map((file) => (
              <div
                key={file.url}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
              >
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <video
                    src={file.url}
                    controls
                    className="aspect-video w-full"
                    preload="metadata"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">Features</h2>
        <ul className="mt-4 space-y-2">
          {project.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-zinc-600"
            >
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">
          Technology Stack
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {(project.upwork_link || project.youtube_link || project.tiktok_link) && (
        <div className="mt-10 flex flex-wrap gap-3">
          {project.upwork_link && (
            <a
              href={project.upwork_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Request This System on Upwork
            </a>
          )}
          {project.youtube_link && (
            <a
              href={project.youtube_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Watch on YouTube
            </a>
          )}
          {project.tiktok_link && (
            <a
              href={project.tiktok_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              View on TikTok
            </a>
          )}
        </div>
      )}
    </div>
  );
}
