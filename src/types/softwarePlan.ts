export interface SoftwarePlanRequest {
  businessName: string;
  goalType: "prompts" | "ideas";
  industry?: string;
  softwareFeatures?: string;
  techStack?: string;
  dailyOperations?: string;
  softwareProblem?: string;
}

export interface SoftwarePlanResponse {
  software_description: string;
  app_architecture: string;
  recommended_stack: string;
  modules: SoftwareModule[];
}

export interface SoftwareModule {
  name: string;
  description: string;
  priority: string;
}

export interface PromptStage {
  stage: number;
  title: string;
  description: string;
  prompt: string;
  tokenCost: number;
}

export interface PromptStageResponse {
  stage: number;
  title: string;
  prompt: string;
  tokensUsed: number;
}

export interface TokenWallet {
  user_id: string;
  balance_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  tokens_used: number;
  operation_type: string;
  description: string;
  created_at: string;
}

export interface AiRequest {
  id: string;
  user_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_type: string;
  created_at: string;
}

export const PROMPT_STAGES: Omit<PromptStage, "prompt" | "tokenCost">[] = [
  {
    stage: 1,
    title: "Project Foundation",
    description:
      "Repository setup, development rules file, and clean commit practices.",
  },
  {
    stage: 2,
    title: "Application Layout",
    description: "Navigation structure and UI architecture.",
  },
  {
    stage: 3,
    title: "Backend System Design",
    description: "Database schema and API structure.",
  },
  {
    stage: 4,
    title: "Performance Architecture",
    description: "Pagination and caching strategy.",
  },
  {
    stage: 5,
    title: "Media Optimization",
    description: "Lazy loading for images and videos.",
  },
  {
    stage: 6,
    title: "Production Readiness",
    description: "Error handling and deployment preparation.",
  },
];

export const TOKEN_PRICE_USD = 0.0003;
