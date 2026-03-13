import {
  verifyUser,
  createServiceClient,
  checkTokenBalance,
  deductTokens,
  logAiRequest,
  getCorsHeaders,
  errorResponse,
  jsonResponse,
  callAiModel,
} from "../_shared/utils.ts";

interface RequestBody {
  businessName: string;
  goalType: "prompts" | "ideas";
  modelId: string;
  industry?: string;
  softwareFeatures?: string;
  techStack?: string;
  dailyOperations?: string;
  softwareProblem?: string;
}

function buildSystemPrompt(body: RequestBody): string {
  if (body.goalType === "prompts") {
    return `You are a senior software architect. The user wants professional software engineering prompts that ensure proper app structure, GitHub commit best practices, performance, security, and future scalability.

Given the following details, produce a structured software development plan in JSON format:
- Business/Software Name: ${body.businessName}
- Industry: ${body.industry || "Not specified"}
- Desired Features: ${body.softwareFeatures || "Not specified"}
- Preferred Tech Stack: ${body.techStack || "Not specified"}

Return a JSON object with these exact keys:
{
  "software_description": "A comprehensive plain-text description of the software system",
  "app_architecture": "Detailed recommended application architecture as a plain-text string, NOT an object",
  "recommended_stack": "The recommended technology stack with justifications as a single plain-text string, NOT an object or nested structure",
  "modules": [
    { "name": "Module name", "description": "Module purpose", "priority": "high|medium|low" }
  ]
}

IMPORTANT: software_description, app_architecture, and recommended_stack must each be a single plain-text string. Never return them as objects or arrays.
Be specific, actionable, and professional. Do not include markdown formatting. Return only valid JSON.`;
  }

  return `You are a senior software architect and business analyst. The user wants to generate business ideas with professional software engineering AI prompts.

Given the following details, produce a structured software development plan in JSON format:
- Business Name: ${body.businessName}
- Daily Operations: ${body.dailyOperations || "Not specified"}
- Software Problem to Solve: ${body.softwareProblem || "Not specified"}

Analyze the business operations and propose a software solution. Return a JSON object with these exact keys:
{
  "software_description": "A comprehensive description of the proposed software system that solves their business problem as a plain-text string",
  "app_architecture": "Detailed recommended application architecture as a plain-text string, NOT an object",
  "recommended_stack": "The recommended technology stack with justifications as a single plain-text string, NOT an object or nested structure",
  "modules": [
    { "name": "Module name", "description": "Module purpose", "priority": "high|medium|low" }
  ]
}

IMPORTANT: software_description, app_architecture, and recommended_stack must each be a single plain-text string. Never return them as objects or arrays.
Be specific, actionable, and professional. Do not include markdown formatting. Return only valid JSON.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders() });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const user = await verifyUser(req.headers.get("Authorization"));
    const serviceClient = createServiceClient();
    await checkTokenBalance(serviceClient, user.id);

    const body: RequestBody = await req.json();

    if (!body.businessName || !body.goalType) {
      return errorResponse("businessName and goalType are required");
    }

    const modelId = body.modelId || "gpt-5.3-codex";
    const systemPrompt = buildSystemPrompt(body);
    const isOpenAI = modelId.startsWith("gpt-");

    const result = await callAiModel(
      modelId,
      systemPrompt,
      `Generate a software plan for: ${body.businessName}`,
      { jsonMode: isOpenAI }
    );

    await deductTokens(
      serviceClient,
      user.id,
      result.billedTokens,
      "generate_plan",
      `Software plan generation for ${body.businessName} (${modelId})`
    );

    await logAiRequest(
      serviceClient,
      user.id,
      result.promptTokens,
      result.completionTokens,
      result.totalTokens,
      "generate_plan"
    );

    let plan;
    try {
      plan = JSON.parse(result.content);
    } catch {
      plan = {
        software_description: result.content,
        app_architecture: "",
        recommended_stack: "",
        modules: [],
      };
    }

    // Normalize fields to strings — AI may return objects instead of plain text
    for (const key of ["software_description", "app_architecture", "recommended_stack"] as const) {
      const val = plan[key];
      if (val && typeof val === "object") {
        plan[key] = Object.entries(val)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
      }
    }

    return jsonResponse({
      plan,
      tokensUsed: result.totalTokens,
      billedTokens: result.billedTokens,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (
      message.includes("authorization") ||
      message.includes("session") ||
      message.includes("Invalid")
    ) {
      return errorResponse(message, 401);
    }
    if (message.includes("Insufficient")) {
      return errorResponse(message, 402);
    }
    if (message.includes("AI service request failed")) {
      return errorResponse(message, 502);
    }
    console.error("generateBusinessPlan error:", message);
    return errorResponse(message, 500);
  }
});
