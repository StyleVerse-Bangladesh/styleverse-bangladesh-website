import {
  buildCategoryHref,
  categoryTreeToNavigationItems,
  getCategoryStaticParams as getStaticCategoryStaticParams,
  getRootCategories as getStaticRootCategories,
  rootCategorySlugs,
  type Category,
  type RootCategorySlug,
} from "@/data/category-taxonomy";
import {
  flattenCategories,
  getActiveBannerDatabaseCategories,
  getActiveFeaturedDatabaseCategories,
  getDatabaseCategories,
} from "@/data/category-db";
import type { NavItem } from "@/types/navigation";

const standardRootCategorySlugs = new Set<string>(rootCategorySlugs);

export async function getStorefrontCategoryTree(): Promise<Category[]> {
  const databaseCategories = await getDatabaseCategoryTreeIfEnabled();

  return databaseCategories.length ? databaseCategories : getStaticRootCategories();
}

export async function getStorefrontNavigation(): Promise<NavItem[]> {
  const staticNavigation = categoryTreeToNavigationItems(getStaticRootCategories());

  if (!isDatabaseCatalogEnabled()) {
    return staticNavigation;
  }

  try {
    const navigation = buildFeaturedNavigation(await getDatabaseCategories());

    return navigation.length ? navigation : staticNavigation;
  } catch (error) {
    console.error("Database navigation query failed:", error);
    return staticNavigation;
  }
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const categoryTree = await getStorefrontCategoryTree();

  return flattenCategories(categoryTree);
}

export async function getStorefrontCategoryByPath(path: string[]) {
  const categories = await getStorefrontCategories();

  return categories.find((category) => arePathsEqual(category.path, path));
}

export async function getStorefrontFeaturedCategories(): Promise<Category[]> {
  try {
    return getActiveFeaturedDatabaseCategories();
  } catch (error) {
    console.error("Featured category query failed:", error);
    return [];
  }
}

export async function getStorefrontBannerCategories(): Promise<Category[]> {
  try {
    return getActiveBannerDatabaseCategories();
  } catch (error) {
    console.error("Banner category query failed:", error);
    return [];
  }
}

export async function generateCategoryStaticParams(rootSlug: RootCategorySlug) {
  if (!isDatabaseCatalogEnabled()) {
    return getStaticCategoryStaticParams(rootSlug);
  }

  const rootCategory = (await getStorefrontCategoryTree()).find(
    (category) => category.slug === rootSlug,
  );

  if (!rootCategory?.children?.length) {
    return getStaticCategoryStaticParams(rootSlug);
  }

  return flattenCategories(rootCategory.children).map((category) => ({
    slug: category.path.slice(1),
  }));
}

export function isDatabaseCatalogEnabled() {
  return process.env.USE_DATABASE_CATALOG === "true";
}

async function getDatabaseCategoryTreeIfEnabled() {
  if (!isDatabaseCatalogEnabled()) {
    return [];
  }

  try {
    const categories = await getDatabaseCategories();

    return hasAllRootCategories(categories) ? categories : [];
  } catch (error) {
    console.error("Database category catalog query failed:", error);
    return [];
  }
}

function hasAllRootCategories(categories: Category[]) {
  const rootSlugs = new Set(categories.map((category) => category.slug));

  return rootCategorySlugs.every((slug) => rootSlugs.has(slug));
}

function arePathsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function buildFeaturedNavigation(categories: Category[]): NavItem[] {
  const rootCategoriesBySlug = new Map(
    categories
      .filter((category) => category.depth === 0)
      .map((category) => [category.slug, category]),
  );

  return rootCategorySlugs
    .map((rootSlug) => rootCategoriesBySlug.get(rootSlug))
    .filter((category): category is Category => Boolean(category))
    .filter((category) => {
      if (!category.isActive || !standardRootCategorySlugs.has(category.slug)) {
        return false;
      }

      return category.featured || hasFeaturedDescendant(category);
    })
    .map((category) => ({
      label: category.label.toUpperCase(),
      href: buildCategoryHref(category),
      menuKey: category.slug,
      children: buildFeaturedNavigationChildren(category.children ?? []),
    }))
    .map((item) => (item.children?.length ? item : { ...item, children: undefined }));
}

function buildFeaturedNavigationChildren(categories: Category[]): NavItem[] {
  return categories.flatMap((category) => {
    if (!category.isActive) {
      return [];
    }

    const children = buildFeaturedNavigationChildren(category.children ?? []);

    if (!category.featured) {
      return children;
    }

    const item: NavItem = {
      label: category.label,
      href: buildCategoryHref(category),
    };

    if (children.length) {
      item.children = children;
    }

    return [item];
  });
}

function hasFeaturedDescendant(category: Category): boolean {
  return Boolean(
    category.children?.some(
      (child) =>
        child.isActive && (child.featured || hasFeaturedDescendant(child)),
    ),
  );
}
