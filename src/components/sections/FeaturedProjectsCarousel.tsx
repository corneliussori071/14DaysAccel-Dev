"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Project } from "@/types/project";
import ProjectReactions from "@/components/projects/ProjectReactions";
import ProjectBuyButton from "@/components/projects/ProjectBuyButton";
import RegisterInterestButton from "@/components/projects/RegisterInterestButton";
import ProjectCommentsModal from "@/components/projects/ProjectCommentsModal";

const statusStylesDark: Record<string, string> = {
  available: "bg-blue-100 text-blue-800",
  upcoming: "bg-blue-100 text-blue-800",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  upcoming: "Upcoming",
};

const DESCRIPTION_MAX_LENGTH = 600;

interface Props {
  projects: Project[];
}

function ProjectCard({ project }: { project: Project }) {
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
      className="group block rounded-lg border border-blue-200 bg-blue-50 transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50"
    >
      {project.profile_image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-blue-100">
          <img
            src={project.profile_image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-zinc-900">
            {project.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStylesDark[project.status] || ""}`}
          >
            {statusLabels[project.status] || project.status}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-700">
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
              className="rounded border border-blue-200 px-2 py-0.5 text-xs text-zinc-600"
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
          <span className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900">
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

export default function FeaturedProjectsCarousel({ projects }: Props) {
  const pageSize = 3;
  const totalPages = Math.ceil(projects.length / pageSize);
  const [page, setPage] = useState(0);

  const nextPage = useCallback(() => {
    setPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(nextPage, 5000);
    return () => clearInterval(interval);
  }, [totalPages, nextPage]);

  const pages = Array.from({ length: totalPages }, (_, i) =>
    projects.slice(i * pageSize, i * pageSize + pageSize)
  );

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((group, pageIndex) => (
            <div
              key={pageIndex}
              className="grid w-full shrink-0 grid-cols-1 gap-6 md:grid-cols-3"
            >
              {group.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <>
          <button
            onClick={prevPage}
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100"
            aria-label="Previous projects"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={nextPage}
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100"
            aria-label="Next projects"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === page ? "w-6 bg-zinc-700" : "w-1.5 bg-zinc-300"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
