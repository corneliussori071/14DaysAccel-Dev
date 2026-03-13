import { supabase } from "@/lib/supabase";
import type { UserProfile, SavedPlan } from "@/types/profile";

export async function getProfile(): Promise<UserProfile | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function updateProfile(
  fields: Pick<UserProfile, "full_name" | "phone_number">
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(fields)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function changePassword(newPassword: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSavedPlans(): Promise<SavedPlan[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function deleteSavedPlan(planId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("saved_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSavedPlanPrompts(
  planId: string,
  generatedPrompts: Record<string, unknown>
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("saved_plans")
    .update({ generated_prompts: generatedPrompts })
    .eq("id", planId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error(error.message);
  }
}
