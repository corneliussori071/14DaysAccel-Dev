import { supabase } from "@/lib/supabaseClient";
import type { ProjectReaction, ProjectComment } from "@/types/project";

export async function getUserReaction(
  projectId: string
): Promise<ProjectReaction | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("project_reactions")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) throw error;
  return data as ProjectReaction | null;
}

export async function toggleReaction(
  projectId: string,
  reactionType: "like" | "dislike"
): Promise<{ action: "added" | "removed" | "switched" }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Authentication required");

  const userId = session.user.id;

  const { data: existing } = await supabase
    .from("project_reactions")
    .select("id, reaction_type")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    if (existing.reaction_type === reactionType) {
      const { error } = await supabase
        .from("project_reactions")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
      return { action: "removed" };
    } else {
      const { error } = await supabase
        .from("project_reactions")
        .update({ reaction_type: reactionType })
        .eq("id", existing.id);
      if (error) throw error;
      return { action: "switched" };
    }
  }

  const { error } = await supabase.from("project_reactions").insert({
    project_id: projectId,
    user_id: userId,
    reaction_type: reactionType,
  });
  if (error) throw error;
  return { action: "added" };
}

export async function getComments(
  projectId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ comments: ProjectComment[]; hasMore: boolean }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize;

  const { data, error } = await supabase
    .from("project_comments")
    .select("id, project_id, user_id, content, created_at, updated_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const comments: ProjectComment[] = (data || []).slice(0, pageSize).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    comments,
    hasMore: (data || []).length > pageSize,
  };
}

export async function addComment(
  projectId: string,
  content: string
): Promise<ProjectComment> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Authentication required");

  const sanitizedContent = content.trim().slice(0, 2000);
  if (!sanitizedContent) throw new Error("Comment cannot be empty");

  const { data, error } = await supabase
    .from("project_comments")
    .insert({
      project_id: projectId,
      user_id: session.user.id,
      content: sanitizedContent,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectComment;
}

export async function deleteComment(commentId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Authentication required");

  const { error } = await supabase
    .from("project_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", session.user.id);

  if (error) throw error;
}
