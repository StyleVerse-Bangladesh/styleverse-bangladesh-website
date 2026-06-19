"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ProductSearchResults } from "@/components/search/product-search-results";
import { Input } from "@/components/ui/input";
import {
  getProductSearchResults,
  type SearchProduct,
} from "@/lib/product-search";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function MobileSearchDropdown({
  products,
}: {
  products: SearchProduct[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const open = useUiStore((state) => state.isMobileSearchDropdownOpen);
  const setOpen = useUiStore((state) => state.setMobileSearchDropdownOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const headerOffsetClassName = pathname === "/" ? "top-[72px]" : "top-16";

  const results = useMemo(() => {
    return getProductSearchResults(products, normalizedQuery);
  }, [normalizedQuery, products]);

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
              onKeyDown={(event) => {
                const firstResult = results[0];

                if (event.key === "Enter" && firstResult) {
                  event.preventDefault();
                  router.push(`/products/${firstResult.slug}`);
                  setOpen(false);
                }
              }}
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

          <ProductSearchResults
            className="mt-3"
            onNavigate={() => setOpen(false)}
            query={query}
            results={results}
          />
        </div>
      </div>
    </section>
  );
}
