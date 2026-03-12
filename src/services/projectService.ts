import { supabase } from "@/lib/supabaseClient";
import type { Project } from "@/types/project";

const placeholderProjects: Project[] = [
  {
    id: "1",
    title: "Inventory Management System",
    slug: "inventory-management-system",
    description:
      "A multi-location inventory tracking system with real-time stock updates, automated reorder alerts, and comprehensive reporting for retail and warehouse operations.",
    features: [
      "Multi-location stock tracking",
      "Automated low-stock alerts",
      "Barcode scanning integration",
      "Sales and inventory reporting",
      "Role-based access control",
    ],
    tech_stack: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    status: "available",
    featured: true,
    upwork_link: null,
    youtube_link: null,
    tiktok_link: null,
    media_files: [],
    profile_image: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Restaurant POS Platform",
    slug: "restaurant-pos-platform",
    description:
      "A full-service point-of-sale system supporting dine-in, takeaway, and delivery operations with kitchen display integration and payment processing.",
    features: [
      "Order management for dine-in and takeaway",
      "Kitchen display system",
      "Table management",
      "Payment processing integration",
      "Daily sales reporting",
    ],
    tech_stack: ["React", "Supabase", "TypeScript", "Tailwind CSS"],
    status: "available",
    featured: true,
    upwork_link: null,
    youtube_link: null,
    tiktok_link: null,
    media_files: [],
    profile_image: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Client Booking Portal",
    slug: "client-booking-portal",
    description:
      "An online booking and scheduling portal for service-based businesses with calendar management and automated reminders.",
    features: [
      "Online appointment scheduling",
      "Calendar integration",
      "Automated email reminders",
      "Customer self-service portal",
      "Staff availability management",
    ],
    tech_stack: ["Next.js", "Supabase", "Tailwind CSS", "TypeScript"],
    status: "upcoming",
    featured: true,
    upwork_link: null,
    youtube_link: null,
    tiktok_link: null,
    media_files: [],
    profile_image: null,
    created_at: new Date().toISOString(),
  },
];

export async function getAllProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data as Project[];

    return placeholderProjects;
  } catch {
    return placeholderProjects;
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data as Project[];

    return placeholderProjects.filter((p) => p.featured);
  } catch {
    return placeholderProjects.filter((p) => p.featured);
  }
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    if (data) return data as Project;

    return placeholderProjects.find((p) => p.slug === slug) ?? null;
  } catch {
    return placeholderProjects.find((p) => p.slug === slug) ?? null;
  }
}
