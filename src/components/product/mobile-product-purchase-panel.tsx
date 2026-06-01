"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { Check, CreditCard, Minus, Plus, RefreshCcw, Star, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useFlyToCartAnimation } from "@/hooks/use-fly-to-cart-animation";
import {
  findPurchasableVariant,
  getVariantAvailability,
} from "@/lib/inventory";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import type { Product, ProductVariant } from "@/types/product";
import { cn } from "@/lib/utils";

type MobileProductPurchasePanelProps = {
  product: Product;
};

const formatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function formatTaka(price: number) {
  return formatter.format(price).replace(/^BDT\s?/, "৳");
}

function getDiscountPercent(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return null;
  }

  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

function findVariant(
  variants: ProductVariant[],
  color: string | undefined,
  size: string | undefined,
) {
  return variants.find(
    (variant) => variant.color === color && variant.size === size,
  );
}

export function MobileProductPurchasePanel({
  product,
}: MobileProductPurchasePanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { flyToCart } = useFlyToCartAnimation();
  const firstAvailableVariant = findPurchasableVariant(product);
  const [color, setColor] = useState(
    firstAvailableVariant?.color ?? product.colors[0]?.name,
  );
  const [size, setSize] = useState(firstAvailableVariant?.size ?? product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [showAddedState, setShowAddedState] = useState(false);
  const addedStateTimerRef = useRef<number | null>(null);
  const selectedVariant = useMemo(
    () => findVariant(product.variants, color, size),
    [color, product.variants, size],
  );
  const selectedAvailability = selectedVariant
    ? getVariantAvailability(selectedVariant)
    : undefined;
  const discountPercent = getDiscountPercent(product);
  const canPurchase = Boolean(selectedAvailability?.purchasable);
  const maxQuantity = selectedAvailability?.maxQuantity;
  const productImageSrc = getImageUrl(
    product.images[0],
    defaultImagePlaceholders.product,
  );

  useEffect(() => {
    if (maxQuantity !== undefined && quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity));
    }
  }, [maxQuantity, quantity]);

  useEffect(() => {
    return () => {
      if (addedStateTimerRef.current !== null) {
        window.clearTimeout(addedStateTimerRef.current);
      }
    };
  }, []);

  function addSelectedToCart() {
    if (!canPurchase) {
      setStatus("Please select an available color and size.");
      return false;
    }

    const quantityToAdd =
      maxQuantity === undefined ? quantity : Math.min(quantity, maxQuantity);

    addItem(product, selectedVariant?.id, quantityToAdd);
    setStatus(
      selectedAvailability?.isPreorder
        ? `${quantityToAdd} ${product.name} pre order added to cart.`
        : `${quantityToAdd} ${product.name} added to cart.`,
    );
    return true;
  }

  function showAddedFeedback() {
    setShowAddedState(true);

    if (addedStateTimerRef.current !== null) {
      window.clearTimeout(addedStateTimerRef.current);
    }

    addedStateTimerRef.current = window.setTimeout(() => {
      setShowAddedState(false);
      addedStateTimerRef.current = null;
    }, 2000);
  }

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    if (addSelectedToCart()) {
      showAddedFeedback();
      flyToCart({
        imageSrc: productImageSrc,
        sourceElement: event.currentTarget,
      });
    }
  }

  return (
    <div className="space-y-6 px-4 py-5">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold leading-tight text-black">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 text-sm text-zinc-700">
          <span className="flex text-black" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-3.5 w-3.5",
                  index < 4 ? "fill-current" : "fill-none",
                )}
              />
            ))}
          </span>
          <span>0.0 | 0 Reviews</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-3xl font-extrabold leading-none text-black">
            {formatTaka(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-base font-semibold text-zinc-400 line-through decoration-1">
              {formatTaka(product.compareAtPrice)}
            </span>
          ) : null}
          {discountPercent ? (
            <span className="rounded bg-red-600 px-2 py-1 text-xs font-extrabold leading-none text-white">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-black">Color</p>
            {color ? <p className="text-sm text-zinc-500">{color}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((productColor) => {
              const disabled = !product.variants.some(
                (variant) => variant.color === productColor.name,
              );
              const selected = color === productColor.name;

              return (
                <button
                  key={productColor.name}
                  type="button"
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full border transition",
                    selected ? "border-black" : "border-zinc-200",
                    disabled && "cursor-not-allowed opacity-35 grayscale",
                  )}
                  disabled={disabled}
                  aria-label={`Select ${productColor.name}`}
                  aria-pressed={selected}
                  onClick={() => setColor(productColor.name)}
                >
                  <span
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: productColor.value }}
                  />
                  {selected ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-black">Size</p>
            {size ? <p className="text-sm text-zinc-500">{size}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((productSize) => {
              const disabled = !product.variants.some(
                (variant) => variant.size === productSize,
              );
              const selected = size === productSize;

              return (
                <button
                  key={productSize}
                  type="button"
                  className={cn(
                    "min-h-11 min-w-12 rounded-full border px-4 text-sm font-semibold transition",
                    selected
                      ? "border-black bg-black text-white"
                      : "border-zinc-200 bg-white text-black",
                    disabled &&
                      "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400",
                  )}
                  disabled={disabled}
                  aria-label={`Select size ${productSize}`}
                  aria-pressed={selected}
                  onClick={() => setSize(productSize)}
                >
                  {productSize}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-black">Quantity</p>
        <div className="grid grid-cols-3 overflow-hidden rounded-full border border-zinc-200 bg-white">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-black transition disabled:text-zinc-300"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-11 min-w-11 items-center justify-center border-x border-zinc-200 text-sm font-bold text-black">
            {quantity}
          </span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-black transition disabled:text-zinc-300"
            disabled={
              !canPurchase ||
              (maxQuantity !== undefined && quantity >= maxQuantity)
            }
            onClick={() => setQuantity((current) => current + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      <p className="text-sm font-semibold text-black">
        {selectedAvailability?.label ?? "Out of Stock"}
      </p>

      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-zinc-2000 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
        disabled={!canPurchase}
        onClick={handleAddToCart}
      >
        {showAddedState ? (
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4" />
            Added
          </span>
        ) : (
          (selectedAvailability?.buttonLabel ?? "Out of Stock")
        )}
      </button>

      <section className="grid grid-cols-3 gap-2">
        <TrustCard icon={<Truck className="h-4 w-4" />} label="Fast Delivery" />
        <TrustCard icon={<RefreshCcw className="h-4 w-4" />} label="Easy Exchange" />
        <TrustCard icon={<CreditCard className="h-4 w-4" />} label="Cash On Delivery" />
      </section>

      {!canPurchase ? (
        <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
          This color and size combination is currently unavailable.
        </p>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

function TrustCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="grid min-h-[72px] place-items-center rounded-md border border-black/10 bg-white px-2 py-3 text-center shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-black">
        {icon}
      </div>
      <p className="mt-2 text-[11px] font-semibold leading-4 text-black">{label}</p>
    </div>
  );
}
