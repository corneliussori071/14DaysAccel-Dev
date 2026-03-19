import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getCorsHeaders(): Record<string, string> {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "https://14daysaccel.dev";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
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
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });
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
  minimumTokens = 50
): Promise<number> {
  const { data, error } = await serviceClient
    .from("token_wallets")
    .select("balance_tokens")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Auto-provision wallet for users who signed up before the trigger existed
    const { data: newWallet, error: insertError } = await serviceClient
      .from("token_wallets")
      .insert({ user_id: userId, balance_tokens: 1000 })
      .select("balance_tokens")
      .single();

    if (insertError || !newWallet) {
      throw new Error("Token wallet not found");
    }
    return newWallet.balance_tokens;
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
  const { data, error } = await serviceClient.rpc("deduct_tokens", {
    p_user_id: userId,
    p_amount: tokensUsed,
    p_operation_type: operationType,
    p_description: description,
  });

  if (error) {
    throw new Error(
      error.message.includes("Insufficient")
        ? "Insufficient token balance"
        : "Failed to deduct tokens"
    );
  }

  return data as number;
}

export async function checkAiServicesEnabled(
  serviceClient: ReturnType<typeof createServiceClient>
): Promise<void> {
  const { data } = await serviceClient
    .from("admin_settings")
    .select("value")
    .eq("key", "emergency")
    .single();

  if (data?.value?.ai_services_disabled) {
    throw new Error("AI services are temporarily unavailable. Please try again later.");
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

// --- Multi-model AI support ---

type ModelId =
  | "claude-opus-4-6"
  | "claude-sonnet-4-6"
  | "gpt-5.4"
  | "gpt-5.3-codex";

interface ModelConfig {
  provider: "openai" | "anthropic";
  apiModel: string;
  tokenMultiplier: number;
}

const MODEL_CONFIGS: Record<ModelId, ModelConfig> = {
  "claude-opus-4-6": {
    provider: "anthropic",
    apiModel: "claude-opus-4-20250514",
    tokenMultiplier: 3,
  },
  "claude-sonnet-4-6": {
    provider: "anthropic",
    apiModel: "claude-sonnet-4-20250514",
    tokenMultiplier: 1,
  },
  "gpt-5.4": {
    provider: "openai",
    apiModel: "gpt-4o",
    tokenMultiplier: 1,
  },
  "gpt-5.3-codex": {
    provider: "openai",
    apiModel: "gpt-4o-mini",
    tokenMultiplier: 1,
  },
};

export function getModelConfig(modelId: string): ModelConfig {
  const config = MODEL_CONFIGS[modelId as ModelId];
  if (!config) {
    throw new Error(`Unsupported model: ${modelId}`);
  }
  return config;
}

interface AiCallResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  billedTokens: number;
}

export async function callAiModel(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  options?: { jsonMode?: boolean }
): Promise<AiCallResult> {
  const config = getModelConfig(modelId);

  if (config.provider === "anthropic") {
    return callAnthropic(config, systemPrompt, userMessage);
  }
  return callOpenAI(config, systemPrompt, userMessage, options?.jsonMode);
}

async function callAnthropic(
  config: ModelConfig,
  systemPrompt: string,
  userMessage: string
): Promise<AiCallResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("CLAUDE_API_KEY");
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.apiModel,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Anthropic API error:", response.status, errText);
    throw new Error(`AI service request failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content =
    data.content?.[0]?.type === "text" ? data.content[0].text : "";
  const promptTokens = data.usage?.input_tokens ?? 0;
  const completionTokens = data.usage?.output_tokens ?? 0;
  const totalTokens = promptTokens + completionTokens;

  return {
    content,
    promptTokens,
    completionTokens,
    totalTokens,
    billedTokens: totalTokens * config.tokenMultiplier,
  };
}

async function callOpenAI(
  config: ModelConfig,
  systemPrompt: string,
  userMessage: string,
  jsonMode?: boolean
): Promise<AiCallResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const body: Record<string, unknown> = {
    model: config.apiModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI API error:", response.status, errText);
    throw new Error(`AI service request failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const promptTokens = data.usage?.prompt_tokens ?? 0;
  const completionTokens = data.usage?.completion_tokens ?? 0;
  const totalTokens = data.usage?.total_tokens ?? 0;

  return {
    content,
    promptTokens,
    completionTokens,
    totalTokens,
    billedTokens: totalTokens * config.tokenMultiplier,
  };
}
