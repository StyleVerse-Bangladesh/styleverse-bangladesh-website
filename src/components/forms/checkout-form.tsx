"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useForm, type FieldError } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/product/price";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/cart";
import { validateCoupon } from "@/lib/coupons";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { getVariantAvailability } from "@/lib/inventory";
import { getLineItemTotal } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { checkoutSchema, type CheckoutValues } from "./schemas";

type CheckoutSectionProps = {
  icon: ReactNode;
  step: string;
  title: string;
  description: string;
  children: ReactNode;
};

type CheckoutFieldProps = {
  id: string;
  label: string;
  error?: FieldError;
  children: ReactNode;
};

type SummaryItem = {
  id: string;
  name: string;
  imageSrc: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  inventoryLabel?: string;
  inventoryTone?: "preorder" | "low" | "warning";
};

export function CheckoutForm() {
  const cartItems = useCartStore((state) => state.items);
  const cartSummary = useCartSummary();
  const [couponSubmitError, setCouponSubmitError] = useState("");
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      apartment: "",
      city: "",
      postalCode: "",
      deliveryMethod: "standard",
      paymentMethod: "cashOnDelivery",
    },
  });
  const { errors, isSubmitting } = form.formState;
  const deliveryMethod = form.watch("deliveryMethod");
  const paymentMethod = form.watch("paymentMethod");
  const summaryItems = mapCartItems(cartItems);
  const {
    subtotal,
    deliveryFee,
    couponDiscount,
    shippingDiscount,
    total,
    appliedCoupon,
    isCouponApplicable,
  } = cartSummary;
  const errorCount = Object.keys(errors).length;

  function handlePlaceOrder() {
    setCouponSubmitError("");

    if (appliedCoupon) {
      const result = validateCoupon(appliedCoupon.code, subtotal);

      if (!result.isValid) {
        setCouponSubmitError(
          result.error ?? "Coupon no longer applies to this order.",
        );
        return;
      }
    }

    // Future backend/BMS order creation must revalidate coupons server-side.
  }

  if (!cartItems.length) {
    return <EmptyCheckoutState />;
  }

  return (
    <form
      id="checkout-form"
      className="relative min-w-0 max-w-full pb-24 md:pb-0"
      onSubmit={form.handleSubmit(handlePlaceOrder)}
      noValidate
    >
      {errorCount > 0 ? (
        <div
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          Review the highlighted checkout details before placing the order.
        </div>
      ) : null}
      {couponSubmitError ? (
        <div
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {couponSubmitError}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="grid min-w-0 gap-4">
          <CheckoutSection
            icon={<User className="h-4 w-4" aria-hidden="true" />}
            step="01"
            title="Contact Information"
            description="Where we send delivery updates and order confirmation."
          >
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <CheckoutField
                id="checkout-full-name"
                label="Full Name"
                error={errors.fullName}
              >
                <CheckoutInput
                  id="checkout-full-name"
                  autoComplete="name"
                  inputMode="text"
                  placeholder="Your name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "checkout-full-name-error" : undefined
                  }
                  {...form.register("fullName")}
                />
              </CheckoutField>

              <CheckoutField
                id="checkout-phone"
                label="Phone Number"
                error={errors.phone}
              >
                <CheckoutInput
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+880 1XXX XXXXXX"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "checkout-phone-error" : undefined
                  }
                  {...form.register("phone")}
                />
              </CheckoutField>

              <CheckoutField
                id="checkout-email"
                label="Email Address"
                error={errors.email}
              >
                <CheckoutInput
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "checkout-email-error" : undefined
                  }
                  {...form.register("email")}
                />
              </CheckoutField>
            </div>
          </CheckoutSection>

          <CheckoutSection
            icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
            step="02"
            title="Delivery Address"
            description="Add a reachable address and choose your delivery option."
          >
            <div className="grid min-w-0 gap-4">
              <CheckoutField
                id="checkout-address"
                label="Address"
                error={errors.address}
              >
                <CheckoutInput
                  id="checkout-address"
                  autoComplete="address-line1"
                  inputMode="text"
                  placeholder="House, road, area"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={
                    errors.address ? "checkout-address-error" : undefined
                  }
                  {...form.register("address")}
                />
              </CheckoutField>

              <CheckoutField
                id="checkout-apartment"
                label="Apartment / Landmark"
                error={errors.apartment}
              >
                <CheckoutInput
                  id="checkout-apartment"
                  autoComplete="address-line2"
                  inputMode="text"
                  placeholder="Optional"
                  aria-invalid={Boolean(errors.apartment)}
                  aria-describedby={
                    errors.apartment ? "checkout-apartment-error" : undefined
                  }
                  {...form.register("apartment")}
                />
              </CheckoutField>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <CheckoutField
                  id="checkout-city"
                  label="City"
                  error={errors.city}
                >
                  <CheckoutInput
                    id="checkout-city"
                    autoComplete="address-level2"
                    inputMode="text"
                    placeholder="Dhaka"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={
                      errors.city ? "checkout-city-error" : undefined
                    }
                    {...form.register("city")}
                  />
                </CheckoutField>

                <CheckoutField
                  id="checkout-postal-code"
                  label="Postal Code"
                  error={errors.postalCode}
                >
                  <CheckoutInput
                    id="checkout-postal-code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    placeholder="Optional"
                    aria-invalid={Boolean(errors.postalCode)}
                    aria-describedby={
                      errors.postalCode
                        ? "checkout-postal-code-error"
                        : undefined
                    }
                    {...form.register("postalCode")}
                  />
                </CheckoutField>
              </div>

              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Delivery Method
                </p>
                <SelectableCard
                  checked={deliveryMethod === "standard"}
                  control={
                    <input
                      type="radio"
                      value="standard"
                      className="sr-only"
                      {...form.register("deliveryMethod")}
                    />
                  }
                  icon={<Truck className="h-4 w-4" aria-hidden="true" />}
                  title="Standard Delivery"
                  description="Estimated 2-4 business days after confirmation."
                  meta={<Price price={deliveryFee} className="justify-end" />}
                />
                <div className="flex min-w-0 items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-3 text-muted-foreground">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Express Delivery
                    </p>
                    <p className="text-xs leading-5">Coming soon.</p>
                  </div>
                </div>
                {errors.deliveryMethod ? (
                  <FieldErrorMessage
                    id="checkout-delivery-method-error"
                    message={errors.deliveryMethod.message}
                  />
                ) : null}
              </div>
            </div>
          </CheckoutSection>

          <CheckoutSection
            icon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
            step="03"
            title="Payment Method"
            description="Choose how you want to pay for this order."
          >
            <div className="grid min-w-0 gap-3">
              <SelectableCard
                checked={paymentMethod === "cashOnDelivery"}
                control={
                  <input
                    type="radio"
                    value="cashOnDelivery"
                    className="sr-only"
                    {...form.register("paymentMethod")}
                  />
                }
                icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
                title="Cash on Delivery"
                description="Pay in cash when your order arrives."
                meta="Selected"
              />

              <div className="flex min-w-0 items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-3 text-muted-foreground">
                <CreditCard
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Online Payment
                  </p>
                  <p className="text-xs leading-5">Coming soon.</p>
                </div>
              </div>
              {errors.paymentMethod ? (
                <FieldErrorMessage
                  id="checkout-payment-method-error"
                  message={errors.paymentMethod.message}
                />
              ) : null}
            </div>
          </CheckoutSection>
        </div>

        <OrderSummary
          items={summaryItems}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          couponDiscount={couponDiscount}
          shippingDiscount={shippingDiscount}
          total={total}
          appliedCouponCode={appliedCoupon?.code}
          isCouponApplicable={isCouponApplicable}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <Price price={total} className="shrink-0 justify-end text-lg" />
        </div>
        <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
          Place Order
        </Button>
      </div>
    </form>
  );
}

function CheckoutSection({
  icon,
  step,
  title,
  description,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="min-w-0 rounded-xl border bg-background p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step {step}
          </p>
          <h2 className="mt-1 text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CheckoutField({ id, label, error, children }: CheckoutFieldProps) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <FieldErrorMessage id={`${id}-error`} message={error.message} />
      ) : null}
    </div>
  );
}

function CheckoutInput(props: React.ComponentPropsWithoutRef<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-12 min-h-12 rounded-lg border-zinc-200 bg-white px-3.5 shadow-sm focus-visible:ring-black",
        props.className,
      )}
    />
  );
}

function FieldErrorMessage({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm leading-5 text-destructive" role="alert">
      {message}
    </p>
  );
}

function SelectableCard({
  checked,
  control,
  icon,
  title,
  description,
  meta,
}: {
  checked: boolean;
  control: ReactNode;
  icon: ReactNode;
  title: string;
  description: string;
  meta?: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 shadow-sm transition-colors",
        checked ? "border-black ring-1 ring-black" : "border-zinc-200",
      )}
    >
      {control}
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          checked
            ? "border-black bg-black text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-600",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      {meta ? (
        <span className="shrink-0 text-right text-xs font-semibold text-foreground">
          {meta}
        </span>
      ) : null}
    </label>
  );
}

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  couponDiscount,
  shippingDiscount,
  total,
  appliedCouponCode,
  isCouponApplicable,
  isSubmitting,
}: {
  items: SummaryItem[];
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  shippingDiscount: number;
  total: number;
  appliedCouponCode?: string;
  isCouponApplicable: boolean;
  isSubmitting: boolean;
}) {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <aside className="min-w-0 rounded-xl border bg-background p-4 shadow-sm lg:sticky lg:top-24">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step 04
          </p>
          <h2 className="mt-1 text-base font-semibold">Order Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your order
          </p>
        </div>
        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-5 grid min-w-0 gap-3">
        {items.map((item) => (
          <SummaryProductRow key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-5 grid gap-3 border-t pt-4 text-sm">
        <SummaryRow label="Subtotal" value={<Price price={subtotal} />} />
        <SummaryRow label="Delivery Fee" value={<Price price={deliveryFee} />} />
        {couponDiscount > 0 && appliedCouponCode ? (
          <SummaryRow
            label={`Coupon Discount (${appliedCouponCode})`}
            value={
              <Price
                price={-couponDiscount}
                className="justify-end text-emerald-700"
              />
            }
          />
        ) : null}
        {shippingDiscount > 0 && appliedCouponCode ? (
          <SummaryRow
            label={`Shipping Discount (${appliedCouponCode})`}
            value={
              <Price
                price={-shippingDiscount}
                className="justify-end text-emerald-700"
              />
            }
          />
        ) : null}
        {appliedCouponCode && !isCouponApplicable ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Coupon no longer applies to this order.
          </p>
        ) : null}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="text-base font-semibold">Grand Total</span>
          <Price price={total} className="shrink-0 justify-end text-lg" />
        </div>
        <Button
          type="submit"
          className="mt-4 hidden h-12 w-full md:inline-flex"
          disabled={isSubmitting}
        >
          Place Order
        </Button>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          This checkout is review-only for now. No order or payment is sent.
        </p>
      </div>
    </aside>
  );
}

function SummaryProductRow({ item }: { item: SummaryItem }) {
  return (
    <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-lg border border-zinc-200 bg-white p-2.5">
      <div className="relative h-[88px] overflow-hidden rounded-md bg-zinc-100">
        <Image
          src={item.imageSrc}
          alt={item.name}
          fill
          className="object-cover"
          sizes="72px"
        />
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-5">
              {item.name}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {item.color ? <span>Color: {item.color}</span> : null}
              {item.size ? <span>Size: {item.size}</span> : null}
            </div>
          </div>
          <Price
            price={getLineItemTotal(item)}
            className="shrink-0 justify-end text-sm"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
            Qty {item.quantity}
          </span>
          {item.inventoryLabel ? (
            <span
              className={cn(
                "rounded px-2 py-1 text-xs font-semibold",
                item.inventoryTone === "preorder" &&
                  "bg-blue-50 text-blue-700",
                item.inventoryTone === "low" && "bg-amber-50 text-amber-700",
                item.inventoryTone === "warning" && "bg-red-50 text-red-700",
              )}
            >
              {item.inventoryLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <div className="shrink-0 text-right">{value}</div>
    </div>
  );
}

function EmptyCheckoutState() {
  return (
    <div className="rounded-xl border bg-background p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
        <ShoppingBag className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Add products to your cart before checkout.
      </p>
      <Button className="mt-5 h-11 rounded-lg px-5" asChild>
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}

function mapCartItems(items: CartItem[]): SummaryItem[] {
  return items.map((item) => {
    const selectedVariant = item.product.variants.find(
      (variant) => variant.id === item.variantId,
    );
    const availability = selectedVariant
      ? getVariantAvailability(selectedVariant)
      : undefined;

    return {
      id: `${item.product.id}-${item.variantId ?? "default"}`,
      name: item.product.name,
      imageSrc: getImageUrl(
        item.product.images[0],
        defaultImagePlaceholders.product,
      ),
      color: selectedVariant?.color,
      size: selectedVariant?.size,
      quantity: item.quantity,
      price: item.product.price,
      inventoryLabel: getInventoryLabel(availability),
      inventoryTone: getInventoryTone(availability),
    };
  });
}

function getInventoryLabel(
  availability: ReturnType<typeof getVariantAvailability> | undefined,
) {
  if (!availability) {
    return undefined;
  }

  if (
    availability.status !== "pre_order" &&
    availability.status !== "low_stock" &&
    availability.status !== "out_of_stock"
  ) {
    return undefined;
  }

  return availability.label.replace("Â·", "·");
}

function getInventoryTone(
  availability: ReturnType<typeof getVariantAvailability> | undefined,
) {
  if (!availability) {
    return undefined;
  }

  if (availability.isPreorder) {
    return "preorder";
  }

  if (availability.status === "low_stock") {
    return "low";
  }

  if (availability.status === "out_of_stock") {
    return "warning";
  }

  return undefined;
}
