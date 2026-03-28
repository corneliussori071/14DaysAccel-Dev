import { supabase } from "@/lib/supabaseClient";
import type { ProjectPurchase } from "@/types/project";

export async function initiateProjectCheckout(
  projectId: string,
  redirectUrl?: string
): Promise<{ checkoutUrl?: string; sessionId?: string; provider: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Authentication required");

  const response = await fetch("/api/internal/projects/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ projectId, redirectUrl }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Checkout failed");

  return data;
}

export async function getUserPurchases(): Promise<
  (ProjectPurchase & { project_title?: string; project_slug?: string; project_profile_image?: string | null })[]
> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Authentication required");

  const { data, error } = await supabase
    .from("project_purchases")
    .select("*, project:projects(title, slug, profile_image)")
    .eq("user_id", session.user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => {
    const project =
      row.project && typeof row.project === "object"
        ? (row.project as { title: string; slug: string; profile_image: string | null })
        : null;
    return {
      ...row,
      project_title: project?.title,
      project_slug: project?.slug,
      project_profile_image: project?.profile_image,
    };
  });
}

export async function getDownloadLinks(
  purchaseId: string
): Promise<{ sourceCode: string | null; supplementaryFiles: { name: string; url: string }[] }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Authentication required");

  const response = await fetch(
    `/api/internal/projects/download?purchaseId=${encodeURIComponent(purchaseId)}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to get download links");

  return data;
}

export async function registerInterest(
  projectId: string,
  email: string,
  name?: string
): Promise<void> {
  const response = await fetch("/api/internal/projects/interest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, email, name }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to register interest");
}

export async function checkUserPurchase(
  projectId: string
): Promise<ProjectPurchase | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("project_purchases")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", session.user.id)
    .eq("status", "completed")
    .maybeSingle();

  if (error) return null;
  return data as ProjectPurchase | null;
}
