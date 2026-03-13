import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

export function createServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, serviceKey);
}

export function createUserClient(authHeader: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}

export async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }
  const userClient = createUserClient(authHeader);
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) {
    throw new Error("Invalid or expired session");
  }
  return user;
}

export async function checkTokenBalance(
  serviceClient: ReturnType<typeof createServiceClient>,
  userId: string,
  minimumTokens = 1
): Promise<number> {
  const { data, error } = await serviceClient
    .from("token_wallets")
    .select("balance_tokens")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Token wallet not found");
  }
  if (data.balance_tokens < minimumTokens) {
    throw new Error("Insufficient token balance");
  }
  return data.balance_tokens;
}

export async function deductTokens(
  serviceClient: ReturnType<typeof createServiceClient>,
  userId: string,
  tokensUsed: number,
  operationType: string,
  description: string
) {
  const { data: wallet } = await serviceClient
    .from("token_wallets")
    .select("balance_tokens")
    .eq("user_id", userId)
    .single();

  if (!wallet) {
    throw new Error("Wallet not found during deduction");
  }

  const newBalance = wallet.balance_tokens - tokensUsed;
  if (newBalance < 0) {
    throw new Error("Insufficient token balance");
  }

  const { error: deductError } = await serviceClient
    .from("token_wallets")
    .update({ balance_tokens: newBalance })
    .eq("user_id", userId);

  if (deductError) {
    throw new Error("Failed to deduct tokens");
  }

  const { error: txError } = await serviceClient
    .from("token_transactions")
    .insert({
      user_id: userId,
      tokens_used: tokensUsed,
      operation_type: operationType,
      description,
    });

  if (txError) {
    throw new Error("Failed to log token transaction");
  }
}

export async function logAiRequest(
  serviceClient: ReturnType<typeof createServiceClient>,
  userId: string,
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  requestType: string
) {
  await serviceClient.from("ai_requests").insert({
    user_id: userId,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    request_type: requestType,
  });
}

export function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
  });
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
  });
}
