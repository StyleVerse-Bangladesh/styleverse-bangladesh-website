"use client";

import { useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getActiveFilterCount,
  productSortOptions,
  sortQueryKey,
} from "@/lib/catalog-filters";
import type { ListingFilters, ProductListingFacets } from "@/types/listing";
import { cn } from "@/lib/utils";
import { ProductFilterDrawer } from "./product-filter-drawer";

type ProductListingToolbarProps = {
  className?: string;
  filters?: ListingFilters;
  facets?: ProductListingFacets;
  basePath?: string;
};

export function ProductListingToolbar({
  className,
  filters,
  facets,
  basePath,
}: ProductListingToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const activeFilterCount = filters ? getActiveFilterCount(filters) : 0;
  const currentSort = filters?.sort ?? "default";
  const currentSortLabel =
    productSortOptions.find((option) => option.value === currentSort)?.label ??
    "Default";

  function applySort(sort: ListingFilters["sort"]) {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set(sortQueryKey, sort);

    const queryString = nextParams.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    setSortOpen(false);
  }

  return (
    <>
      <div
        className={cn(
          "mb-4 grid min-w-0 grid-cols-2 gap-2 sm:mb-5 sm:max-w-sm",
          className,
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 w-full min-w-0 rounded-md border-zinc-200 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-black shadow-sm hover:bg-zinc-50 sm:h-10 sm:text-sm"
          disabled={!filters || !facets || !basePath}
          onClick={() => setFilterDrawerOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilterCount ? (
            <span className="ml-0.5 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 w-full min-w-0 rounded-md border-zinc-200 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-black shadow-sm sm:h-10 sm:text-sm"
          disabled={!filters}
          onClick={() => setSortOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={sortOpen}
        >
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
          <span className="truncate">{currentSortLabel}</span>
        </Button>
      </div>

      {filters && sortOpen ? (
        <div className="relative z-20 mb-4 w-full max-w-sm rounded-md border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/10">
          <div role="listbox" aria-label="Sort products" className="grid gap-1">
            {productSortOptions.map((option) => {
              const selected = option.value === currentSort;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between rounded px-3 text-left text-sm font-semibold transition-colors",
                    selected
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-zinc-100",
                  )}
                  onClick={() => applySort(option.value)}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <span className="text-xs uppercase tracking-wide">Active</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {filters && facets && basePath ? (
        <ProductFilterDrawer
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          filters={filters}
          facets={facets}
        />
      ) : null}
    </>
  );
}
