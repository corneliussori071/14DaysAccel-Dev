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
  created_at: string;
}
