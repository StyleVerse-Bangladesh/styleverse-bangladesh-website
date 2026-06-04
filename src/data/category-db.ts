import type { Category } from "@/data/category-taxonomy";
import { db } from "@/lib/db";

type PrismaCategoryRecord = {
  depth: number;
  featured: boolean;
  icon: string | null;
  id: string;
  image: string | null;
  isActive: boolean;
  label: string;
  parentId: string | null;
  path: string[];
  rootSlug: string;
  seoDescription: string | null;
  seoTitle: string | null;
  showInFilter: boolean;
  showInNav: boolean;
  slug: string;
  sortOrder: number;
  tone: string | null;
};

export async function getDatabaseCategories(): Promise<Category[]> {
  const categories = await db.category.findMany({
    orderBy: [{ depth: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    select: {
      depth: true,
      featured: true,
      icon: true,
      id: true,
      image: true,
      isActive: true,
      label: true,
      parentId: true,
      path: true,
      rootSlug: true,
      seoDescription: true,
      seoTitle: true,
      showInFilter: true,
      showInNav: true,
      slug: true,
      sortOrder: true,
      tone: true,
    },
  });

  return buildCategoryTree(categories);
}

export function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children ? flattenCategories(category.children) : []),
  ]);
}

function buildCategoryTree(records: PrismaCategoryRecord[]): Category[] {
  const categoryById = new Map<string, Category>();

  for (const record of records) {
    categoryById.set(record.id, mapPrismaCategoryToStorefrontCategory(record));
  }

  const roots: Category[] = [];

  for (const category of categoryById.values()) {
    if (category.parentId) {
      const parent = categoryById.get(category.parentId);

      if (parent) {
        parent.children = [...(parent.children ?? []), category];
        continue;
      }
    }

    roots.push(category);
  }

  sortCategoryTree(roots);

  return roots;
}

export function mapPrismaCategoryToStorefrontCategory(
  category: PrismaCategoryRecord,
): Category {
  return {
    depth: category.depth,
    featured: category.featured,
    icon: category.icon ?? undefined,
    id: category.id,
    image: category.image ?? undefined,
    isActive: category.isActive,
    label: category.label,
    parentId: category.parentId,
    path: [...category.path],
    rootSlug: category.rootSlug,
    seo:
      category.seoTitle || category.seoDescription
        ? {
            description: category.seoDescription ?? undefined,
            title: category.seoTitle ?? undefined,
          }
        : undefined,
    showInFilter: category.showInFilter,
    showInNav: category.showInNav,
    slug: category.slug,
    sortOrder: category.sortOrder,
    tone: category.tone ?? undefined,
  };
}

function sortCategoryTree(categories: Category[]) {
  categories.sort(sortCategories);

  for (const category of categories) {
    if (category.children) {
      sortCategoryTree(category.children);
    }
  }
}

function sortCategories(left: Category, right: Category) {
  return left.sortOrder - right.sortOrder || left.label.localeCompare(right.label);
}
