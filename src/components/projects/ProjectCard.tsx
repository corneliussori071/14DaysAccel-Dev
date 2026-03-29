"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/types/project";
import ProjectReactions from "./ProjectReactions";
import ProjectBuyButton from "./ProjectBuyButton";
import RegisterInterestButton from "./RegisterInterestButton";
import ProjectCommentsModal from "./ProjectCommentsModal";

const statusStyles: Record<Project["status"], string> = {
  available: "bg-zinc-100 text-zinc-700",
  upcoming: "bg-blue-50 text-blue-700",
};

const statusLabels: Record<Project["status"], string> = {
  available: "Available",
  upcoming: "Upcoming",
};

const DESCRIPTION_MAX_LENGTH = 600;

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showComments, setShowComments] = useState(false);
  const description = project.description || "";
  const isTruncated = description.length > DESCRIPTION_MAX_LENGTH;
  const displayDescription = isTruncated
    ? description.slice(0, DESCRIPTION_MAX_LENGTH)
    : description;

  return (
    <>
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
          {displayDescription}
          {isTruncated && (
            <span className="ml-1 inline-block text-zinc-900 font-medium hover:underline">
              More...
            </span>
          )}
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
        <div className="mt-4">
          <ProjectReactions
            projectId={project.id}
            initialLikes={project.likes_count ?? 0}
            initialDislikes={project.dislikes_count ?? 0}
            initialComments={project.comments_count ?? 0}
            variant="light"
            onCommentClick={() => setShowComments(true)}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
            View Details
          </span>
          {project.status === "available" && project.price_usd && (
            <ProjectBuyButton
              projectId={project.id}
              priceUsd={project.price_usd}
              variant="light"
            />
          )}
          {project.status === "upcoming" && (
            <RegisterInterestButton
              projectId={project.id}
              variant="light"
            />
          )}
        </div>
      </div>
    </Link>

      {showComments && (
        <ProjectCommentsModal
          projectId={project.id}
          projectTitle={project.title}
          commentsCount={project.comments_count ?? 0}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}
