export interface ProjectMedia {
  url: string;
  type: "image" | "video";
  name: string;
}

export interface SupplementaryFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  tech_stack: string[];
  status: "available" | "upcoming";
  featured: boolean;
  upwork_link: string | null;
  youtube_link: string | null;
  tiktok_link: string | null;
  media_files: ProjectMedia[];
  profile_image: string | null;
  testing_available: boolean;
  testing_instructions: string | null;
  testing_url: string | null;
  testing_doc_url: string | null;
  testing_doc_name: string | null;
  price_usd: number | null;
  product_path: string | null;
  product_variable: string | null;
  dodo_product_path: string | null;
  dodo_product_variable: string | null;
  source_code_url: string | null;
  source_code_name: string | null;
  source_code_size: number | null;
  supplementary_files: SupplementaryFile[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  created_at: string;
}

export interface ProjectReaction {
  id: string;
  project_id: string;
  user_id: string;
  reaction_type: "like" | "dislike";
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export interface ProjectInterest {
  id: string;
  project_id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface ProjectPurchase {
  id: string;
  project_id: string;
  user_id: string;
  provider: string;
  provider_order_id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "completed" | "refunded" | "failed";
  download_token: string;
  download_expires_at: string;
  created_at: string;
}
