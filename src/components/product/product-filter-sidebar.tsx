"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getActiveFilterCount,
  getEmptyListingFilters,
  getFilteredListingHref,
} from "@/lib/catalog-filters";
import { cn } from "@/lib/utils";
import type {
  FilterOption,
  ListingFilters,
  ProductListingFacets,
} from "@/types/listing";

type ProductFilterSidebarProps = {
  filters: ListingFilters;
  facets: ProductListingFacets;
};

type FilterSectionProps = {
  title: string;
  emptyLabel: string;
  isEmpty: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
};

export function ProductFilterSidebar({
  filters,
  facets,
}: ProductFilterSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilterCount = getActiveFilterCount(filters);

  function updateFilters(nextFilters: ListingFilters) {
    router.push(
      getFilteredListingHref(pathname, searchParams, nextFilters),
      { scroll: false },
    );
  }

  function toggleMultiFilter(
    key: "color" | "size" | "category",
    value: string,
  ) {
    updateFilters({
      ...filters,
      [key]: toggleValue(filters[key], value),
    });
  }

  return (
    <aside
      className="hidden min-w-0 md:block"
      aria-label="Product filters"
    >
      <div className="sticky top-4">
        <div className="mb-5 flex min-h-8 items-start justify-between gap-3 border-b border-zinc-300">
          <h2 className="border-b-2 border-black pb-2 text-sm font-bold uppercase tracking-[0.08em] text-black">
            Filter By
          </h2>
          {activeFilterCount ? (
            <button
              type="button"
              className="pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-black"
              onClick={() => updateFilters(getEmptyListingFilters())}
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="grid gap-6">
          <FilterSection
            title="COLOR"
            emptyLabel="No colors available."
            isEmpty={!facets.colors.length}
            scrollable
          >
            {facets.colors.map((option) => (
              <FilterCheckbox
                key={option.value}
                option={option}
                checked={filters.color.includes(option.value)}
                onChange={() => toggleMultiFilter("color", option.value)}
                showColorDot
              />
            ))}
          </FilterSection>

          <FilterSection
            title="PRICE"
            emptyLabel="No price ranges available."
            isEmpty={!facets.priceRanges.length}
          >
            {facets.priceRanges.map((option) => (
              <FilterCheckbox
                key={option.value}
                option={option}
                checked={filters.price === option.value}
                onChange={() =>
                  updateFilters({
                    ...filters,
                    price:
                      filters.price === option.value
                        ? undefined
                        : option.value,
                  })
                }
              />
            ))}
          </FilterSection>

          <FilterSection
            title="SIZE"
            emptyLabel="No sizes available."
            isEmpty={!facets.sizes.length}
          >
            {facets.sizes.map((option) => (
              <FilterCheckbox
                key={option.value}
                option={option}
                checked={filters.size.includes(option.value)}
                onChange={() => toggleMultiFilter("size", option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection
            title="CATEGORY"
            emptyLabel="No category filters."
            isEmpty={!facets.categories.length}
          >
            {facets.categories.map((option) => (
              <FilterCheckbox
                key={option.value}
                option={option}
                checked={filters.category.includes(option.value)}
                onChange={() => toggleMultiFilter("category", option.value)}
              />
            ))}
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  emptyLabel,
  isEmpty,
  scrollable,
  children,
}: FilterSectionProps) {
  return (
    <section className="min-w-0">
      <h3 className="mb-2 border-b border-zinc-300 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700">
        <span className="inline-block border-b border-zinc-500 pb-2 -mb-[9px]">
          {title}
        </span>
      </h3>
      {isEmpty ? (
        <p className="py-1 text-xs leading-5 text-zinc-400">{emptyLabel}</p>
      ) : (
        <div
          className={cn(
            "grid gap-0.5",
            scrollable &&
              "max-h-52 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#a1a1aa_transparent] [scrollbar-width:thin]",
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

function FilterCheckbox({
  option,
  checked,
  onChange,
  showColorDot,
}: {
  option: FilterOption;
  checked: boolean;
  onChange: () => void;
  showColorDot?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex min-h-7 cursor-pointer items-center gap-2 py-0.5 text-xs leading-5 text-zinc-700 transition-colors hover:text-black",
        option.disabled && "cursor-not-allowed text-zinc-400",
      )}
    >
      <input
        type="checkbox"
        className="h-3.5 w-3.5 shrink-0 accent-black"
        checked={checked}
        disabled={option.disabled}
        onChange={onChange}
      />
      {showColorDot && option.colorValue ? (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/15"
          style={{ backgroundColor: option.colorValue }}
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0">{option.label}</span>
    </label>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
