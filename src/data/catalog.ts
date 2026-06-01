import productData from "./products.json";
import {
  categoryTaxonomy,
  findCategoryByPath,
  getCategoryFilterOptions,
  type CategoryNode,
  type RootCategorySlug,
} from "@/data/category-taxonomy";
import {
  parseListingFilters,
  priceRangeOptions,
} from "@/lib/catalog-filters";
import type {
  ListingFilters,
  ListingSearchParams,
  ProductListingFacets,
} from "@/types/listing";
import type { Product } from "@/types/product";

export const products = productData as Product[];

export type CategoryListingData = {
  category: CategoryNode;
  products: Product[];
  filters: ListingFilters;
  facets: ProductListingFacets;
  basePath: string;
};

const productsListingCategory: CategoryNode = {
  label: "Products",
  slug: "products",
  path: [],
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
  const category = findCategoryByPath(categoryPath);

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
  if (product.categoryPath?.length) {
    return product.categoryPath;
  }

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

function getProductListingFacets(
  baseProducts: Product[],
  category: CategoryNode,
): ProductListingFacets {
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

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
