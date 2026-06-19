"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { useCartSummary } from "@/hooks/use-cart-summary";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { getVariantAvailability } from "@/lib/inventory";
import { getLineItemTotal } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import type { StorefrontSettingsDto } from "@/types/api/settings.dto";
import type { CartItem } from "@/types/cart";
import type { ProductVariant } from "@/types/product";
import { usePathname } from "next/navigation";

const categoryRootSegments = new Set([
  "men",
  "women",
  "kids",
  "seasonal-fits",
  "sports",
  "shoes",
  "accessories",
]);

type DesktopFloatingCartProps = {
  deliverySettings: StorefrontSettingsDto["delivery"];
};

export function DesktopFloatingCart({
  deliverySettings,
}: DesktopFloatingCartProps) {
  const pathname = usePathname();
  const visible = isDesktopFloatingCartVisible(pathname);
  const open = useUiStore((state) => state.isDesktopCartDrawerOpen);
  const setOpen = useUiStore((state) => state.setDesktopCartDrawerOpen);
  const items = useCartStore((state) => state.items);
  const { itemCount, subtotal } = useCartSummary(deliverySettings);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function updateDesktopViewport(event: MediaQueryListEvent) {
      setIsDesktopViewport(event.matches);

      if (!event.matches) {
        setOpen(false);
      }
    }

    setIsDesktopViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateDesktopViewport);

    return () =>
      mediaQuery.removeEventListener("change", updateDesktopViewport);
  }, [setOpen]);

  if (!visible || !isDesktopViewport) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group fixed right-0 top-[52%] z-[45] hidden -translate-y-1/2 overflow-hidden rounded-l-xl border border-r-0 border-[#b9a88f]/70 bg-zinc-950 text-[#fffaf0] shadow-[-8px_10px_28px_rgba(0,0,0,0.2)] transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-[#d6c7b0] hover:bg-zinc-900 hover:shadow-[-10px_12px_32px_rgba(0,0,0,0.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 motion-reduce:transition-none md:grid"
          aria-label={`Open cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          data-cart-animation-target="true"
        >
          <span
            className="grid min-h-[50px] w-[50px] place-items-center gap-1 px-1.5 py-2 transition-[filter,transform] duration-200 ease-out"
            data-cart-animation-pulse-target="true"
          >
            <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="text-[9px] font-semibold uppercase leading-none tracking-[0.04em]">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </span>
          <span className="grid min-h-[22px] place-items-center border-t border-[#b9a88f]/40 bg-[#e9e1d5] px-1.5 text-[9px] font-bold leading-none text-zinc-950 transition-colors duration-300 group-hover:bg-[#f4eee5]">
            {formatCompactTaka(subtotal)}
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 hidden bg-black/35 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in md:block" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 z-50 hidden h-dvh w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-l-2xl border-l border-zinc-200 bg-[#fffdf9] text-zinc-950 shadow-[-24px_0_54px_rgba(0,0,0,0.22)] outline-none",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right md:flex",
          )}
          aria-label="Desktop cart drawer"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#ded6c9] bg-[#eee8df] px-4">
            <Dialog.Title className="inline-flex min-w-0 items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-zinc-950">
              <ShoppingBag className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-400/80 bg-[#fffdf9] px-3 text-xs font-medium text-zinc-800 transition-colors duration-200 hover:border-zinc-700 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                aria-label="Close cart drawer"
              >
                Close
              </button>
            </Dialog.Close>
          </div>

          {items.length ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <div className="grid gap-0">
                {items.map((item) => (
                  <DesktopCartLineItem
                    key={`${item.product.id}-${item.variantId ?? "default"}`}
                    item={item}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyDesktopCart onClose={() => setOpen(false)} />
          )}

          <div className="shrink-0 border-t border-zinc-200 bg-[#fffdf9] px-4 py-4 shadow-[0_-12px_30px_rgba(0,0,0,0.07)]">
            <div className="flex overflow-hidden rounded-md border border-zinc-950 bg-zinc-950 text-sm font-bold text-[#fffaf0] shadow-sm">
              {items.length ? (
                <Link
                  href="/checkout"
                  className="group flex h-11 flex-1 items-center justify-center gap-1 px-4 transition-colors duration-200 hover:bg-zinc-800"
                  onClick={() => setOpen(false)}
                >
                  <span>Checkout</span>
                  <span
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    &gt;
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex h-11 flex-1 cursor-not-allowed items-center justify-center gap-1 px-4 opacity-60"
                  disabled
                >
                  Checkout <span aria-hidden="true">&gt;</span>
                </button>
              )}
              <div className="flex h-11 min-w-36 items-center justify-center border-l border-zinc-950 bg-[#e9e1d5] px-3 text-xs text-zinc-950">
                Cart Total&nbsp;{"\u09F3"}
                {formatPlainAmount(subtotal)}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DesktopCartLineItem({
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
  const imageSrc = getImageUrl(
    item.product.images[0],
    defaultImagePlaceholders.product,
  );

  return (
    <article className="grid grid-cols-[24px_76px_minmax(0,1fr)_24px] gap-3 border-b border-zinc-200 py-3.5 first:pt-0 last:border-b-0">
      <div className="grid justify-items-center gap-1 pt-1 text-zinc-500">
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center transition hover:text-black disabled:text-zinc-300"
          onClick={() =>
            updateQuantity(item.product.id, item.quantity + 1, item.variantId)
          }
          aria-label={`Increase ${item.product.name} quantity`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="text-sm font-bold leading-none text-zinc-800">
          {item.quantity}
        </span>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center transition hover:text-black disabled:text-zinc-300"
          disabled={item.quantity <= 1}
          onClick={() =>
            updateQuantity(item.product.id, item.quantity - 1, item.variantId)
          }
          aria-label={`Decrease ${item.product.name} quantity`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <Link
        href={`/products/${item.product.slug}`}
        className="relative aspect-square w-[76px] overflow-hidden rounded-md bg-zinc-100"
        onClick={onNavigate}
        aria-label={item.product.name}
      >
        <Image
          src={imageSrc}
          alt={item.product.name}
          fill
          className="object-cover object-center"
          sizes="76px"
        />
      </Link>

      <div className="min-w-0 pt-0.5">
        <Link
          href={`/products/${item.product.slug}`}
          className="line-clamp-2 text-xs font-semibold uppercase leading-4 text-zinc-700 hover:text-black"
          onClick={onNavigate}
        >
          {item.product.name}
        </Link>
        <Price
          price={item.product.price}
          compareAtPrice={item.product.compareAtPrice}
          className="mt-1 text-base font-semibold text-zinc-900 [&_span:last-child]:text-xs [&_span:last-child]:text-zinc-500"
        />
        <DesktopProductVariantEditor
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
        <p className="mt-1 text-[11px] text-zinc-500">
          Sub Total: {formatCompactTaka(getLineItemTotal(item))}
        </p>
      </div>

      <button
        type="button"
        className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
        onClick={() => removeItem(item.product.id, item.variantId)}
        aria-label={`Remove ${item.product.name}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}

function DesktopProductVariantEditor({
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

  if (!variants.length || !displayVariant) {
    return <p className="mt-1 text-xs text-zinc-500">{item.product.category}</p>;
  }

  const currentVariant = displayVariant;
  const purchasableVariants = variants.filter(
    (variant) => getVariantAvailability(variant).purchasable,
  );
  const sizes = getUniqueValues(variants.map((variant) => variant.size));
  const colors = getUniqueValues(variants.map((variant) => variant.color));
  const showSizeControl = sizes.length > 1;
  const showColorControl = colors.length > 1;

  function selectSize(size: string) {
    const nextVariant =
      findPurchasableVariant(purchasableVariants, size, currentVariant.color) ??
      purchasableVariants.find((variant) => variant.size === size);

    if (nextVariant) {
      onVariantChange(nextVariant.id);
    }
  }

  function selectColor(color: string) {
    const nextVariant =
      findPurchasableVariant(purchasableVariants, currentVariant.size, color) ??
      purchasableVariants.find((variant) => variant.color === color);

    if (nextVariant) {
      onVariantChange(nextVariant.id);
    }
  }

  if (!showSizeControl && !showColorControl) {
    return (
      <p className="mt-1 text-xs text-zinc-500">
        Size: {displayVariant.size} · Color: {displayVariant.color}
      </p>
    );
  }

  return (
    <div className="mt-2 grid gap-1.5">
      {showSizeControl ? (
        <VariantOptionGroup
          label="Size"
          options={sizes}
          selectedValue={displayVariant.size}
          isDisabled={(size) =>
            !purchasableVariants.some((variant) => variant.size === size)
          }
          onSelect={selectSize}
        />
      ) : (
        <p className="text-[11px] text-zinc-500">
          Size: <span className="font-medium text-zinc-700">{displayVariant.size}</span>
        </p>
      )}

      {showColorControl ? (
        <VariantOptionGroup
          label="Color"
          options={colors}
          selectedValue={displayVariant.color}
          isDisabled={(color) =>
            !purchasableVariants.some((variant) => variant.color === color)
          }
          onSelect={selectColor}
          colorValues={item.product.colors}
        />
      ) : (
        <p className="text-[11px] text-zinc-500">
          Color: <span className="font-medium text-zinc-700">{displayVariant.color}</span>
        </p>
      )}
    </div>
  );
}

function VariantOptionGroup({
  label,
  options,
  selectedValue,
  isDisabled,
  onSelect,
  colorValues,
}: {
  label: string;
  options: string[];
  selectedValue: string;
  isDisabled: (value: string) => boolean;
  onSelect: (value: string) => void;
  colorValues?: { name: string; value: string }[];
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-8 shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap gap-1">
        {options.map((option) => {
          const selected = option === selectedValue;
          const disabled = isDisabled(option);
          const swatch = colorValues?.find((color) => color.name === option)?.value;

          return (
            <button
              key={option}
              type="button"
              className={cn(
                "inline-flex min-h-7 min-w-7 items-center justify-center gap-1 rounded border border-zinc-300 bg-white px-1.5 text-[10px] font-semibold text-zinc-700 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1",
                selected && "border-zinc-950 bg-zinc-950 text-white",
                disabled &&
                  "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400",
              )}
              disabled={disabled}
              aria-label={`Select ${label.toLowerCase()} ${option}`}
              aria-pressed={selected}
              onClick={() => onSelect(option)}
            >
              {swatch ? (
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full border border-black/15",
                    selected && "border-white/60",
                  )}
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />
              ) : null}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function findPurchasableVariant(
  variants: ProductVariant[],
  size: string,
  color: string,
) {
  return variants.find(
    (variant) => variant.size === size && variant.color === color,
  );
}

function EmptyDesktopCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
      <div className="max-w-64">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-black">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Add pieces you love and review them here before checkout.
        </p>
        <Button className="mt-5 h-11 rounded-md bg-black px-5 text-white hover:bg-zinc-800" asChild>
          <Link href="/products" onClick={onClose}>
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}

function isDesktopFloatingCartVisible(pathname: string) {
  if (
    pathname === "/" ||
    pathname === "/wishlist" ||
    pathname === "/products" ||
    pathname.startsWith("/products/")
  ) {
    return true;
  }

  if (
    pathname.startsWith("/admin") ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname === "/privacy-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/about" ||
    pathname === "/contact"
  ) {
    return false;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return Boolean(firstSegment && categoryRootSegments.has(firstSegment));
}

function formatCompactTaka(amount: number) {
  return `\u09F3 ${formatPlainAmount(amount)}`;
}

function formatPlainAmount(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(amount);
}
