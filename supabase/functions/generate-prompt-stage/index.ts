import {
  verifyUser,
  createServiceClient,
  checkTokenBalance,
  checkAiServicesEnabled,
  deductTokens,
  logAiRequest,
  getCorsHeaders,
  errorResponse,
  jsonResponse,
  callAiModel,
} from "../_shared/utils.ts";

interface RequestBody {
  stage: number;
  businessName: string;
  softwareDescription: string;
  appArchitecture: string;
  recommendedStack: string;
  modelId: string;
}

const RULES_FILE_PREAMBLE = `IMPORTANT: The generated prompt MUST begin with this exact preamble at the very top:

"Before generating any code, read and strictly follow the rules defined in:
/docs/development_rules.md"

This forces the AI agent to re-read the development rules before every stage, preventing drift in long conversations.`;

const RULES_FILE_ADVICE = `

After the main prompt content, include a clearly separated note to the user:

"---
TIP: In every conversation with your AI coding assistant, always start your message with the preamble above (pointing to your development rules file). AI agents lose context in long chats. Forcing a re-read of your rules file at the start of every prompt keeps the output professional and consistent. You may also add your own project-specific rules to the file as your project evolves."`;

const STAGE_DEFINITIONS: Record<
  number,
  { title: string; systemContext: string }
> = {
  1: {
    title: "Project Foundation",
    systemContext: `Generate a detailed, actionable prompt for Stage 1: Project Foundation.

This stage has two critical deliverables:

DELIVERABLE 1: Repository Setup
- Repository initialization with proper folder structure for the recommended stack
- Environment configuration (.env, .env.example with placeholder values, .gitignore)
- README with project description, setup instructions, and folder structure overview
- Initial clean commit with conventional commit message

DELIVERABLE 2: Development Rules File
The prompt MUST instruct the developer to create a development rules file at /docs/development_rules.md (or the equivalent path for their stack). This file is the single most important artifact in the project. It defines permanent engineering standards that the developer and all AI assistants must follow.

The generated prompt must tell the AI to produce a development_rules.md file that covers ALL of the following sections, tailored specifically to the recommended tech stack:

1. UI Rules
   - No emojis anywhere in the UI
   - Avoid decorative icons; use icons only when they serve a clear functional purpose
   - Follow professional enterprise SaaS design principles
   - Use clean typography with consistent spacing and alignment
   - Stick to a neutral, professional color palette
   - The interface should resemble professional dashboards (Stripe, Linear, Vercel style)
   - Prioritize readability, information density, and clarity over visual flair
   - Stack-specific UI conventions (e.g., Tailwind utility patterns, component library usage)

2. GitHub Rules
   - Make small, incremental commits; each commit is a single logical change
   - Write clear, descriptive commit messages
   - Use conventional commit prefixes: feat:, fix:, docs:, chore:, refactor:, test:, style:
   - Never make large monolithic commits that bundle unrelated changes
   - Maintain a readable, linear commit history
   - Branch strategy appropriate for the project size

3. Security Rules
   - Never commit secrets, API keys, or environment variables
   - All sensitive config must use .env files
   - .env and .env.local must always be in .gitignore
   - Use .env.example to document required variables with placeholder values
   - Review all commits before pushing to ensure no secrets are included
   - Never log secrets or tokens to the console in any environment

4. Backend Safety
   - Database credentials must never appear in source code
   - Use environment variables for all API keys and service credentials
   - Use secure authentication flows appropriate for the stack
   - Validate and sanitize all user input on the server side
   - Never trust client-side data for authorization decisions
   - Stack-specific backend safety practices (e.g., RLS policies for Supabase, middleware for Express)

5. Code Quality Rules
   - Use the strictest type-checking mode available for the language (e.g., TypeScript strict mode)
   - Follow modular architecture: separate UI components, services, configuration, and types
   - Build reusable components; avoid duplicating logic
   - Maintain clear separation of concerns: UI layer, service/data layer, type definitions
   - Use clean, descriptive naming conventions for files, functions, variables, and types
   - Keep files focused; one component or module per file
   - Avoid any/unknown types; use proper types and interfaces

6. Public Repository Guidelines
   - All code must be professional and production-quality
   - Folder structure must be clear and well-organized
   - Documentation must be included and kept up to date
   - No placeholder junk code, TODO hacks, or commented-out blocks in committed code
   - Every file should serve a clear purpose
   - The repository should demonstrate engineering competence at a glance

7. Performance Rules
   - Implement pagination strategy for lists and tables (both backend and frontend)
   - Image optimization and responsive images
   - Lazy loading for images and videos
   - CDN configuration where applicable
   - File upload handling and compression
   - Media format selection and fallbacks
   - Caching layers and invalidation strategy
   - Query optimization techniques specific to the chosen database
   - Bundle size optimization for the chosen frontend framework
   - Loading state management and skeleton screens

The rules file content must be adapted to the specific recommended stack. For example, if the stack uses Next.js, mention App Router conventions; if it uses Supabase, mention RLS policies; if it uses Django, mention middleware patterns. The rules must feel hand-written by a senior engineer, not AI-generated.

The prompt must emphasize: this file is the backbone of the entire project. Every future prompt and every line of code should conform to these rules.`,
  },
  2: {
    title: "Application Layout",
    systemContext: `${RULES_FILE_PREAMBLE}

Generate a detailed, actionable prompt for Stage 2: Application Layout. Cover:
- Navigation structure and routing
- UI component architecture and hierarchy
- Layout system and responsive design approach
- Shared component patterns
- Page structure and composition

${RULES_FILE_ADVICE}`,
  },
  3: {
    title: "Backend System Design",
    systemContext: `${RULES_FILE_PREAMBLE}

Generate a detailed, actionable prompt for Stage 3: Backend System Design. Cover:
- Database schema design with relationships
- API endpoint structure and naming
- Authentication and authorization approach
- Data validation and sanitization
- Migration strategy

${RULES_FILE_ADVICE}`,
  },
  4: {
    title: "Performance Architecture",
    systemContext: `${RULES_FILE_PREAMBLE}

Generate a detailed, actionable prompt for Stage 4: Performance Architecture. Cover:
- Pagination strategy for lists and tables
- Caching layers and invalidation
- Query optimization techniques
- Bundle size optimization
- Loading state management

${RULES_FILE_ADVICE}`,
  },
  5: {
    title: "Media Optimization",
    systemContext: `${RULES_FILE_PREAMBLE}

Generate a detailed, actionable prompt for Stage 5: Media Optimization. Cover:
- Image optimization and responsive images
- Lazy loading for images and videos
- CDN configuration
- File upload handling and compression
- Media format selection and fallbacks

${RULES_FILE_ADVICE}`,
  },
  6: {
    title: "Production Readiness",
    systemContext: `${RULES_FILE_PREAMBLE}

Generate a detailed, actionable prompt for Stage 6: Production Readiness. Cover:
- Error boundary and error handling strategy
- Logging and monitoring setup
- Environment-specific configuration
- Deployment pipeline and CI/CD
- Security hardening checklist

${RULES_FILE_ADVICE}`,
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
    await checkAiServicesEnabled(serviceClient);
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

    const modelId = body.modelId || "gpt-5.3-codex";

    const systemPrompt = `You are an expert software engineering mentor creating step-by-step build prompts for developers.

Context about the software being built:
- Name: ${body.businessName}
- Description: ${body.softwareDescription}
- Architecture: ${body.appArchitecture || "Not specified"}
- Stack: ${body.recommendedStack || "Not specified"}

${stageDef.systemContext}

Generate a comprehensive, copy-paste-ready prompt that a developer can give to an AI coding assistant to implement this stage. The prompt should be specific to the project described above. Be thorough but concise. Do not use emojis. Do not use em dashes.`;

    const result = await callAiModel(
      modelId,
      systemPrompt,
      `Generate the build prompt for Stage ${body.stage}: ${stageDef.title}`
    );

    await deductTokens(
      serviceClient,
      user.id,
      result.billedTokens,
      "generate_prompt_stage",
      `Prompt stage ${body.stage}: ${stageDef.title} (${modelId})`
    );

    await logAiRequest(
      serviceClient,
      user.id,
      result.promptTokens,
      result.completionTokens,
      result.totalTokens,
      "generate_prompt_stage"
    );

    return jsonResponse({
      stage: body.stage,
      title: stageDef.title,
      prompt: result.content || "No prompt generated.",
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
    if (message.includes("AI services are temporarily unavailable")) {
      return errorResponse(message, 503);
    }
    if (message.includes("AI service request failed")) {
      return errorResponse(message, 502);
    }
    console.error("generatePromptStage error:", message);
    return errorResponse(message, 500);
  }
});
