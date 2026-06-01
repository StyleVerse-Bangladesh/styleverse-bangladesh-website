import type { NavItem } from "@/types/navigation";

export const rootCategorySlugs = [
  "men",
  "women",
  "kids",
  "sports",
  "shoes",
  "accessories",
  "seasonal-fits",
] as const;

export type RootCategorySlug = (typeof rootCategorySlugs)[number];

export type CategoryNode = {
  label: string;
  slug: string;
  path: string[];
  children?: CategoryNode[];
};

const menChildren = [
  node("T-Shirts", "t-shirts", ["men"], [
    node("Half Sleeve T-Shirt", "half-sleeve-t-shirt", ["men", "t-shirts"]),
    node("Full Sleeve T-Shirt", "full-sleeve-t-shirt", ["men", "t-shirts"]),
    node("Drop Shoulder T-Shirt", "drop-shoulder-t-shirt", ["men", "t-shirts"]),
    node("Solid T-Shirt", "solid-t-shirt", ["men", "t-shirts"]),
  ]),
  node("Polo T-Shirts", "polo-t-shirts", ["men"], [
    node("Knitted Polo", "knitted-polo", ["men", "polo-t-shirts"]),
    node("Old Money Polo", "old-money-polo", ["men", "polo-t-shirts"]),
    node("Solid Polo", "solid-polo", ["men", "polo-t-shirts"]),
    node("Printed Polo", "printed-polo", ["men", "polo-t-shirts"]),
  ]),
  node("Shirts", "shirts", ["men"], [
    node("Casual Shirt", "casual-shirt", ["men", "shirts"]),
    node("Formal Shirt", "formal-shirt", ["men", "shirts"]),
    node("Denim Shirt", "denim-shirt", ["men", "shirts"]),
    node("Linen Shirt", "linen-shirt", ["men", "shirts"]),
  ]),
  node("Joggers", "joggers", ["men"], [
    node("Regular Joggers", "regular-joggers", ["men", "joggers"]),
    node("Cargo Joggers", "cargo-joggers", ["men", "joggers"]),
    node("Sports Joggers", "sports-joggers", ["men", "joggers"]),
    node("Slim Fit Joggers", "slim-fit-joggers", ["men", "joggers"]),
  ]),
];

export const categoryTaxonomy: CategoryNode[] = [
  node("Men", "men", [], menChildren),
  node("Women", "women", [], [
    node("Dresses", "dresses", ["women"]),
    node("Tops", "tops", ["women"]),
    node("Shirts", "shirts", ["women"]),
  ]),
  node("Kids", "kids", [], [
    node("Hoodies", "hoodies", ["kids"]),
    node("T-Shirts", "t-shirts", ["kids"]),
    node("Bottoms", "bottoms", ["kids"]),
  ]),
  node("Sports", "sports", [], [
    node("Training", "training", ["sports"]),
    node("Athleisure", "athleisure", ["sports"]),
    node("Performance", "performance", ["sports"]),
  ]),
  node("Shoes", "shoes", [], [
    node("Sneakers", "sneakers", ["shoes"]),
    node("Casual Shoes", "casual-shoes", ["shoes"]),
    node("Sports Shoes", "sports-shoes", ["shoes"]),
  ]),
  node("Accessories", "accessories", [], [
    node("Bags", "bags", ["accessories"]),
    node("Caps", "caps", ["accessories"]),
    node("Belts", "belts", ["accessories"]),
  ]),
  node("Seasonal Fits", "seasonal-fits", [], [
    node("Summer Fits", "summer-fits", ["seasonal-fits"]),
    node("Winter Fits", "winter-fits", ["seasonal-fits"]),
    node("Festive Fits", "festive-fits", ["seasonal-fits"]),
  ]),
];

export function isRootCategorySlug(value: string): value is RootCategorySlug {
  return rootCategorySlugs.includes(value as RootCategorySlug);
}

export function findCategoryByPath(path: string[]) {
  return flattenCategoryNodes(categoryTaxonomy).find((item) =>
    arePathsEqual(item.path, path),
  );
}

export function getRootCategory(rootSlug: RootCategorySlug) {
  return categoryTaxonomy.find((item) => item.slug === rootSlug);
}

export function getCategoryFilterOptions(category: CategoryNode) {
  return category.children ?? [];
}

export function getCategoryPathNodes(category: CategoryNode) {
  return category.path
    .map((_, index) => findCategoryByPath(category.path.slice(0, index + 1)))
    .filter((item): item is CategoryNode => Boolean(item));
}

export function generateCategoryStaticParams(rootSlug: RootCategorySlug) {
  const root = getRootCategory(rootSlug);

  if (!root) {
    return [];
  }

  return flattenCategoryNodes(root.children ?? []).map((item) => ({
    slug: item.path.slice(1),
  }));
}

export function navItemsToCategoryNodes(items: NavItem[], rootSlug: string) {
  return items.map((item) => navItemToCategoryNode(item, [rootSlug]));
}

function navItemToCategoryNode(item: NavItem, parentPath: string[]): CategoryNode {
  const slug = item.href.split("/").filter(Boolean).at(-1) ?? "";
  const path = [...parentPath, slug];

  return {
    label: item.label,
    slug,
    path,
    children: item.children?.map((child) => navItemToCategoryNode(child, path)),
  };
}

function flattenCategoryNodes(items: CategoryNode[]): CategoryNode[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenCategoryNodes(item.children) : []),
  ]);
}

function node(
  label: string,
  slug: string,
  parentPath: string[],
  children?: CategoryNode[],
): CategoryNode {
  return {
    label,
    slug,
    path: [...parentPath, slug],
    children,
  };
}

function arePathsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}
