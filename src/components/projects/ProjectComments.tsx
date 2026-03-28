"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ProjectComment } from "@/types/project";

interface ProjectCommentsProps {
  projectId: string;
  initialCount: number;
}

export default function ProjectComments({
  projectId,
  initialCount,
}: ProjectCommentsProps) {
  const [comments, setComments] = useState<
    (ProjectComment & { display_name?: string; user_display_name?: string })[]
  >([]);
  const [total, setTotal] = useState(initialCount);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  const fetchComments = useCallback(
    async (pageNum: number) => {
      setLoadingMore(true);
      try {
        const res = await fetch(
          `/api/internal/projects/comments?projectId=${encodeURIComponent(projectId)}&page=${pageNum}`
        );
        if (res.ok) {
          const data = await res.json();
          if (pageNum === 0) {
            setComments(data.comments);
          } else {
            setComments((prev) => [...prev, ...data.comments]);
          }
          setHasMore(data.hasMore);
          setPage(pageNum);
        }
      } catch {
        // Fail silently
      } finally {
        setLoadingMore(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    fetchComments(0);
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    if (!userId) {
      window.location.href = "/software-designer?auth=login";
      return;
    }

    setSubmitting(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch("/api/internal/projects/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId, content: content.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment, ...prev]);
        setTotal((prev) => prev + 1);
        setContent("");
      }
    } catch {
      // Fail silently
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch(
        `/api/internal/projects/comments?commentId=${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Fail silently
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <section className="mt-12 border-t border-zinc-200 pt-8">
      <h2 className="text-lg font-semibold text-zinc-900 mb-6">
        Comments ({total})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            userId ? "Write a comment..." : "Sign in to leave a comment"
          }
          maxLength={2000}
          rows={3}
          disabled={!userId}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none disabled:opacity-50 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-400">
            {content.length}/2000
          </span>
          <button
            type="submit"
            disabled={!content.trim() || submitting || !userId}
            className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border border-zinc-100 bg-zinc-50/50 px-5 py-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-800">
                  {comment.display_name || comment.user_display_name || "Anonymous"}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              {userId && comment.user_id === userId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && comments.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchComments(page + 1)}
            disabled={loadingMore}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}

      {comments.length === 0 && !loadingMore && (
        <p className="text-sm text-zinc-400 text-center py-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}
    </section>
  );
}
