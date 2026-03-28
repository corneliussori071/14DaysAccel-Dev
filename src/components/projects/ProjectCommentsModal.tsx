"use client";

import { useEffect } from "react";
import ProjectComments from "./ProjectComments";

interface ProjectCommentsModalProps {
  projectId: string;
  projectTitle: string;
  commentsCount: number;
  onClose: () => void;
}

export default function ProjectCommentsModal({
  projectId,
  projectTitle,
  commentsCount,
  onClose,
}: ProjectCommentsModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 rounded-t-xl">
          <h2 className="text-sm font-semibold text-zinc-900 truncate">
            {projectTitle}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close comments"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6">
          <ProjectComments
            projectId={projectId}
            initialCount={commentsCount}
          />
        </div>
      </div>
    </div>
  );
}
