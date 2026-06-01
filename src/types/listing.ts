export type ListingSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type ProductSort = "default" | "price-asc" | "price-desc";

export type ListingFilters = {
  color: string[];
  size: string[];
  category: string[];
  price?: string;
  sort: ProductSort;
};

export type FilterOption = {
  label: string;
  value: string;
  disabled?: boolean;
  colorValue?: string;
};

export type PriceRangeOption = FilterOption & {
  min: number;
  max: number;
};

export type ProductListingFacets = {
  colors: FilterOption[];
  sizes: FilterOption[];
  categories: FilterOption[];
  priceRanges: PriceRangeOption[];
};
