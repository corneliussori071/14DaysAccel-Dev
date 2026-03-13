import {
  verifyUser,
  createServiceClient,
  checkTokenBalance,
  deductTokens,
  logAiRequest,
  getCorsHeaders,
  errorResponse,
  jsonResponse,
} from "../_shared/utils.ts";

interface RequestBody {
  businessName: string;
  goalType: "prompts" | "ideas";
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
  "software_description": "A comprehensive description of the software system",
  "app_architecture": "Detailed recommended application architecture",
  "recommended_stack": "The recommended technology stack with justifications",
  "modules": [
    { "name": "Module name", "description": "Module purpose", "priority": "high|medium|low" }
  ]
}

Be specific, actionable, and professional. Do not include markdown formatting. Return only valid JSON.`;
  }

  return `You are a senior software architect and business analyst. The user wants to generate business ideas with professional software engineering AI prompts.

Given the following details, produce a structured software development plan in JSON format:
- Business Name: ${body.businessName}
- Daily Operations: ${body.dailyOperations || "Not specified"}
- Software Problem to Solve: ${body.softwareProblem || "Not specified"}

Analyze the business operations and propose a software solution. Return a JSON object with these exact keys:
{
  "software_description": "A comprehensive description of the proposed software system that solves their business problem",
  "app_architecture": "Detailed recommended application architecture",
  "recommended_stack": "The recommended technology stack with justifications",
  "modules": [
    { "name": "Module name", "description": "Module purpose", "priority": "high|medium|low" }
  ]
}

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

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return errorResponse("AI service not configured", 500);
    }

    const systemPrompt = buildSystemPrompt(body);

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate a software plan for: ${body.businessName}`,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI API error:", errText);
      return errorResponse("AI service request failed", 502);
    }

    const aiData = await aiResponse.json();

    const promptTokens = aiData.usage?.prompt_tokens ?? 0;
    const completionTokens = aiData.usage?.completion_tokens ?? 0;
    const totalTokens = aiData.usage?.total_tokens ?? 0;

    await deductTokens(
      serviceClient,
      user.id,
      totalTokens,
      "generate_plan",
      `Software plan generation for ${body.businessName}`
    );

    await logAiRequest(
      serviceClient,
      user.id,
      promptTokens,
      completionTokens,
      totalTokens,
      "generate_plan"
    );

    const content = aiData.choices?.[0]?.message?.content ?? "{}";
    let plan;
    try {
      plan = JSON.parse(content);
    } catch {
      plan = {
        software_description: content,
        app_architecture: "",
        recommended_stack: "",
        modules: [],
      };
    }

    return jsonResponse({ plan, tokensUsed: totalTokens });
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
    console.error("generateBusinessPlan error:", message);
    return errorResponse(message, 500);
  }
});
