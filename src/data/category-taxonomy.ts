import type { NavItem } from "@/types/navigation";

export const rootCategorySlugs = [
  "men",
  "women",
  "kids",
  "seasonal-fits",
  "sports",
  "shoes",
  "accessories",
] as const;

export type RootCategorySlug = (typeof rootCategorySlugs)[number];

export type CategorySeo = {
  title?: string;
  description?: string;
};

export type Category = {
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
  children?: Category[];
};

export type CategoryNode = Category;

type CategorySeed = {
  label: string;
  slug: string;
  isActive?: boolean;
  showInNav?: boolean;
  showInFilter?: boolean;
  image?: string;
  icon?: string;
  tone?: string;
  featured?: boolean;
  seo?: CategorySeo;
  children?: CategorySeed[];
};

type CategoryLookup = string | string[] | CategoryNode;

// Temporary seed data. Future admin/API category records should use the
// Category shape above so this static source can be swapped without UI churn.
const categorySeeds: CategorySeed[] = [
  seed("Men", "men", [
    seed("T-Shirts", "t-shirts", [
      seed("Half Sleeve T-Shirt", "half-sleeve-t-shirt"),
      seed("Full Sleeve T-Shirt", "full-sleeve-t-shirt"),
      seed("Drop Shoulder T-Shirt", "drop-shoulder-t-shirt"),
      seed("Solid T-Shirt", "solid-t-shirt"),
    ]),
    seed("Polo T-Shirts", "polo-t-shirts", [
      seed("Knitted Polo", "knitted-polo"),
      seed("Old Money Polo", "old-money-polo"),
      seed("Solid Polo", "solid-polo"),
      seed("Printed Polo", "printed-polo"),
    ]),
    seed("Shirts", "shirts", [
      seed("Casual Shirt", "casual-shirt"),
      seed("Formal Shirt", "formal-shirt"),
      seed("Denim Shirt", "denim-shirt"),
      seed("Linen Shirt", "linen-shirt"),
    ]),
    seed("Joggers", "joggers", [
      seed("Regular Joggers", "regular-joggers"),
      seed("Cargo Joggers", "cargo-joggers"),
      seed("Sports Joggers", "sports-joggers"),
      seed("Slim Fit Joggers", "slim-fit-joggers"),
    ]),
  ]),
  seed("Women", "women", [
    seed("Dresses", "dresses", undefined, { showInNav: false }),
    seed("Tops", "tops", undefined, { showInNav: false }),
    seed("Shirts", "shirts", undefined, { showInNav: false }),
  ]),
  seed("Kids", "kids", [
    seed("Hoodies", "hoodies", undefined, { showInNav: false }),
    seed("T-Shirts", "t-shirts", undefined, { showInNav: false }),
    seed("Bottoms", "bottoms", undefined, { showInNav: false }),
  ]),
  seed("Seasonal Fits", "seasonal-fits", [
    seed("Summer Fits", "summer-fits", undefined, { showInNav: false }),
    seed("Winter Fits", "winter-fits", undefined, { showInNav: false }),
    seed("Festive Fits", "festive-fits", undefined, { showInNav: false }),
  ]),
  seed("Sports", "sports", [
    seed("Training", "training", undefined, { showInNav: false }),
    seed("Athleisure", "athleisure", undefined, { showInNav: false }),
    seed("Performance", "performance", undefined, { showInNav: false }),
  ]),
  seed("Shoes", "shoes", [
    seed("Sneakers", "sneakers", undefined, { showInNav: false }),
    seed("Casual Shoes", "casual-shoes", undefined, { showInNav: false }),
    seed("Sports Shoes", "sports-shoes", undefined, { showInNav: false }),
  ]),
  seed("Accessories", "accessories", [
    seed("Bags", "bags", undefined, { showInNav: false }),
    seed("Caps", "caps", undefined, { showInNav: false }),
    seed("Belts", "belts", undefined, { showInNav: false }),
  ]),
];

export const categoryTaxonomy: CategoryNode[] = buildCategoryTree(categorySeeds);

const allCategories = flattenCategoryNodes(categoryTaxonomy);

export function isRootCategorySlug(value: string): value is RootCategorySlug {
  return rootCategorySlugs.includes(value as RootCategorySlug);
}

export function getAllCategories() {
  return allCategories;
}

export function getRootCategories() {
  return categoryTaxonomy;
}

export function getCategoryByPath(path: string[]) {
  return allCategories.find((item) => arePathsEqual(item.path, path));
}

export function findCategoryByPath(path: string[]) {
  return getCategoryByPath(path);
}

export function getCategoryById(id: string) {
  return allCategories.find((item) => item.id === id);
}

export function getRootCategory(rootSlug: RootCategorySlug) {
  return categoryTaxonomy.find((item) => item.slug === rootSlug);
}

export function getCategoryChildren(categoryIdOrPath: CategoryLookup) {
  const children = resolveCategory(categoryIdOrPath)?.children ?? [];

  return [...children].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getCategoryFilterOptions(category: CategoryNode) {
  return getCategoryChildren(category).filter(
    (item) => item.isActive && item.showInFilter,
  );
}

export function getCategoryPathNodes(category: CategoryNode) {
  return category.path
    .map((_, index) => getCategoryByPath(category.path.slice(0, index + 1)))
    .filter((item): item is CategoryNode => Boolean(item));
}

export function getCategoryStaticParams(rootSlug: RootCategorySlug) {
  const root = getRootCategory(rootSlug);

  if (!root) {
    return [];
  }

  return flattenCategoryNodes(root.children ?? []).map((item) => ({
    slug: item.path.slice(1),
  }));
}

export function generateCategoryStaticParams(rootSlug: RootCategorySlug) {
  return getCategoryStaticParams(rootSlug);
}

export function buildCategoryHref(category: CategoryNode) {
  return category.path.length ? `/${category.path.join("/")}` : `/${category.slug}`;
}

export function categoryTreeToNavigationItems(
  categories: CategoryNode[] = categoryTaxonomy,
) {
  return [...categories]
    .filter((category) => category.isActive && category.showInNav)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(categoryToNavigationItem);
}

export function navItemsToCategoryNodes(items: NavItem[], rootSlug: string) {
  return items.map((item, index) =>
    navItemToCategoryNode(item, [rootSlug], null, index, rootSlug),
  );
}

function categoryToNavigationItem(category: CategoryNode): NavItem {
  const children = categoryTreeToNavigationItems(category.children ?? []);
  const item: NavItem = {
    label: category.depth === 0 ? category.label.toUpperCase() : category.label,
    href: buildCategoryHref(category),
  };

  if (category.depth === 0) {
    item.menuKey = category.slug;
  }

  if (children.length) {
    item.children = children;
  }

  return item;
}

function navItemToCategoryNode(
  item: NavItem,
  parentPath: string[],
  parentId: string | null,
  sortOrder: number,
  rootSlug: string,
): CategoryNode {
  const slug = item.href.split("/").filter(Boolean).at(-1) ?? "";
  const path = [...parentPath, slug];
  const id = buildCategoryId(path);

  return {
    id,
    parentId,
    label: item.label,
    slug,
    path,
    rootSlug,
    depth: path.length - 1,
    sortOrder,
    isActive: true,
    showInNav: true,
    showInFilter: true,
    children: item.children?.map((child, index) =>
      navItemToCategoryNode(child, path, id, index, rootSlug),
    ),
  };
}

function buildCategoryTree(
  seeds: CategorySeed[],
  parentPath: string[] = [],
  parentId: string | null = null,
  rootSlug?: string,
): CategoryNode[] {
  return seeds.map((item, index) => {
    const path = [...parentPath, item.slug];
    const id = buildCategoryId(path);
    const categoryRootSlug = rootSlug ?? item.slug;
    const children = item.children?.length
      ? buildCategoryTree(item.children, path, id, categoryRootSlug)
      : undefined;

    return {
      id,
      parentId,
      label: item.label,
      slug: item.slug,
      path,
      rootSlug: categoryRootSlug,
      depth: path.length - 1,
      sortOrder: index,
      isActive: item.isActive ?? true,
      showInNav: item.showInNav ?? true,
      showInFilter: item.showInFilter ?? true,
      image: item.image,
      icon: item.icon,
      tone: item.tone,
      featured: item.featured,
      seo: item.seo,
      children,
    };
  });
}

function seed(
  label: string,
  slug: string,
  children?: CategorySeed[],
  options: Omit<CategorySeed, "label" | "slug" | "children"> = {},
): CategorySeed {
  return {
    label,
    slug,
    ...options,
    children,
  };
}

function resolveCategory(categoryIdOrPath: CategoryLookup) {
  if (Array.isArray(categoryIdOrPath)) {
    return getCategoryByPath(categoryIdOrPath);
  }

  if (typeof categoryIdOrPath !== "string") {
    return categoryIdOrPath;
  }

  return (
    getCategoryById(categoryIdOrPath) ??
    getCategoryByPath(categoryIdOrPath.split("/").filter(Boolean))
  );
}

function flattenCategoryNodes(items: CategoryNode[]): CategoryNode[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenCategoryNodes(item.children) : []),
  ]);
}

function buildCategoryId(path: string[]) {
  return `cat-${path.join("-")}`;
}

function arePathsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}
