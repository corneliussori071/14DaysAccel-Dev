import { supabase } from "@/lib/supabase";
import type {
  SoftwarePlanRequest,
  SoftwarePlanResponse,
  PromptStageResponse,
  AiModelId,
} from "@/types/softwarePlan";

const SUPABASE_FUNCTIONS_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in to use this feature.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

async function verifyAiServicesEnabled(): Promise<void> {
  const res = await fetch("/api/ai/status", { cache: "no-store" });
  if (res.ok) {
    const data = await res.json();
    if (!data.enabled) {
      throw new Error("AI services are temporarily unavailable. Please try again later.");
    }
  }
}

export async function generateBusinessPlan(
  request: SoftwarePlanRequest
): Promise<{
  plan: SoftwarePlanResponse;
  tokensUsed: number;
  billedTokens: number;
  promptTokens: number;
  completionTokens: number;
}> {
  await verifyAiServicesEnabled();
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/generate-business-plan`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate business plan");
  }

  return response.json();
}

export async function generatePromptStage(
  stage: number,
  businessName: string,
  softwareDescription: string,
  appArchitecture: string,
  recommendedStack: string,
  modelId: AiModelId
): Promise<PromptStageResponse> {
  await verifyAiServicesEnabled();
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/generate-prompt-stage`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        stage,
        businessName,
        softwareDescription,
        appArchitecture,
        recommendedStack,
        modelId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate prompt stage");
  }

  return response.json();
}
