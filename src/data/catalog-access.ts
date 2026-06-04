import {
  getCategoryListingDataFromCatalog,
  getProductBySlugFromProducts,
  getProductsListingDataFromCatalog,
  products as staticProducts,
  type CategoryListingData,
} from "@/data/catalog";
import {
  isDatabaseCatalogEnabled,
} from "@/data/category-access";
import {
  flattenCategories,
  getDatabaseCategories,
} from "@/data/category-db";
import { getDatabaseProducts } from "@/data/product-db";
import {
  getAllCategories as getStaticAllCategories,
  rootCategorySlugs,
  type RootCategorySlug,
} from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";
import type { Product } from "@/types/product";

export async function getStorefrontProducts(): Promise<Product[]> {
  const catalog = await getStorefrontCatalog();

  return catalog.products;
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await getStorefrontProducts();

  return getProductBySlugFromProducts(products, slug);
}

export async function getStorefrontProductStaticParams() {
  const products = isDatabaseCatalogEnabled()
    ? await getStorefrontProducts()
    : staticProducts;

  return products.map((product) => ({ slug: product.slug }));
}

export async function getProductsListingData({
  searchParams,
}: {
  searchParams?: ListingSearchParams;
}) {
  const catalog = await getStorefrontCatalog();

  return getProductsListingDataFromCatalog({
    categories: catalog.categories,
    products: catalog.products,
    searchParams,
  });
}

export async function getCategoryListingData({
  rootSlug,
  slug = [],
  searchParams,
}: {
  rootSlug: RootCategorySlug;
  slug?: string[];
  searchParams?: ListingSearchParams;
}): Promise<CategoryListingData | null> {
  const catalog = await getStorefrontCatalog();

  return getCategoryListingDataFromCatalog({
    categories: catalog.categories,
    products: catalog.products,
    rootSlug,
    searchParams,
    slug,
  });
}

async function getStorefrontCatalog() {
  if (!isDatabaseCatalogEnabled()) {
    return getStaticCatalog();
  }

  try {
    const categoryTree = await getDatabaseCategories();
    const categories = flattenCategories(categoryTree);
    const products = await getDatabaseProducts(categories);

    if (products.length && hasAllRootCategories(categoryTree)) {
      return {
        categories,
        products,
      };
    }
  } catch (error) {
    console.error("Database product catalog query failed:", error);
  }

  return getStaticCatalog();
}

function hasAllRootCategories(categoryTree: Awaited<ReturnType<typeof getDatabaseCategories>>) {
  const rootSlugs = new Set(categoryTree.map((category) => category.slug));

  return rootCategorySlugs.every((slug) => rootSlugs.has(slug));
}

function getStaticCatalog() {
  return {
    categories: getStaticAllCategories(),
    products: staticProducts,
  };
}
