"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/product/price";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { cn } from "@/lib/utils";
import type { SearchProduct } from "@/lib/product-search";

export function ProductSearchResults({
  className,
  id,
  onNavigate,
  query,
  results,
}: {
  className?: string;
  id?: string;
  onNavigate: () => void;
  query: string;
  results: SearchProduct[];
}) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

  return (
    <div
      id={id}
      className={cn(
        "max-h-[60vh] overflow-y-auto rounded-lg border border-black/10 bg-white",
        className,
      )}
    >
      {results.length ? (
        <div className="divide-y divide-zinc-100">
          {results.map((product) => (
            <SearchResultRow
              key={product.id}
              product={product}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <p className="px-3 py-4 text-sm text-zinc-500">
          No products found for &quot;{trimmedQuery}&quot;.
        </p>
      )}
    </div>
  );
}

function SearchResultRow({
  product,
  onNavigate,
}: {
  product: SearchProduct;
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
