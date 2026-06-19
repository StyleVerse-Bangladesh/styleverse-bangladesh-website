import type { Product } from "@/types/product";

export const maxProductSearchResults = 6;

export type SearchProduct = Pick<
  Product,
  | "category"
  | "compareAtPrice"
  | "department"
  | "gender"
  | "id"
  | "images"
  | "name"
  | "price"
  | "slug"
  | "subcategory"
> & {
  colorNames: string[];
};

export function toSearchProduct(product: Product): SearchProduct {
  return {
    category: product.category,
    colorNames: product.colors.map((color) => color.name),
    compareAtPrice: product.compareAtPrice,
    department: product.department,
    gender: product.gender,
    id: product.id,
    images: product.images,
    name: product.name,
    price: product.price,
    slug: product.slug,
    subcategory: product.subcategory,
  };
}

export function getProductSearchResults(
  products: SearchProduct[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return products
    .map((product, index) => ({
      index,
      product,
      score: getProductSearchScore(product, normalizedQuery),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (left.score === right.score) {
        return left.index - right.index;
      }

      return right.score - left.score;
    })
    .map((result) => result.product)
    .slice(0, maxProductSearchResults);
}

function getProductSearchScore(product: SearchProduct, query: string) {
  const queryLength = query.length;
  const name = normalizeSearchValue(product.name);
  const category = normalizeSearchValue(product.category);
  const subcategory = normalizeSearchValue(product.subcategory);
  const metadata = [
    product.gender,
    product.department,
    ...product.colorNames,
  ].map(normalizeSearchValue);

  if (fieldStartsWith(name, query)) {
    return 1000;
  }

  if (wordStartsWith(name, query)) {
    return 900;
  }

  if (queryLength === 1) {
    return 0;
  }

  if (fieldContains(name, query)) {
    return 800;
  }

  if (
    fieldStartsWith(category, query) ||
    fieldStartsWith(subcategory, query)
  ) {
    return 600;
  }

  if (queryLength === 2) {
    return 0;
  }

  if (
    fieldContains(category, query) ||
    fieldContains(subcategory, query)
  ) {
    return 500;
  }

  if (metadata.some((value) => fieldContains(value, query))) {
    return 250;
  }

  return 0;
}

function normalizeSearchValue(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function fieldStartsWith(value: string, query: string) {
  return Boolean(value) && value.startsWith(query);
}

function wordStartsWith(value: string, query: string) {
  return getSearchWords(value).some((word) => word.startsWith(query));
}

function fieldContains(value: string, query: string) {
  return Boolean(value) && value.includes(query);
}

function getSearchWords(value: string) {
  return value.split(/[^a-z0-9]+/).filter(Boolean);
}
