"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CouponInput } from "@/components/cart/coupon-input";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { getLineItemTotal } from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import { useCartSummary } from "@/hooks/use-cart-summary";
import type { CartItem } from "@/types/cart";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const summary = useCartSummary();

  if (!items.length) {
    return <EmptyCartState />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <CartLineItem
            key={`${item.product.id}-${item.variantId ?? "default"}`}
            item={item}
          />
        ))}
      </div>

      <OrderSummary
        itemCount={summary.itemCount}
        subtotal={summary.subtotal}
        deliveryFee={summary.deliveryFee}
        couponDiscount={summary.couponDiscount}
        shippingDiscount={summary.shippingDiscount}
        total={summary.total}
        appliedCouponCode={summary.appliedCoupon?.code}
      />

      <div className="sticky bottom-0 -mx-4 border-t bg-background px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated total</span>
          <Price price={summary.total} className="text-base" />
        </div>
        <Button className="w-full" asChild>
          <Link href="/checkout">Continue checkout</Link>
        </Button>
      </div>
    </div>
  );
}

function CartLineItem({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const selectedVariant = item.product.variants.find(
    (variant) => variant.id === item.variantId,
  );
  const imageSrc = getImageUrl(
    item.product.images[0],
    defaultImagePlaceholders.product,
  );

  return (
    <article className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-md border bg-background p-3 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:p-4">
      <Link
        href={`/products/${item.product.slug}`}
        className="relative h-28 overflow-hidden rounded-md bg-muted sm:h-32"
        aria-label={item.product.name}
      >
        <Image
          src={imageSrc}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className="line-clamp-2 text-sm font-semibold text-foreground hover:underline sm:text-base"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedVariant
                ? `${selectedVariant.color} / ${selectedVariant.size}`
                : item.product.category}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 sm:h-10 sm:w-10"
            onClick={() => removeItem(item.product.id, item.variantId)}
            aria-label={`Remove ${item.product.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3">
          <Price price={item.product.price} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div
            className="grid grid-cols-3 overflow-hidden rounded-md border"
            aria-label={`Quantity for ${item.product.name}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-none sm:h-10 sm:w-10"
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
            <span className="flex h-11 min-w-11 items-center justify-center border-x px-3 text-sm font-medium sm:h-10">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-none sm:h-10 sm:w-10"
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

          <div className="text-right">
            <span className="text-xs text-muted-foreground">Line total</span>
            <Price
              price={getLineItemTotal(item)}
              className="justify-end text-base"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderSummary({
  itemCount,
  subtotal,
  deliveryFee,
  couponDiscount,
  shippingDiscount,
  total,
  appliedCouponCode,
}: {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  shippingDiscount: number;
  total: number;
  appliedCouponCode?: string;
}) {
  return (
    <aside className="h-fit rounded-md border bg-background p-4 lg:sticky lg:top-24">
      <h2 className="text-base font-semibold">Order summary</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <Price price={subtotal} />
        </div>
        <CouponInput />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <Price price={deliveryFee} />
        </div>
        {couponDiscount > 0 && appliedCouponCode ? (
          <div className="flex items-center justify-between gap-3 text-emerald-700">
            <span>Coupon ({appliedCouponCode})</span>
            <Price price={-couponDiscount} className="justify-end text-emerald-700" />
          </div>
        ) : null}
        {shippingDiscount > 0 && appliedCouponCode ? (
          <div className="flex items-center justify-between gap-3 text-emerald-700">
            <span>Shipping discount ({appliedCouponCode})</span>
            <Price
              price={-shippingDiscount}
              className="justify-end text-emerald-700"
            />
          </div>
        ) : null}
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Estimated total</span>
          <Price price={total} className="text-base" />
        </div>
        <Button className="mt-4 hidden w-full md:inline-flex" asChild>
          <Link href="/checkout">Continue checkout</Link>
        </Button>
      </div>
    </aside>
  );
}

function EmptyCartState() {
  return (
    <div className="rounded-md border bg-background p-6 text-center sm:p-8">
      <h2 className="text-lg font-semibold">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Add items from the catalog to review quantities, delivery, and checkout
        details here.
      </p>
      <Button className="mt-5" asChild>
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}
