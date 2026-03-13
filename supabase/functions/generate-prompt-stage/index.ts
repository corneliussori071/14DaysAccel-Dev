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
  stage: number;
  businessName: string;
  softwareDescription: string;
  appArchitecture: string;
  recommendedStack: string;
}

const STAGE_DEFINITIONS: Record<
  number,
  { title: string; systemContext: string }
> = {
  1: {
    title: "Project Foundation",
    systemContext: `Generate a detailed, actionable prompt for Stage 1: Project Foundation. Cover:
- Repository initialization and folder structure
- Development rules file with commit conventions
- Clean commit practices and branch strategy
- Environment configuration and gitignore setup
- README structure`,
  },
  2: {
    title: "Application Layout",
    systemContext: `Generate a detailed, actionable prompt for Stage 2: Application Layout. Cover:
- Navigation structure and routing
- UI component architecture and hierarchy
- Layout system and responsive design approach
- Shared component patterns
- Page structure and composition`,
  },
  3: {
    title: "Backend System Design",
    systemContext: `Generate a detailed, actionable prompt for Stage 3: Backend System Design. Cover:
- Database schema design with relationships
- API endpoint structure and naming
- Authentication and authorization approach
- Data validation and sanitization
- Migration strategy`,
  },
  4: {
    title: "Performance Architecture",
    systemContext: `Generate a detailed, actionable prompt for Stage 4: Performance Architecture. Cover:
- Pagination strategy for lists and tables
- Caching layers and invalidation
- Query optimization techniques
- Bundle size optimization
- Loading state management`,
  },
  5: {
    title: "Media Optimization",
    systemContext: `Generate a detailed, actionable prompt for Stage 5: Media Optimization. Cover:
- Image optimization and responsive images
- Lazy loading for images and videos
- CDN configuration
- File upload handling and compression
- Media format selection and fallbacks`,
  },
  6: {
    title: "Production Readiness",
    systemContext: `Generate a detailed, actionable prompt for Stage 6: Production Readiness. Cover:
- Error boundary and error handling strategy
- Logging and monitoring setup
- Environment-specific configuration
- Deployment pipeline and CI/CD
- Security hardening checklist`,
  },
};

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

    if (!body.stage || !body.businessName || !body.softwareDescription) {
      return errorResponse(
        "stage, businessName, and softwareDescription are required"
      );
    }

    const stageDef = STAGE_DEFINITIONS[body.stage];
    if (!stageDef) {
      return errorResponse("Invalid stage number. Must be 1-6.");
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return errorResponse("AI service not configured", 500);
    }

    const systemPrompt = `You are an expert software engineering mentor creating step-by-step build prompts for developers.

Context about the software being built:
- Name: ${body.businessName}
- Description: ${body.softwareDescription}
- Architecture: ${body.appArchitecture || "Not specified"}
- Stack: ${body.recommendedStack || "Not specified"}

${stageDef.systemContext}

Generate a comprehensive, copy-paste-ready prompt that a developer can give to an AI coding assistant to implement this stage. The prompt should be specific to the project described above. Be thorough but concise. Do not use emojis. Do not use em dashes.`;

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
              content: `Generate the build prompt for Stage ${body.stage}: ${stageDef.title}`,
            },
          ],
          temperature: 0.7,
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
      "generate_prompt_stage",
      `Prompt stage ${body.stage}: ${stageDef.title}`
    );

    await logAiRequest(
      serviceClient,
      user.id,
      promptTokens,
      completionTokens,
      totalTokens,
      "generate_prompt_stage"
    );

    const promptText =
      aiData.choices?.[0]?.message?.content ?? "No prompt generated.";

    return jsonResponse({
      stage: body.stage,
      title: stageDef.title,
      prompt: promptText,
      tokensUsed: totalTokens,
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
    console.error("generatePromptStage error:", message);
    return errorResponse(message, 500);
  }
});
