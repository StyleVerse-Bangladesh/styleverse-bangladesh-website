import productData from "./products.json";
import {
  categoryTaxonomy,
  getCategoryById,
  getCategoryByPath,
  getCategoryFilterOptions,
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
  return products.find((product) => product.slug === slug);
}

export function getProductsByPath(path: string) {
  return getProductsByCategoryPath([path]);
}

export function getProductsByCategoryPath(path: string[]) {
  return products.filter((product) =>
    startsWithPath(getProductCategoryPath(product), path),
  );
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
  const categoryPath = [rootSlug, ...slug];
  const category = getCategoryByPath(categoryPath);

  if (!category) {
    return null;
  }

  const baseProducts = getProductsByCategoryPath(category.path);
  const filters = parseListingFilters(searchParams);
  const facets = getProductListingFacets(baseProducts, category);
  const productsForListing = sortProducts(
    filterProducts(baseProducts, filters, category),
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

export function getProductsListingData({
  searchParams,
}: {
  searchParams?: ListingSearchParams;
}) {
  const filters = parseListingFilters(searchParams);
  const facets = getProductListingFacets(products, productsListingCategory);
  const productsForListing = sortProducts(
    filterProducts(products, filters, productsListingCategory),
    filters,
  );

  return {
    products: productsForListing,
    filters,
    facets,
    basePath: "/products",
  };
}

export function getProductCategoryPath(product: Product) {
  const primaryCategory = product.primaryCategoryId
    ? getCategoryById(product.primaryCategoryId)
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
  const primaryCategory = product.primaryCategoryId
    ? getCategoryById(product.primaryCategoryId)
    : undefined;

  if (primaryCategory) {
    return primaryCategory;
  }

  return getDeepestCategoryByPath(getProductCategoryPath(product));
}

function getProductListingFacets(
  baseProducts: Product[],
  category: CategoryNode,
): ProductListingFacets {
  // CATEGORY filter options come from taxonomy children; static product paths
  // only decide disabled state until products migrate to category IDs.
  const categoryOptions = getCategoryFilterOptions(category);
  const categoryFilterIndex = category.path.length;

  return {
    colors: getColorOptions(baseProducts),
    sizes: getSizeOptions(baseProducts),
    categories: categoryOptions.map((option) => ({
      label: option.label,
      value: option.slug,
      disabled: !baseProducts.some(
        (product) =>
          getProductCategoryPath(product)[categoryFilterIndex] === option.slug,
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
) {
  const categoryFilterIndex = category.path.length;
  const selectedPriceRange = priceRangeOptions.find(
    (option) => option.value === filters.price,
  );

  return baseProducts.filter((product) => {
    const productPath = getProductCategoryPath(product);
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

function getDeepestCategoryByPath(path: string[]) {
  for (let length = path.length; length > 0; length -= 1) {
    const category = getCategoryByPath(path.slice(0, length));

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
