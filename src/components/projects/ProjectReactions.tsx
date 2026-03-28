"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ProjectReactionsProps {
  projectId: string;
  initialLikes: number;
  initialDislikes: number;
  initialComments: number;
  variant?: "light" | "dark";
  onCommentClick?: () => void;
}

export default function ProjectReactions({
  projectId,
  initialLikes,
  initialDislikes,
  initialComments,
  variant = "light",
  onCommentClick,
}: ProjectReactionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const fetchUserReaction = useCallback(async () => {
    if (!userId) return;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch(
        `/api/internal/projects/reactions?projectId=${encodeURIComponent(projectId)}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setUserReaction(data.reaction?.reaction_type ?? null);
      }
    } catch {
      // Silently fail for reaction fetch
    }
  }, [userId, projectId]);

  useEffect(() => {
    fetchUserReaction();
  }, [fetchUserReaction]);

  async function handleReaction(type: "like" | "dislike") {
    if (loading) return;

    if (!userId) {
      window.location.href = "/software-designer?auth=login";
      return;
    }

    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch("/api/internal/projects/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId, reactionType: type }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes_count);
        setDislikes(data.dislikes_count);

        if (data.action === "removed") {
          setUserReaction(null);
        } else {
          setUserReaction(type);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === "dark";
  const baseBtn = `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50`;
  const activeLight = "bg-zinc-900 text-white";
  const inactiveLight =
    "border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50";
  const activeDark = "bg-white text-zinc-900";
  const inactiveDark =
    "border border-white/30 text-white/70 hover:bg-white/10";

  function btnClass(active: boolean) {
    if (isDark) return `${baseBtn} ${active ? activeDark : inactiveDark}`;
    return `${baseBtn} ${active ? activeLight : inactiveLight}`;
  }

  const countClass = isDark ? "text-white/60" : "text-zinc-400";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleReaction("like");
        }}
        disabled={loading}
        className={btnClass(userReaction === "like")}
        aria-label="Like"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={userReaction === "like" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 10v12M15 5.88L14.12 10H20a2 2 0 0 1 2 2.26l-1.5 9A2 2 0 0 1 18.52 23H4a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        <span className={countClass}>{likes}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleReaction("dislike");
        }}
        disabled={loading}
        className={btnClass(userReaction === "dislike")}
        aria-label="Dislike"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={userReaction === "dislike" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 14V2M9 18.12L9.88 14H4a2 2 0 0 1-2-2.26l1.5-9A2 2 0 0 1 5.48 1H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
        </svg>
        <span className={countClass}>{dislikes}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCommentClick?.();
        }}
        className={btnClass(false)}
        aria-label="Comments"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className={countClass}>{initialComments}</span>
      </button>
    </div>
  );
}
