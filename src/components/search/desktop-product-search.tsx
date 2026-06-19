"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ProductSearchResults } from "@/components/search/product-search-results";
import { Input } from "@/components/ui/input";
import {
  getProductSearchResults,
  type SearchProduct,
} from "@/lib/product-search";
import { cn } from "@/lib/utils";

type DesktopProductSearchProps = {
  ariaLabel: string;
  containerClassName: string;
  iconClassName: string;
  inputClassName: string;
  placeholder: string;
  products: SearchProduct[];
  resultsClassName: string;
  resultsId: string;
};

export function DesktopProductSearch({
  ariaLabel,
  containerClassName,
  iconClassName,
  inputClassName,
  placeholder,
  products,
  resultsClassName,
  resultsId,
}: DesktopProductSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(
    () => getProductSearchResults(products, query),
    [products, query],
  );

  function closeSearch({ clear = false } = {}) {
    setOpen(false);

    if (clear) {
      setQuery("");
    }
  }

  function openFirstResult() {
    const firstResult = results[0];

    if (!firstResult) {
      return;
    }

    router.push(`/products/${firstResult.slug}`);
  }

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeSearch();
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    closeSearch({ clear: true });
  }, [pathname]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(Boolean(event.target.value.trim()));
        }}
        onFocus={() => setOpen(Boolean(query.trim()))}
        onClick={() => setOpen(Boolean(query.trim()))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && results.length) {
            event.preventDefault();
            openFirstResult();
          }
        }}
        className={inputClassName}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-expanded={open && Boolean(query.trim())}
        aria-controls={resultsId}
      />
      <Search className={iconClassName} />

      {open ? (
        <ProductSearchResults
          className={resultsClassName}
          id={resultsId}
          onNavigate={() => closeSearch({ clear: true })}
          query={query}
          results={results}
        />
      ) : null}
    </div>
  );
}

export function CompactDesktopSearch({
  products,
}: {
  products: SearchProduct[];
}) {
  return (
    <DesktopProductSearch
      ariaLabel="Search for products"
      containerClassName="relative hidden w-52 shrink-0 lg:block xl:w-60"
      iconClassName="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-black/70"
      inputClassName={cn(
        "h-9 min-h-0 rounded-none border-0 border-b border-black/35 bg-transparent px-0 pr-7 text-xs shadow-none placeholder:text-zinc-500",
        "focus-visible:border-black focus-visible:ring-0",
      )}
      placeholder="Search for products..."
      products={products}
      resultsClassName="absolute right-0 top-full z-[60] mt-2 w-[min(22rem,calc(100vw-2rem))] shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
      resultsId="desktop-header-search-results"
    />
  );
}
