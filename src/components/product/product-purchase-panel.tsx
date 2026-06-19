"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { useFlyToCartAnimation } from "@/hooks/use-fly-to-cart-animation";
import {
  findPurchasableVariant,
  getVariantAvailability,
} from "@/lib/inventory";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";
import { ColorSelector } from "./color-selector";
import { SizeSelector } from "./size-selector";

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { flyToCart } = useFlyToCartAnimation();
  const firstAvailableVariant = findPurchasableVariant(product);
  const [color, setColor] = useState(
    firstAvailableVariant?.color ?? product.colors[0]?.name,
  );
  const [size, setSize] = useState(firstAvailableVariant?.size ?? product.sizes[0]);
  const [status, setStatus] = useState("");
  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (variant) => variant.color === color && variant.size === size,
      ),
    [color, product.variants, size],
  );
  const selectedAvailability = selectedVariant
    ? getVariantAvailability(selectedVariant)
    : undefined;
  const canPurchase = Boolean(selectedAvailability?.purchasable);
  const productImageSrc = getImageUrl(
    product.images[0],
    defaultImagePlaceholders.product,
  );

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    if (!canPurchase) {
      setStatus("Please select an available color and size.");
      return;
    }

    const sourceElement =
      document.querySelector<HTMLElement>(
        '[data-cart-animation-source="desktop-product-detail"]',
      ) ?? event.currentTarget;

    flyToCart({
      imageSrc: productImageSrc,
      sourceElement,
    });
    addItem(product, selectedVariant?.id);
    setStatus(
      selectedAvailability?.isPreorder
        ? `${product.name} pre order added to cart.`
        : `${product.name} added to cart.`,
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">Color</p>
          <ColorSelector
            colors={product.colors}
            value={color}
            onChange={setColor}
          />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium">Size</p>
          <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedAvailability?.label ?? "Out of Stock"}
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={!canPurchase}
          onClick={handleAddToCart}
        >
          {selectedAvailability?.buttonLabel ?? "Out of Stock"}
        </Button>
      </div>
      {!canPurchase ? (
        <p className="text-sm text-muted-foreground">
          This color and size combination is currently unavailable.
        </p>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
