"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
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
  findPurchasableVariant,
  getVariantAvailability,
} from "@/lib/inventory";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product, ProductVariant } from "@/types/product";

export function MobileWishlistDrawer() {
  const open = useUiStore((state) => state.isMobileWishlistDrawerOpen);
  const setOpen = useUiStore((state) => state.setMobileWishlistDrawerOpen);
  const productIds = useWishlistStore((state) => state.productIds);
  const productsById = useWishlistStore((state) => state.productsById);
  const wishlistProducts = useMemo(
    () =>
      productIds
        .map(
          (productId) =>
            productsById[productId] ??
            products.find((product) => product.id === productId),
        )
        .filter((product): product is Product => Boolean(product)),
    [productIds, productsById],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        id="mobile-wishlist-drawer"
        className="left-0 right-auto flex h-dvh w-[min(400px,calc(100vw-2rem))] max-w-none flex-col overflow-hidden rounded-r-2xl border-l-0 border-r border-zinc-200 bg-[#fffdf9] p-0 pb-0 text-zinc-950 shadow-[24px_0_54px_rgba(0,0,0,0.22)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left [&>button:last-child]:right-3 [&>button:last-child]:top-2 [&>button:last-child]:h-10 [&>button:last-child]:w-10"
        aria-label="Wishlist drawer"
      >
        <SheetHeader className="flex h-14 shrink-0 justify-center space-y-0 border-b border-[#ded6c9] bg-[#eee8df] px-4 pr-16">
          <SheetTitle className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-zinc-950">
            <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
            {wishlistProducts.length}{" "}
            {wishlistProducts.length === 1 ? "Item" : "Items"}
          </SheetTitle>
        </SheetHeader>

        {wishlistProducts.length ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="grid gap-0">
              {wishlistProducts.map((product) => (
                <WishlistLineItem
                  key={product.id}
                  product={product}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyWishlist onClose={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function WishlistLineItem({
  product,
  onNavigate,
}: {
  product: Product;
  onNavigate: () => void;
}) {
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const imageSrc = getImageUrl(
    product.images[0],
    defaultImagePlaceholders.product,
  );

  return (
    <>
      <article className="grid grid-cols-[76px_minmax(0,1fr)_32px] gap-3 border-b border-zinc-200 py-3.5 first:pt-0 last:border-b-0">
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-square w-[76px] overflow-hidden rounded-md bg-zinc-100"
          aria-label={product.name}
          onClick={onNavigate}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover object-center"
            sizes="76px"
          />
        </Link>

        <div className="min-w-0 pt-0.5">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 text-xs font-semibold uppercase leading-4 text-zinc-700 hover:text-black"
            onClick={onNavigate}
          >
            {product.name}
          </Link>
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            className="mt-1 text-base font-semibold text-zinc-900 [&_span:last-child]:text-xs [&_span:last-child]:text-zinc-500"
          />
          <Button
            type="button"
            className="mt-3 h-9 rounded-md bg-zinc-950 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-zinc-800"
            onClick={() => setQuickAddOpen(true)}
            aria-label={`Quick add ${product.name}`}
          >
            Select Size & Color
          </Button>
        </div>

        <button
          type="button"
          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
          onClick={() => toggleWishlist(product.id)}
          aria-label={`Remove ${product.name} from wishlist`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </article>

      {quickAddOpen ? (
        <QuickAddModal
          open
          onOpenChange={setQuickAddOpen}
          onNavigate={onNavigate}
          product={product}
        />
      ) : null}
    </>
  );
}

function QuickAddModal({
  open,
  onNavigate,
  onOpenChange,
  product,
}: {
  open: boolean;
  onNavigate: () => void;
  onOpenChange: (open: boolean) => void;
  product: Product;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const { flyToCart } = useFlyToCartAnimation();
  const initialVariant = findPurchasableVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id,
  );
  const [quantity, setQuantity] = useState(1);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isAddingToCartRef = useRef(false);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    initialVariant;
  const purchasableVariants = product.variants.filter(
    (variant) => getVariantAvailability(variant).purchasable,
  );
  const sizes = getUniqueValues(product.variants.map((variant) => variant.size));
  const colors = getUniqueValues(
    product.variants.map((variant) => variant.color),
  );
  const selectedAvailability = selectedVariant
    ? getVariantAvailability(selectedVariant)
    : undefined;
  const maxQuantity = selectedAvailability?.maxQuantity;
  const imageSrc = getImageUrl(
    product.images[0],
    defaultImagePlaceholders.product,
  );

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  function selectSize(size: string) {
    const nextVariant =
      findVariant(
        purchasableVariants,
        size,
        selectedVariant?.color,
      ) ?? purchasableVariants.find((variant) => variant.size === size);

    if (nextVariant) {
      setSelectedVariantId(nextVariant.id);
      setQuantity((current) =>
        clampQuantity(current, getVariantAvailability(nextVariant).maxQuantity),
      );
    }
  }

  function selectColor(color: string) {
    const nextVariant =
      findVariant(
        purchasableVariants,
        selectedVariant?.size,
        color,
      ) ?? purchasableVariants.find((variant) => variant.color === color);

    if (nextVariant) {
      setSelectedVariantId(nextVariant.id);
      setQuantity((current) =>
        clampQuantity(current, getVariantAvailability(nextVariant).maxQuantity),
      );
    }
  }

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    if (
      isAddingToCartRef.current ||
      !selectedVariant ||
      !selectedAvailability?.purchasable
    ) {
      return;
    }

    isAddingToCartRef.current = true;

    const launchResult = flyToCart({
      imageSrc,
      sourceElement: imageRef.current ?? event.currentTarget,
    });
    addItem(product, selectedVariant.id, quantity);

    if (!launchResult.started) {
      onOpenChange(false);
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        onOpenChange(false);
      });
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[60] flex max-h-[calc(100dvh-2rem)] w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#d8d0c4] bg-[#fffdf9] text-zinc-950 shadow-2xl shadow-black/35 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in"
          aria-describedby={`quick-add-description-${product.id}`}
        >
          <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-[#ded6c9] bg-[#eee8df] px-4">
            <Dialog.Title className="text-sm font-bold uppercase tracking-[0.08em]">
              Select Size & Color
            </Dialog.Title>
            <Dialog.Close className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-[#fffdf9] text-zinc-800 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Close quick add</span>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-zinc-200 p-4">
              <div className="relative aspect-square w-24 overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  ref={imageRef}
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 self-center">
                <Dialog.Description
                  id={`quick-add-description-${product.id}`}
                  className="line-clamp-3 text-sm font-semibold leading-5 text-zinc-900"
                >
                  {product.name}
                </Dialog.Description>
                <Price
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  className="mt-2 text-sm text-zinc-900"
                />
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-3 inline-flex text-xs font-semibold text-zinc-600 underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-black"
                  onClick={() => {
                    onOpenChange(false);
                    onNavigate();
                  }}
                >
                  View Product Details
                </Link>
              </div>
            </div>

            <div className="grid gap-6 p-4">
              <VariantSection
                label="Choose Size"
                options={sizes}
                selectedValue={selectedVariant?.size}
                isDisabled={(size) =>
                  !purchasableVariants.some((variant) => variant.size === size)
                }
                onSelect={selectSize}
              />

              <ColorSection
                colors={colors}
                product={product}
                selectedValue={selectedVariant?.color}
                isDisabled={(color) =>
                  !purchasableVariants.some((variant) => variant.color === color)
                }
                onSelect={selectColor}
              />

              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
                  Quantity
                </h3>
                <div className="mt-3 inline-grid grid-cols-3 overflow-hidden rounded-lg border border-zinc-300 bg-white">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:text-zinc-300"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="flex h-11 min-w-12 items-center justify-center border-x border-zinc-300 px-3 text-sm font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:text-zinc-300"
                    disabled={
                      typeof maxQuantity === "number" && quantity >= maxQuantity
                    }
                    onClick={() =>
                      setQuantity((current) =>
                        clampQuantity(current + 1, maxQuantity),
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t border-zinc-200 bg-[#fffdf9] p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.07)]">
            <Button
              type="button"
              className="h-12 w-full rounded-lg bg-zinc-950 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-zinc-800"
              disabled={!selectedVariant || !selectedAvailability?.purchasable}
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {selectedAvailability?.purchasable
                ? "Add To Cart"
                : "Out of Stock"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VariantSection({
  isDisabled,
  label,
  onSelect,
  options,
  selectedValue,
}: {
  isDisabled: (value: string) => boolean;
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selectedValue?: string;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === selectedValue;
          const disabled = isDisabled(option);

          return (
            <button
              key={option}
              type="button"
              className={cn(
                "flex min-h-10 min-w-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-800 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                selected && "border-zinc-950 bg-zinc-950 text-white",
                disabled &&
                  "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400",
              )}
              disabled={disabled}
              aria-label={`Select size ${option}`}
              aria-pressed={selected}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ColorSection({
  colors,
  isDisabled,
  onSelect,
  product,
  selectedValue,
}: {
  colors: string[];
  isDisabled: (value: string) => boolean;
  onSelect: (value: string) => void;
  product: Product;
  selectedValue?: string;
}) {
  if (colors.length === 1) {
    const color = colors[0];
    const colorValue = product.colors.find((item) => item.name === color)?.value;

    return (
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
          Color
        </h3>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800">
          <ColorSwatch value={colorValue} />
          {color}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
        Choose Color
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {colors.map((color) => {
          const selected = color === selectedValue;
          const disabled = isDisabled(color);
          const colorValue = product.colors.find(
            (item) => item.name === color,
          )?.value;

          return (
            <button
              key={color}
              type="button"
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-800 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                selected && "border-zinc-950 bg-zinc-950 text-white",
                disabled &&
                  "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400",
              )}
              disabled={disabled}
              aria-label={`Select color ${color}`}
              aria-pressed={selected}
              onClick={() => onSelect(color)}
            >
              <ColorSwatch value={colorValue} selected={selected} />
              {color}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ColorSwatch({
  selected,
  value,
}: {
  selected?: boolean;
  value?: string;
}) {
  return (
    <span
      className={cn(
        "h-3.5 w-3.5 shrink-0 rounded-full border border-black/15",
        selected && "border-white/60",
      )}
      style={{ backgroundColor: value ?? "transparent" }}
      aria-hidden="true"
    />
  );
}

function EmptyWishlist({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
      <div className="max-w-64">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-black">
          <Heart className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Your wishlist is empty</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Save products you love and find them here later.
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

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function findVariant(
  variants: ProductVariant[],
  size: string | undefined,
  color: string | undefined,
) {
  return variants.find(
    (variant) => variant.size === size && variant.color === color,
  );
}

function clampQuantity(quantity: number, maxQuantity?: number) {
  if (typeof maxQuantity === "number") {
    return Math.max(1, Math.min(quantity, maxQuantity));
  }

  return Math.max(1, quantity);
}
