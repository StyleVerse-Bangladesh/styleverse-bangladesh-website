"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";
import { ColorSelector } from "./color-selector";
import { SizeSelector } from "./size-selector";

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [color, setColor] = useState(product.colors[0]?.name);
  const [size, setSize] = useState(product.sizes[0]);
  const [status, setStatus] = useState("");
  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (variant) => variant.color === color && variant.size === size,
      ),
    [color, product.variants, size],
  );

  function handleAddToCart() {
    addItem(product, selectedVariant?.id);
    setStatus(`${product.name} added to cart.`);
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
      <Button className="w-full sm:w-auto" onClick={handleAddToCart}>
        Add to cart
      </Button>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
