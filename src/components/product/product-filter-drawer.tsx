"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  filterQueryKeys,
  getActiveFilterCount,
  getEmptyListingFilters,
  parseListingFilters,
  serializeFilterValue,
} from "@/lib/catalog-filters";
import { cn } from "@/lib/utils";
import type {
  FilterOption,
  ListingFilters,
  ListingSearchParams,
  ProductListingFacets,
} from "@/types/listing";

type ProductFilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ListingFilters;
  facets: ProductListingFacets;
};

type FilterSectionProps = {
  title: string;
  emptyLabel: string;
  isEmpty: boolean;
  children: React.ReactNode;
};

type SearchParamsReader = {
  get: (name: string) => string | null;
  toString: () => string;
};

export function ProductFilterDrawer({
  open,
  onOpenChange,
  filters,
  facets,
}: ProductFilterDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftFilters, setDraftFilters] = useState(filters);
  const activeDraftCount = getActiveFilterCount(draftFilters);

  useEffect(() => {
    if (open) {
      setDraftFilters(readFiltersFromUrl(searchParams));
    }
  }, [open, searchParams]);

  function applyFilters() {
    router.push(getFilteredHref(pathname, searchParams, draftFilters), {
      scroll: false,
    });
    onOpenChange(false);
  }

  function clearFilters() {
    const emptyFilters = getEmptyListingFilters();

    setDraftFilters(emptyFilters);
    router.replace(getFilteredHref(pathname, searchParams, emptyFilters), {
      scroll: false,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="left-0 right-auto flex w-[min(23rem,92vw)] max-w-[92vw] flex-col overflow-hidden border-l-0 border-r border-zinc-200 bg-white p-0 pb-0 text-black shadow-[18px_0_44px_rgba(0,0,0,0.18)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden"
        aria-label="Product filters"
      >
        <SheetHeader className="border-b border-zinc-200 px-4 pb-4 pt-5 pr-16">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <SheetTitle className="text-base font-extrabold tracking-[0.16em] text-black">
              FILTER BY
            </SheetTitle>
            <button
              type="button"
              className="min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black disabled:text-zinc-300"
              disabled={!activeDraftCount}
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="grid gap-7">
            <FilterSection
              title="COLOR"
              emptyLabel="No colors available."
              isEmpty={!facets.colors.length}
            >
              <ChipWrap>
                {facets.colors.map((option) => (
                  <FilterChip
                    key={option.value}
                    option={option}
                    selected={draftFilters.color.includes(option.value)}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        color: toggleValue(current.color, option.value),
                      }))
                    }
                    showColorDot
                  />
                ))}
              </ChipWrap>
            </FilterSection>

            <FilterSection
              title="PRICE"
              emptyLabel="No price ranges available."
              isEmpty={!facets.priceRanges.length}
            >
              <ChipWrap>
                {facets.priceRanges.map((option) => (
                  <FilterChip
                    key={option.value}
                    option={option}
                    selected={draftFilters.price === option.value}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        price:
                          current.price === option.value
                            ? undefined
                            : option.value,
                      }))
                    }
                  />
                ))}
              </ChipWrap>
            </FilterSection>

            <FilterSection
              title="SIZE"
              emptyLabel="No sizes available."
              isEmpty={!facets.sizes.length}
            >
              <ChipWrap>
                {facets.sizes.map((option) => (
                  <FilterChip
                    key={option.value}
                    option={option}
                    selected={draftFilters.size.includes(option.value)}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        size: toggleValue(current.size, option.value),
                      }))
                    }
                  />
                ))}
              </ChipWrap>
            </FilterSection>

            <FilterSection
              title="CATEGORY"
              emptyLabel="No category filters."
              isEmpty={!facets.categories.length}
            >
              <ChipWrap>
                {facets.categories.map((option) => (
                  <FilterChip
                    key={option.value}
                    option={option}
                    selected={draftFilters.category.includes(option.value)}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        category: toggleValue(current.category, option.value),
                      }))
                    }
                  />
                ))}
              </ChipWrap>
            </FilterSection>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-white px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(0,0,0,0.08)]">
          <Button
            type="button"
            className="h-12 w-full rounded-md bg-black text-white hover:bg-zinc-800"
            onClick={applyFilters}
          >
            Apply Filters
            {activeDraftCount ? ` (${activeDraftCount})` : ""}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterSection({
  title,
  emptyLabel,
  isEmpty,
  children,
}: FilterSectionProps) {
  return (
    <section className="min-w-0">
      <h2 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h2>
      {isEmpty ? (
        <p className="text-sm leading-6 text-zinc-400">{emptyLabel}</p>
      ) : (
        children
      )}
    </section>
  );
}

function ChipWrap({ children }: { children: React.ReactNode }) {
  return <div className="flex min-w-0 flex-wrap gap-2">{children}</div>;
}

function FilterChip({
  option,
  selected,
  onClick,
  showColorDot,
}: {
  option: FilterOption;
  selected: boolean;
  onClick: () => void;
  showColorDot?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-11 max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        selected
          ? "border-black bg-black text-white shadow-sm"
          : "border-zinc-200 bg-white/90 text-zinc-800 shadow-[0_1px_0_rgba(0,0,0,0.03)] hover:border-zinc-400 hover:bg-zinc-50",
        option.disabled &&
          "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 shadow-none",
      )}
      disabled={option.disabled}
      aria-pressed={selected}
      onClick={onClick}
    >
      {showColorDot ? (
        <span
          className={cn(
            "h-3.5 w-3.5 shrink-0 rounded-full border",
            selected ? "border-white/60" : "border-zinc-300",
            option.disabled && "opacity-40 grayscale",
          )}
          style={{ backgroundColor: option.colorValue ?? "transparent" }}
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0 truncate">{option.label}</span>
    </button>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function readFiltersFromUrl(searchParams: SearchParamsReader): ListingFilters {
  const params: ListingSearchParams = {};

  for (const key of filterQueryKeys) {
    params[key] = searchParams.get(key) ?? undefined;
  }

  return parseListingFilters(params);
}

function getFilteredHref(
  pathname: string,
  searchParams: SearchParamsReader,
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
