"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Price } from "@/components/product/price";
import { Input } from "@/components/ui/input";
import { products } from "@/data/catalog";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { Product } from "@/types/product";

const maxResults = 6;

export function MobileSearchDropdown() {
  const pathname = usePathname();
  const open = useUiStore((state) => state.isMobileSearchDropdownOpen);
  const setOpen = useUiStore((state) => state.setMobileSearchDropdownOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const headerOffsetClassName = pathname === "/" ? "top-[72px]" : "top-16";

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return products
      .filter((product) => productMatchesQuery(product, normalizedQuery))
      .slice(0, maxResults);
  }, [normalizedQuery]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false);
      }
    }

    if (mediaQuery.matches) {
      setOpen(false);
    }

    mediaQuery.addEventListener("change", closeOnDesktop);

    return () => mediaQuery.removeEventListener("change", closeOnDesktop);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, setOpen]);

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  if (!open) {
    return null;
  }

  return (
    <section
      id="mobile-search-dropdown"
      className={cn(
        "fixed inset-x-0 z-[45] animate-in fade-in slide-in-from-top-2 duration-200 md:hidden",
        headerOffsetClassName,
      )}
      aria-label="Mobile product search"
    >
      <div className="border-b border-black/10 bg-white/90 shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-screen-sm px-3 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-full border-black/15 bg-white pl-10 pr-12 text-sm text-black shadow-sm placeholder:text-zinc-500 focus-visible:ring-black"
              placeholder="Search products"
              aria-label="Search products"
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              onClick={() => setOpen(false)}
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className={cn(
              "mt-3 max-h-[60vh] overflow-y-auto rounded-lg border border-black/10 bg-white",
              !normalizedQuery && "hidden",
            )}
          >
            {results.length ? (
              <div className="divide-y divide-zinc-100">
                {results.map((product) => (
                  <SearchResultRow
                    key={product.id}
                    product={product}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-3 py-4 text-sm text-zinc-500">
                No products found for &quot;{query.trim()}&quot;.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchResultRow({
  product,
  onNavigate,
}: {
  product: Product;
  onNavigate: () => void;
}) {
  const imageSrc = getImageUrl(
    product.images[0],
    defaultImagePlaceholders.product,
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 px-3 py-3 text-black transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
      onClick={onNavigate}
    >
      <span className="relative h-14 w-14 overflow-hidden rounded-md bg-zinc-100">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="56px"
          className="object-cover"
        />
      </span>

      <span className="min-w-0 self-center">
        <span className="block truncate text-sm font-semibold leading-5">
          {product.name}
        </span>
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          className="mt-0.5 text-xs text-black"
        />
      </span>
    </Link>
  );
}

function productMatchesQuery(product: Product, query: string) {
  const searchText = [
    product.name,
    product.category,
    product.subcategory,
    product.gender,
    product.department,
    ...product.colors.map((color) => color.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchText.includes(query);
}
