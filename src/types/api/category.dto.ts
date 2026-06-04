import type { CategorySeo } from "@/data/category-taxonomy";

export type CategoryDto = {
  id: string;
  parentId: string | null;
  label: string;
  slug: string;
  path: string[];
  rootSlug: string;
  depth: number;
  sortOrder: number;
  isActive: boolean;
  showInNav: boolean;
  showInFilter: boolean;
  image?: string;
  icon?: string;
  tone?: string;
  featured?: boolean;
  seo?: CategorySeo;
  children?: CategoryDto[];
};
