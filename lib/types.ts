export type ResourceStatus = "processing" | "ready" | "failed";

export interface Resource {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  ai_summary: string | null;
  domain: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  screenshot_url: string | null;
  status: ResourceStatus;
  tags: string[];
  categories: string[];
  source: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const CATEGORIES = [
  "Components",
  "Inspiration",
  "Animation",
  "Tools",
  "Color",
  "Typography",
  "Icons",
  "Assets",
] as const;

export type Category = (typeof CATEGORIES)[number];
