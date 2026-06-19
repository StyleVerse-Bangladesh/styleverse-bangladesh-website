import type {
  ListingFilters,
  ListingSearchParams,
  ProductSort,
  PriceRangeOption,
} from "@/types/listing";

export const filterQueryKeys = ["color", "size", "category", "price"] as const;
export const sortQueryKey = "sort";

export type ListingSearchParamsReader = {
  get: (name: string) => string | null;
  toString: () => string;
};

export const productSortOptions: {
  label: string;
  value: ProductSort;
}[] = [
  { label: "Default", value: "default" },
  { label: "Price Low to High", value: "price-asc" },
  { label: "Price High to Low", value: "price-desc" },
];

export const priceRangeOptions: PriceRangeOption[] = [
  { label: "100-300", value: "100-300", min: 100, max: 300 },
  { label: "301-500", value: "301-500", min: 301, max: 500 },
  { label: "501-1000", value: "501-1000", min: 501, max: 1000 },
  { label: "1001-2500", value: "1001-2500", min: 1001, max: 2500 },
  { label: "2501-5000", value: "2501-5000", min: 2501, max: 5000 },
];

export function getEmptyListingFilters(): ListingFilters {
  return {
    color: [],
    size: [],
    category: [],
    sort: "default",
  };
}

export function parseListingFilters(
  searchParams?: ListingSearchParams,
): ListingFilters {
  return {
    color: parseMultiValue(searchParams?.color),
    size: parseMultiValue(searchParams?.size),
    category: parseMultiValue(searchParams?.category),
    price: parseSingleValue(searchParams?.price),
    sort: parseProductSort(searchParams?.sort),
  };
}

export function getActiveFilterCount(filters: ListingFilters) {
  return (
    filters.color.length +
    filters.size.length +
    filters.category.length +
    (filters.price ? 1 : 0)
  );
}

export function serializeFilterValue(values: string[]) {
  return values.length ? values.join(",") : undefined;
}

export function readListingFiltersFromSearchParams(
  searchParams: ListingSearchParamsReader,
): ListingFilters {
  const params: ListingSearchParams = {};

  for (const key of filterQueryKeys) {
    params[key] = searchParams.get(key) ?? undefined;
  }

  params[sortQueryKey] = searchParams.get(sortQueryKey) ?? undefined;

  return parseListingFilters(params);
}

export function getFilteredListingHref(
  pathname: string,
  searchParams: ListingSearchParamsReader,
  filters: ListingFilters,
) {
  const nextParams = new URLSearchParams(searchParams.toString());

  for (const key of filterQueryKeys) {
    nextParams.delete(key);
  }

  const color = serializeFilterValue(filters.color);
  const size = serializeFilterValue(filters.size);
  const category = serializeFilterValue(filters.category);

  if (color) {
    nextParams.set("color", color);
  }

  if (size) {
    nextParams.set("size", size);
  }

  if (category) {
    nextParams.set("category", category);
  }

  if (filters.price) {
    nextParams.set("price", filters.price);
  }

  const queryString = nextParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

function parseMultiValue(value: string | string[] | undefined) {
  const rawValue = parseSingleValue(value);

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseProductSort(value: string | string[] | undefined): ProductSort {
  const sort = parseSingleValue(value);

  return productSortOptions.some((option) => option.value === sort)
    ? (sort as ProductSort)
    : "default";
}
