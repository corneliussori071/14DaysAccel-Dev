export interface ProjectMedia {
  url: string;
  type: "image" | "video";
  name: string;
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
  created_at: string;
}
