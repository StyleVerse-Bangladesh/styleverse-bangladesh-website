import {
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

export async function getStorefrontCategoryTree(): Promise<Category[]> {
  const databaseCategories = await getDatabaseCategoryTreeIfEnabled();

  return databaseCategories.length ? databaseCategories : getStaticRootCategories();
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
