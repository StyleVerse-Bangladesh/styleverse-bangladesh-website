"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart } from "lucide-react";
import { getProductAvailability } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import { useFlyToCartAnimation } from "@/hooks/use-fly-to-cart-animation";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types/product";

export type HomeProductCardProduct = {
  id?: string;
  wishlistId?: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  href: string;
  rating?: number;
  reviewCount?: number;
};

type HomeProductCardProps = {
  product: HomeProductCardProduct;
  cartProduct?: Product;
  className?: string;
  imageSizes: string;
  draggable?: boolean;
  onProductClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function getDiscountPercent(product: HomeProductCardProduct) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return null;
  }

  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

function formatPrice(price: number) {
  return `TK. ${price}`;
}

function formatReviews(reviewCount = 0) {
  return reviewCount === 1 ? "1 Review" : `${reviewCount} Reviews`;
}

export function HomeProductCard({
  product,
  cartProduct,
  className,
  imageSizes,
  draggable = false,
  onProductClick,
}: HomeProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { flyToCart } = useFlyToCartAnimation();
  const discountPercent = getDiscountPercent(product);
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const wishlistProductId = product.wishlistId ?? product.id;
  const productAvailability = cartProduct
    ? getProductAvailability(cartProduct)
    : undefined;
  const firstAvailableVariant = productAvailability?.variant;
  const canAddToCart =
    Boolean(cartProduct) &&
    Boolean(productAvailability?.purchasable);
  const [showAddedState, setShowAddedState] = useState(false);
  const addedStateTimerRef = useRef<number | null>(null);
  const isWishlisted = useWishlistStore((state) =>
    wishlistProductId ? state.isWishlisted(wishlistProductId) : false,
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  useEffect(() => {
    return () => {
      if (addedStateTimerRef.current !== null) {
        window.clearTimeout(addedStateTimerRef.current);
      }
    };
  }, []);

  function handleWishlistClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (wishlistProductId) {
      toggleWishlist(wishlistProductId);
    }
  }

  function handleAddToCartClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!cartProduct || !canAddToCart) {
      return;
    }

    addItem(cartProduct, firstAvailableVariant?.id);
    flyToCart({
      imageSrc: product.image,
      sourceElement: event.currentTarget,
    });
    setShowAddedState(true);

    if (addedStateTimerRef.current !== null) {
      window.clearTimeout(addedStateTimerRef.current);
    }

    addedStateTimerRef.current = window.setTimeout(() => {
      setShowAddedState(false);
      addedStateTimerRef.current = null;
    }, 800);
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-md bg-white shadow-lg shadow-black/10 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 active:shadow-xl active:shadow-black/15",
        className,
      )}
    >
      <Link
        href={product.href}
        aria-label={product.name}
        className="absolute inset-0 z-10"
        draggable={draggable}
        onClick={onProductClick}
      />
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          draggable={draggable}
          className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.04] group-active:scale-[1.03]"
          sizes={imageSizes}
        />
        {discountPercent ? (
          <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-1 text-[11px] font-extrabold leading-none text-white shadow-md shadow-red-950/20">
            {discountPercent}% OFF
          </span>
        ) : null}
        <span className="absolute bottom-3 left-3 bg-white/85 px-2 py-1 text-xs font-medium text-black shadow-sm backdrop-blur-sm">
          {rating.toFixed(1)} <span aria-hidden="true">{"\u2605"}</span> |{" "}
          {formatReviews(reviewCount)}
        </span>
      </div>

      <div className="p-3 md:p-4">
        <h3 className="truncate text-sm font-semibold text-zinc-600 transition-colors group-hover:text-black">
          {product.name}
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-base font-extrabold text-zinc-900 md:text-lg">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-xs font-semibold text-red-600 line-through decoration-red-600 decoration-1 md:text-sm">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <div className="relative z-20 mt-5 flex justify-center">
          <button
            type="button"
            className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-black bg-black px-4 text-xs font-medium text-white shadow-md shadow-black/10 transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-zinc-800 active:scale-[0.98] md:h-10 md:w-auto md:min-w-36 md:text-sm"
            disabled={!canAddToCart}
            onClick={handleAddToCartClick}
            aria-label={`Add ${product.name} to cart`}
          >
            {showAddedState ? (
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Added
              </span>
            ) : (
              (productAvailability?.buttonLabel ?? "Out of Stock")
            )}
          </button>
        </div>
      </div>
      {wishlistProductId ? (
        <button
          type="button"
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-black shadow-sm shadow-black/10 backdrop-blur-sm transition-[transform,background-color] duration-200 ease-out hover:scale-105 hover:bg-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          onClick={handleWishlistClick}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
        >
          <Heart
            aria-hidden="true"
            className={cn(
              "h-4 w-4 transition-[transform,color,fill] duration-200 ease-out",
              isWishlisted && "scale-110 fill-black text-black",
            )}
          />
        </button>
      ) : null}
    </article>
  );
}
