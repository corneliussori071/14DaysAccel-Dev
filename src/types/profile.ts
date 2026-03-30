export interface UserProfile {
  user_id: string;
  full_name: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface SavedPlan {
  id: string;
  user_id: string;
  business_name: string;
  goal_type: string;
  model_id: string;
  plan_data: Record<string, unknown>;
  tokens_used: number;
  billed_tokens: number;
  generated_prompts: Record<string, GeneratedPromptEntry>;
  created_at: string;
}

export interface GeneratedPromptEntry {
  stage: number;
  title: string;
  prompt: string;
  tokensUsed: number;
  generatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tokens_per_month: number;
  price_usd: number;
  is_active: boolean;
  features: string[];
  plan_type: "subscription" | "custom";
  min_tokens?: number;
  max_tokens?: number;
  creem_product_id?: string;
}
