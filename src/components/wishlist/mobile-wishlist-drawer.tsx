"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { products } from "@/data/catalog";
import { useFlyToCartAnimation } from "@/hooks/use-fly-to-cart-animation";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types/product";

export function MobileWishlistDrawer() {
  const open = useUiStore((state) => state.isMobileWishlistDrawerOpen);
  const setOpen = useUiStore((state) => state.setMobileWishlistDrawerOpen);
  const productIds = useWishlistStore((state) => state.productIds);
  const wishlistProducts = useMemo(
    () =>
      productIds
        .map((productId) => products.find((product) => product.id === productId))
        .filter((product): product is Product => Boolean(product)),
    [productIds],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function closeDrawerOnTablet(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false);
      }
    }

    if (mediaQuery.matches) {
      setOpen(false);
    }

    mediaQuery.addEventListener("change", closeDrawerOnTablet);

    return () => mediaQuery.removeEventListener("change", closeDrawerOnTablet);
  }, [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        id="mobile-wishlist-drawer"
        className="right-0 left-auto flex w-[85vw] max-w-[420px] flex-col overflow-hidden border-l border-zinc-200 bg-white p-0 pb-0 text-black shadow-[-18px_0_44px_rgba(0,0,0,0.18)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right md:hidden"
        aria-label="Mobile wishlist drawer"
      >
        <SheetHeader className="border-b border-zinc-200 px-4 pb-4 pt-5 pr-16">
          <SheetTitle className="text-base font-extrabold tracking-[0.16em] text-black">
            Wishlist Items ({wishlistProducts.length})
          </SheetTitle>
        </SheetHeader>

        {wishlistProducts.length ? (
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="grid gap-3">
              {wishlistProducts.map((product) => (
                <MobileWishlistLineItem
                  key={product.id}
                  product={product}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyMobileWishlist onClose={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function MobileWishlistLineItem({
  product,
  onNavigate,
}: {
  product: Product;
  onNavigate: () => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const { flyToCart } = useFlyToCartAnimation();
  const [showAddedState, setShowAddedState] = useState(false);
  const addedStateTimerRef = useRef<number | null>(null);
  const firstAvailableVariant = product.variants.find(
    (variant) => variant.stock > 0,
  );
  const canAddToCart =
    !product.variants.length || Boolean(firstAvailableVariant);
  const imageSrc = getImageUrl(
    product.images[0],
    defaultImagePlaceholders.product,
  );

  useEffect(() => {
    return () => {
      if (addedStateTimerRef.current !== null) {
        window.clearTimeout(addedStateTimerRef.current);
      }
    };
  }, []);

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!canAddToCart) {
      return;
    }

    addItem(product, firstAvailableVariant?.id);
    flyToCart({
      imageSrc,
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
    <article className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 border-b border-zinc-200 pb-4 last:border-b-0 last:pb-0">
      <Link
        href={`/products/${product.slug}`}
        className="relative h-28 overflow-hidden rounded-md bg-zinc-100"
        aria-label={product.name}
        onClick={onNavigate}
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover"
          sizes="86px"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-semibold leading-5 text-black"
              onClick={onNavigate}
            >
              {product.name}
            </Link>
            <p className="mt-1 text-xs text-zinc-500">{product.category}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-black"
            onClick={() => toggleWishlist(product.id)}
            aria-label={`Remove ${product.name} from wishlist`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          className="mt-2 text-sm text-black"
        />

        <Button
          type="button"
          className="mt-3 h-10 w-full rounded-md bg-black text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-sm shadow-black/10 transition-[transform,background-color] duration-200 hover:bg-zinc-800 active:scale-[0.98]"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {showAddedState ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Added
            </span>
          ) : (
            "Add To Cart"
          )}
        </Button>
      </div>
    </article>
  );
}

function EmptyMobileWishlist({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 px-5 py-8">
      <div className="mx-auto grid max-w-[18rem] justify-items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-black">
          <Heart className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-black">
          Your wishlist is empty
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Save products you love and find them here later.
        </p>
        <Button className="mt-5 h-11 w-full rounded-md bg-black text-white hover:bg-zinc-800" asChild>
          <Link href="/products" onClick={onClose}>
            Continue Shopping
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-2 h-11 w-full rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-black"
          onClick={onClose}
        >
          Close drawer
        </Button>
      </div>
    </div>
  );
}
