import { supabase } from "@/lib/supabase";
import type { TokenWallet, TokenTransaction } from "@/types/softwarePlan";

export async function getTokenBalance(): Promise<number> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("token_wallets")
    .select("balance_tokens")
    .eq("user_id", session.user.id)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.balance_tokens;
}

export async function getTokenWallet(): Promise<TokenWallet | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("token_wallets")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getTokenTransactions(): Promise<TokenTransaction[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("token_transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data;
}
