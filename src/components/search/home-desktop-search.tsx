"use client";

import { DesktopProductSearch } from "@/components/search/desktop-product-search";
import type { SearchProduct } from "@/lib/product-search";

export function HomeDesktopSearch({
  products,
}: {
  products: SearchProduct[];
}) {
  return (
    <DesktopProductSearch
      ariaLabel="Search products by name"
      containerClassName="relative hidden w-full md:col-span-1 md:block"
      iconClassName="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black"
      inputClassName="h-10 rounded-full border-black bg-white px-4 pr-11 text-sm placeholder:text-zinc-600 focus-visible:ring-black"
      placeholder="Search Products By Name....."
      products={products}
      resultsClassName="absolute inset-x-0 top-full z-50 mt-2 shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
      resultsId="homepage-desktop-search-results"
    />
  );
}
