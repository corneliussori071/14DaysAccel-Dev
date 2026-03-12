export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  tech_stack: string[];
  status: "available" | "upcoming";
  upwork_link: string | null;
  youtube_link: string | null;
  tiktok_link: string | null;
  created_at: string;
}
