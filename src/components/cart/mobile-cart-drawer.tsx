"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CouponInput } from "@/components/cart/coupon-input";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { getVariantAvailability } from "@/lib/inventory";
import { getLineItemTotal } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useCartSummary } from "@/hooks/use-cart-summary";
import type { CartItem } from "@/types/cart";
import type { ProductVariant } from "@/types/product";

export function MobileCartDrawer() {
  const open = useUiStore((state) => state.isMobileCartDrawerOpen);
  const setOpen = useUiStore((state) => state.setMobileCartDrawerOpen);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const {
    subtotal,
    deliveryFee,
    couponDiscount,
    shippingDiscount,
    total,
    appliedCoupon,
  } = useCartSummary();

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

    return () =>
      mediaQuery.removeEventListener("change", closeDrawerOnTablet);
  }, [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        id="mobile-cart-drawer"
        className="right-0 left-auto flex w-[85vw] max-w-[420px] flex-col overflow-hidden border-l border-zinc-200 bg-white p-0 pb-0 text-black shadow-[-18px_0_44px_rgba(0,0,0,0.18)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right md:hidden"
        aria-label="Mobile cart drawer"
      >
        <SheetHeader className="border-b border-zinc-200 px-4 pb-4 pt-5 pr-16">
          <SheetTitle className="text-base font-extrabold tracking-[0.16em] text-black">
            Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length ? (
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="grid gap-3">
              {items.map((item) => (
                <MobileCartLineItem
                  key={`${item.product.id}-${item.variantId ?? "default"}`}
                  item={item}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyMobileCart onClose={() => setOpen(false)} />
        )}

        <div className="border-t border-zinc-200 bg-white px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(0,0,0,0.08)]">
          {items.length ? <CouponInput className="mb-3 p-2.5" /> : null}

          <div className="mb-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-600">Subtotal</span>
              <Price price={subtotal} className="justify-end text-sm text-black" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-600">Delivery</span>
              <Price price={deliveryFee} className="justify-end text-sm text-black" />
            </div>
            {couponDiscount > 0 && appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 text-emerald-700">
                <span>Coupon ({appliedCoupon.code})</span>
                <Price
                  price={-couponDiscount}
                  className="justify-end text-sm text-emerald-700"
                />
              </div>
            ) : null}
            {shippingDiscount > 0 && appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 text-emerald-700">
                <span>Shipping discount ({appliedCoupon.code})</span>
                <Price
                  price={-shippingDiscount}
                  className="justify-end text-sm text-emerald-700"
                />
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2">
              <span className="font-semibold text-black">Estimated total</span>
              <Price price={total} className="justify-end text-base text-black" />
            </div>
          </div>

          {items.length ? (
            <Button className="h-12 w-full rounded-md bg-black text-white hover:bg-zinc-800" asChild>
              <Link href="/checkout" onClick={() => setOpen(false)}>
                Proceed to Checkout
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              className="h-12 w-full rounded-md bg-black text-white"
              disabled
            >
              Proceed to Checkout
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileCartLineItem({
  item,
  onNavigate,
}: {
  item: CartItem;
  onNavigate: () => void;
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateItemVariant = useCartStore((state) => state.updateItemVariant);
  const removeItem = useCartStore((state) => state.removeItem);
  const selectedVariant = item.product.variants.find(
    (variant) => variant.id === item.variantId,
  );
  const selectedAvailability = selectedVariant
    ? getVariantAvailability(selectedVariant)
    : undefined;
  const imageSrc = getImageUrl(
    item.product.images[0],
    defaultImagePlaceholders.product,
  );

  return (
    <article className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-zinc-200 pb-4 last:border-b-0 last:pb-0">
      <Link
        href={`/products/${item.product.slug}`}
        className="relative h-28 overflow-hidden rounded-md bg-zinc-100"
        aria-label={item.product.name}
        onClick={onNavigate}
      >
        <Image
          src={imageSrc}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="88px"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className="line-clamp-2 text-sm font-semibold leading-5 text-black"
              onClick={onNavigate}
            >
              {item.product.name}
            </Link>
            <ProductVariantEditor
              item={item}
              selectedVariant={selectedVariant}
              onVariantChange={(nextVariantId) =>
                updateItemVariant(
                  item.product.id,
                  item.variantId,
                  nextVariantId,
                )
              }
            />
            {selectedAvailability?.isPreorder ? (
              <p className="mt-2 inline-flex rounded bg-zinc-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
                {selectedAvailability.label}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-black"
            onClick={() => removeItem(item.product.id, item.variantId)}
            aria-label={`Remove ${item.product.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2">
          <Price price={item.product.price} className="text-sm text-black" />
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div
            className="grid grid-cols-3 overflow-hidden rounded-md border border-zinc-200"
            aria-label={`Quantity for ${item.product.name}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-zinc-100"
              disabled={item.quantity <= 1}
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.quantity - 1,
                  item.variantId,
                )
              }
              aria-label={`Decrease ${item.product.name} quantity`}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="flex h-10 min-w-10 items-center justify-center border-x border-zinc-200 px-2 text-sm font-semibold">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-zinc-100"
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.quantity + 1,
                  item.variantId,
                )
              }
              aria-label={`Increase ${item.product.name} quantity`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-w-0 text-right">
            <span className="block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Line total
            </span>
            <Price
              price={getLineItemTotal(item)}
              className="justify-end text-sm text-black"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductVariantEditor({
  item,
  selectedVariant,
  onVariantChange,
}: {
  item: CartItem;
  selectedVariant?: ProductVariant;
  onVariantChange: (nextVariantId: string) => void;
}) {
  const variants = item.product.variants;
  const displayVariant =
    selectedVariant ??
    variants.find((variant) => getVariantAvailability(variant).purchasable);
  const [selectedSize, setSelectedSize] = useState(displayVariant?.size);
  const [selectedColor, setSelectedColor] = useState(displayVariant?.color);

  useEffect(() => {
    setSelectedSize(displayVariant?.size);
    setSelectedColor(displayVariant?.color);
  }, [displayVariant?.color, displayVariant?.id, displayVariant?.size]);

  if (!variants.length) {
    return <p className="mt-1 text-xs text-zinc-500">{item.product.category}</p>;
  }

  const sizes = getUniqueValues([
    ...item.product.sizes,
    ...variants.map((variant) => variant.size),
  ]);
  const colors = getUniqueValues([
    ...item.product.colors.map((color) => color.name),
    ...variants.map((variant) => variant.color),
  ]);

  function handleSizeSelect(size: string) {
    if (!selectedColor) {
      return;
    }

    const nextVariant = findExactPurchasableVariant(variants, size, selectedColor);

    if (nextVariant) {
      setSelectedSize(size);
      onVariantChange(nextVariant.id);
    }
  }

  function handleColorSelect(color: string) {
    if (!selectedSize) {
      return;
    }

    const nextVariant = findExactPurchasableVariant(variants, selectedSize, color);

    if (nextVariant) {
      setSelectedColor(color);
      onVariantChange(nextVariant.id);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Size
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => {
            const isSelected = selectedSize === size;
            const disabled =
              !selectedColor ||
              !findExactPurchasableVariant(variants, size, selectedColor);

            return (
              <button
                key={size}
                type="button"
                className={cn(
                  "flex min-h-11 min-w-11 flex-col items-center justify-center rounded-md border border-zinc-200 px-3 text-xs font-semibold text-black transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                  isSelected && "border-black bg-black text-white",
                  disabled &&
                    "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-80",
                )}
                disabled={disabled}
                aria-label={
                  disabled
                    ? `Size ${size} unavailable for selected color`
                    : `Select size ${size}`
                }
                aria-pressed={isSelected}
                onClick={() => {
                  handleSizeSelect(size);
                }}
              >
                <span>{size}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Color
        </p>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((color) => {
            const isSelected = selectedColor === color;
            const disabled =
              !selectedSize ||
              !findExactPurchasableVariant(variants, selectedSize, color);
            const swatchColor = item.product.colors.find(
              (productColor) => productColor.name === color,
            )?.value;

            return (
              <button
                key={color}
                type="button"
                className={cn(
                  "flex min-h-11 max-w-full items-center gap-2 rounded-md border border-zinc-200 px-2.5 text-xs font-medium text-black transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                  isSelected && "border-black bg-black text-white",
                  disabled &&
                    "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-80",
                )}
                disabled={disabled}
                aria-label={
                  disabled
                    ? `${color} unavailable for selected size`
                    : `Select color ${color}`
                }
                aria-pressed={isSelected}
                onClick={() => {
                  handleColorSelect(color);
                }}
              >
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border border-zinc-300",
                    isSelected && "border-white",
                    disabled && "opacity-35 grayscale",
                  )}
                  style={{ backgroundColor: swatchColor ?? "transparent" }}
                />
                <span className="truncate">{color}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function findExactPurchasableVariant(
  variants: ProductVariant[],
  size: string,
  color: string,
) {
  return variants.find(
    (variant) =>
      variant.size === size &&
      variant.color === color &&
      getVariantAvailability(variant).purchasable,
  );
}

function EmptyMobileCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 px-5 py-8">
      <div className="mx-auto grid max-w-[18rem] justify-items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-black">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-black">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Add pieces you love and review them here before checkout.
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
