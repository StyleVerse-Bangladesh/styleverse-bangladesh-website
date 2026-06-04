import productData from "./products.json";
import {
  categoryTaxonomy,
  getAllCategories,
  getCategoryById,
  getCategoryByPath,
  type CategoryNode,
  type RootCategorySlug,
} from "@/data/category-taxonomy";
import {
  parseListingFilters,
  priceRangeOptions,
} from "@/lib/catalog-filters";
import { inventoryStatuses } from "@/lib/inventory";
import type {
  ListingFilters,
  ListingSearchParams,
  ProductListingFacets,
} from "@/types/listing";
import type { Product } from "@/types/product";

const staticProducts = productData as Product[];
const staticCategories = getAllCategories();

validateStaticProductCategories(staticProducts);
validateStaticProductInventory(staticProducts);

export const products = staticProducts;

export type CategoryListingData = {
  category: CategoryNode;
  products: Product[];
  filters: ListingFilters;
  facets: ProductListingFacets;
  basePath: string;
};

const productsListingCategory: CategoryNode = {
  id: "cat-products",
  parentId: null,
  label: "Products",
  slug: "products",
  path: [],
  rootSlug: "products",
  depth: 0,
  sortOrder: 0,
  isActive: true,
  showInNav: false,
  showInFilter: true,
  children: categoryTaxonomy,
};

export function getProductBySlug(slug: string) {
  return getProductBySlugFromProducts(products, slug);
}

export function getProductsByPath(path: string) {
  return getProductsByCategoryPath([path]);
}

export function getProductsByCategoryPath(path: string[]) {
  return getProductsByCategoryPathFromCatalog(products, staticCategories, path);
}

export function getCategoryListingData({
  rootSlug,
  slug = [],
  searchParams,
}: {
  rootSlug: RootCategorySlug;
  slug?: string[];
  searchParams?: ListingSearchParams;
}): CategoryListingData | null {
  return getCategoryListingDataFromCatalog({
    categories: staticCategories,
    products,
    rootSlug,
    searchParams,
    slug,
  });
}

export function getProductsListingData({
  searchParams,
}: {
  searchParams?: ListingSearchParams;
}) {
  return getProductsListingDataFromCatalog({
    categories: staticCategories,
    products,
    searchParams,
  });
}

export function getProductBySlugFromProducts(
  productsToSearch: Product[],
  slug: string,
) {
  return productsToSearch.find((product) => product.slug === slug);
}

export function getProductsByCategoryPathFromCatalog(
  productsToFilter: Product[],
  categories: CategoryNode[],
  path: string[],
) {
  return productsToFilter.filter((product) =>
    startsWithPath(getProductCategoryPath(product, categories), path),
  );
}

export function getCategoryListingDataFromCatalog({
  categories,
  products: catalogProducts,
  rootSlug,
  slug = [],
  searchParams,
}: {
  categories: CategoryNode[];
  products: Product[];
  rootSlug: RootCategorySlug;
  slug?: string[];
  searchParams?: ListingSearchParams;
}): CategoryListingData | null {
  const categoryPath = [rootSlug, ...slug];
  const category = getCategoryByPathFromCatalog(categories, categoryPath);

  if (!category) {
    return null;
  }

  const baseProducts = getProductsByCategoryPathFromCatalog(
    catalogProducts,
    categories,
    category.path,
  );
  const filters = parseListingFilters(searchParams);
  const facets = getProductListingFacets(baseProducts, category, categories);
  const productsForListing = sortProducts(
    filterProducts(baseProducts, filters, category, categories),
    filters,
  );

  return {
    category,
    products: productsForListing,
    filters,
    facets,
    basePath: `/${category.path.join("/")}`,
  };
}

export function getProductsListingDataFromCatalog({
  categories,
  products: catalogProducts,
  searchParams,
}: {
  categories: CategoryNode[];
  products: Product[];
  searchParams?: ListingSearchParams;
}) {
  const filters = parseListingFilters(searchParams);
  const productsCategory = {
    ...productsListingCategory,
    children: getRootCategoriesFromCatalog(categories),
  };
  const facets = getProductListingFacets(
    catalogProducts,
    productsCategory,
    categories,
  );
  const productsForListing = sortProducts(
    filterProducts(catalogProducts, filters, productsCategory, categories),
    filters,
  );

  return {
    products: productsForListing,
    filters,
    facets,
    basePath: "/products",
  };
}

export function getProductCategoryPath(
  product: Product,
  categories: CategoryNode[] = staticCategories,
) {
  const primaryCategory = product.primaryCategoryId
    ? getCategoryByIdFromCatalog(categories, product.primaryCategoryId)
    : undefined;

  if (primaryCategory) {
    return primaryCategory.path;
  }

  // Static products keep categoryPath for compatibility while the catalog
  // migrates. Future admin/BMS products should store primaryCategoryId and
  // optional categoryIds; categoryPath can be derived or cached from taxonomy.
  if (product.categoryPath?.length) {
    return product.categoryPath;
  }

  // Legacy fallback for older product records that only have category strings.
  const rootSlug = product.department ?? product.gender;

  if (rootSlug === "unisex") {
    return [slugify(product.category)];
  }

  return [
    rootSlug,
    product.categorySlug ?? slugify(product.category),
    product.subcategorySlug,
  ].filter(Boolean) as string[];
}

export function getProductPrimaryCategory(product: Product) {
  return getProductPrimaryCategoryFromCatalog(product, staticCategories);
}

export function getProductPrimaryCategoryFromCatalog(
  product: Product,
  categories: CategoryNode[],
) {
  const primaryCategory = product.primaryCategoryId
    ? getCategoryByIdFromCatalog(categories, product.primaryCategoryId)
    : undefined;

  if (primaryCategory) {
    return primaryCategory;
  }

  return getDeepestCategoryByPath(
    getProductCategoryPath(product, categories),
    categories,
  );
}

export function getCategoryPathNodesFromCatalog(
  category: CategoryNode,
  categories: CategoryNode[],
) {
  return category.path
    .map((_, index) =>
      getCategoryByPathFromCatalog(categories, category.path.slice(0, index + 1)),
    )
    .filter((item): item is CategoryNode => Boolean(item));
}

function getProductListingFacets(
  baseProducts: Product[],
  category: CategoryNode,
  categories: CategoryNode[],
): ProductListingFacets {
  // CATEGORY filter options come from taxonomy children; static product paths
  // only decide disabled state until products migrate to category IDs.
  const categoryOptions = getCategoryFilterOptionsFromCatalog(category, categories);
  const categoryFilterIndex = category.path.length;

  return {
    colors: getColorOptions(baseProducts),
    sizes: getSizeOptions(baseProducts),
    categories: categoryOptions.map((option) => ({
      label: option.label,
      value: option.slug,
      disabled: !baseProducts.some(
        (product) =>
          getProductCategoryPath(product, categories)[categoryFilterIndex] ===
          option.slug,
      ),
    })),
    priceRanges: priceRangeOptions.map((option) => ({
      ...option,
      disabled: !baseProducts.some((product) =>
        isPriceInRange(product.price, option.min, option.max),
      ),
    })),
  };
}

function filterProducts(
  baseProducts: Product[],
  filters: ListingFilters,
  category: CategoryNode,
  categories: CategoryNode[],
) {
  const categoryFilterIndex = category.path.length;
  const selectedPriceRange = priceRangeOptions.find(
    (option) => option.value === filters.price,
  );

  return baseProducts.filter((product) => {
    const productPath = getProductCategoryPath(product, categories);
    const productColors = product.colors.map((color) => slugify(color.name));
    const productSizes = product.sizes.map(slugify);

    const matchesColor =
      !filters.color.length ||
      filters.color.some((color) => productColors.includes(color));
    const matchesSize =
      !filters.size.length ||
      filters.size.some((size) => productSizes.includes(size));
    const matchesCategory =
      !filters.category.length ||
      filters.category.includes(productPath[categoryFilterIndex]);
    const matchesPrice =
      !selectedPriceRange ||
      isPriceInRange(
        product.price,
        selectedPriceRange.min,
        selectedPriceRange.max,
      );

    return matchesColor && matchesSize && matchesCategory && matchesPrice;
  });
}

function sortProducts(productsToSort: Product[], filters: ListingFilters) {
  if (filters.sort === "default") {
    return productsToSort;
  }

  return [...productsToSort].sort((left, right) => {
    if (filters.sort === "price-asc") {
      return left.price - right.price;
    }

    return right.price - left.price;
  });
}

function getColorOptions(baseProducts: Product[]) {
  const colorMap = new Map<string, { label: string; colorValue: string }>();

  for (const product of baseProducts) {
    for (const color of product.colors) {
      colorMap.set(slugify(color.name), {
        label: color.name,
        colorValue: color.value,
      });
    }
  }

  return Array.from(colorMap, ([value, option]) => ({
    value,
    label: option.label,
    colorValue: option.colorValue,
  })).sort((left, right) => left.label.localeCompare(right.label));
}

function getSizeOptions(baseProducts: Product[]) {
  const sizeMap = new Map<string, string>();

  for (const product of baseProducts) {
    for (const size of product.sizes) {
      sizeMap.set(slugify(size), size);
    }
  }

  return Array.from(sizeMap, ([value, label]) => ({ value, label }));
}

function startsWithPath(productPath: string[], path: string[]) {
  return path.every((item, index) => productPath[index] === item);
}

function isPriceInRange(price: number, min: number, max: number) {
  return price >= min && price <= max;
}

function getRootCategoriesFromCatalog(categories: CategoryNode[]) {
  return categories
    .filter((category) => category.depth === 0)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function getCategoryFilterOptionsFromCatalog(
  category: CategoryNode,
  categories: CategoryNode[],
) {
  return categories
    .filter((item) => item.parentId === category.id)
    .filter((item) => item.isActive && item.showInFilter)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function getCategoryByIdFromCatalog(categories: CategoryNode[], id: string) {
  return categories.find((item) => item.id === id);
}

function getCategoryByPathFromCatalog(categories: CategoryNode[], path: string[]) {
  return categories.find((item) => arePathsEqual(item.path, path));
}

function getDeepestCategoryByPath(path: string[], categories: CategoryNode[]) {
  for (let length = path.length; length > 0; length -= 1) {
    const category = getCategoryByPathFromCatalog(categories, path.slice(0, length));

    if (category) {
      return category;
    }
  }

  return undefined;
}

function validateStaticProductCategories(productsToValidate: Product[]) {
  const errors: string[] = [];

  for (const product of productsToValidate) {
    const path = product.categoryPath ?? [];
    const primaryCategory = product.primaryCategoryId
      ? getCategoryById(product.primaryCategoryId)
      : undefined;
    const pathCategory = path.length ? getCategoryByPath(path) : undefined;

    if (!product.primaryCategoryId) {
      errors.push(`${product.id} (${product.slug}) is missing primaryCategoryId`);
    } else if (!primaryCategory) {
      errors.push(
        `${product.id} (${product.slug}) primaryCategoryId "${product.primaryCategoryId}" does not exist`,
      );
    }

    if (!path.length) {
      errors.push(`${product.id} (${product.slug}) is missing categoryPath`);
    } else if (!pathCategory) {
      errors.push(
        `${product.id} (${product.slug}) categoryPath "${path.join("/")}" does not resolve`,
      );
    }

    if (
      primaryCategory &&
      pathCategory &&
      primaryCategory.id !== pathCategory.id
    ) {
      errors.push(
        `${product.id} (${product.slug}) primaryCategoryId "${primaryCategory.id}" does not match categoryPath "${path.join("/")}"`,
      );
    }
  }

  if (errors.length) {
    throw new Error(
      `Invalid static product category data:\n- ${errors.join("\n- ")}`,
    );
  }
}

function validateStaticProductInventory(productsToValidate: Product[]) {
  const errors: string[] = [];

  for (const product of productsToValidate) {
    const variantKeys = new Set<string>();

    for (const variant of product.variants) {
      const variantLabel = `${product.id} (${product.slug}) variant ${variant.id}`;
      const variantKey = `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`;

      if (variantKeys.has(variantKey)) {
        errors.push(
          `${variantLabel} duplicates color/size "${variant.color} / ${variant.size}"`,
        );
      }

      variantKeys.add(variantKey);

      if (variant.stock < 0) {
        errors.push(`${variantLabel} stock cannot be negative`);
      }

      if (
        variant.status &&
        !inventoryStatuses.includes(variant.status)
      ) {
        errors.push(`${variantLabel} status "${variant.status}" is invalid`);
      }

      if (
        variant.preorder?.limit !== undefined &&
        variant.preorder.limit <= 0
      ) {
        errors.push(`${variantLabel} preorder limit must be positive`);
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `Invalid static product inventory data:\n- ${errors.join("\n- ")}`,
    );
  }
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function arePathsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}
