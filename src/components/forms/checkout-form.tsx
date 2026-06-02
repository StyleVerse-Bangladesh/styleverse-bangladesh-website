"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CreditCard, MapPin, Truck, User } from "lucide-react";
import { useForm, type FieldError } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/product/price";
import { products } from "@/data/catalog";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/cart";
import { validateCoupon } from "@/lib/coupons";
import { getLineItemTotal, getOrderPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { checkoutSchema, type CheckoutValues } from "./schemas";

type CheckoutSectionProps = {
  icon: ReactNode;
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
  detail: string;
  quantity: number;
  price: number;
};

const mockOrderItems: SummaryItem[] = products.slice(0, 2).map((product, index) => ({
  id: product.id,
  name: product.name,
  detail: index === 0 ? "Sample checkout item" : product.category,
  quantity: index === 0 ? 1 : 2,
  price: product.price,
}));

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
  const summaryItems = cartItems.length ? mapCartItems(cartItems) : mockOrderItems;
  const isMockOrder = cartItems.length === 0;
  const mockPricing = getOrderPricing(summaryItems);
  const subtotal = isMockOrder ? mockPricing.subtotal : cartSummary.subtotal;
  const deliveryFee = isMockOrder
    ? mockPricing.deliveryFee
    : cartSummary.deliveryFee;
  const couponDiscount = isMockOrder ? 0 : cartSummary.couponDiscount;
  const shippingDiscount = isMockOrder ? 0 : cartSummary.shippingDiscount;
  const total = isMockOrder ? mockPricing.total : cartSummary.total;
  const appliedCoupon = isMockOrder ? undefined : cartSummary.appliedCoupon;
  const isCouponApplicable = isMockOrder
    ? false
    : cartSummary.isCouponApplicable;
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

  return (
    <form
      id="checkout-form"
      className="relative min-w-0 max-w-full"
      onSubmit={form.handleSubmit(handlePlaceOrder)}
      noValidate
    >
      {errorCount > 0 ? (
        <div
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          Review the highlighted checkout details before placing the order.
        </div>
      ) : null}
      {couponSubmitError ? (
        <div
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {couponSubmitError}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="grid min-w-0 gap-5">
          <CheckoutSection
            icon={<User className="h-4 w-4" aria-hidden="true" />}
            title="Customer information"
            description="We will use these details for order updates."
          >
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <CheckoutField
                id="checkout-full-name"
                label="Full name"
                error={errors.fullName}
              >
                <Input
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
                label="Phone number"
                error={errors.phone}
              >
                <Input
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
                label="Email"
                error={errors.email}
              >
                <Input
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
            title="Shipping address"
            description="Add a reachable address for delivery inside Bangladesh."
          >
            <div className="grid min-w-0 gap-4">
              <CheckoutField
                id="checkout-address"
                label="Street address"
                error={errors.address}
              >
                <Input
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
                label="Apartment, floor, landmark"
                error={errors.apartment}
              >
                <Input
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
                  <Input
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
                  label="Postal code"
                  error={errors.postalCode}
                >
                  <Input
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
            </div>
          </CheckoutSection>

          <CheckoutSection
            icon={<Truck className="h-4 w-4" aria-hidden="true" />}
            title="Delivery method"
            description="Delivery options are placeholders for the storefront flow."
          >
            <div className="grid min-w-0 gap-3">
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                  deliveryMethod === "standard" && "border-primary bg-accent",
                )}
              >
                <input
                  type="radio"
                  value="standard"
                  className="mt-1 h-4 w-4 accent-primary"
                  {...form.register("deliveryMethod")}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    Standard delivery
                  </span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Estimated 2-4 business days after order confirmation.
                  </span>
                </span>
                <Price price={deliveryFee} className="ml-auto shrink-0 text-sm" />
              </label>

              <div className="flex min-h-11 items-start gap-3 rounded-md border border-dashed p-3 text-muted-foreground">
                <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Express delivery
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
          </CheckoutSection>

          <CheckoutSection
            icon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
            title="Payment method"
            description="No payment is collected in this frontend-only checkout."
          >
            <div className="grid min-w-0 gap-3">
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                  paymentMethod === "cashOnDelivery" &&
                    "border-primary bg-accent",
                )}
              >
                <input
                  type="radio"
                  value="cashOnDelivery"
                  className="mt-1 h-4 w-4 accent-primary"
                  {...form.register("paymentMethod")}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    Cash on delivery placeholder
                  </span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Review-only flow. No payment provider is connected.
                  </span>
                </span>
              </label>

              <div className="flex min-h-11 items-start gap-3 rounded-md border border-dashed p-3 text-muted-foreground">
                <CreditCard
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Online payment
                  </p>
                  <p className="text-xs leading-5">Gateway integration later.</p>
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
          isMockOrder={isMockOrder}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Estimated total</span>
          <Price price={total} className="shrink-0 text-base" />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          Place order
        </Button>
      </div>
    </form>
  );
}

function CheckoutSection({
  icon,
  title,
  description,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="min-w-0 rounded-md border bg-background p-4 sm:p-5">
      <div className="mb-4 flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
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

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  couponDiscount,
  shippingDiscount,
  total,
  appliedCouponCode,
  isCouponApplicable,
  isMockOrder,
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
  isMockOrder: boolean;
  isSubmitting: boolean;
}) {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <aside className="min-w-0 rounded-md border bg-background p-4 lg:sticky lg:top-24">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Order summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
      </div>

      {isMockOrder ? (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
          Showing a sample order until cart items are available in this session.
        </p>
      ) : null}

      <div className="mt-4 grid min-w-0 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex min-w-0 items-start justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.detail} x {item.quantity}
              </p>
            </div>
            <Price
              price={getLineItemTotal(item)}
              className="shrink-0 justify-end"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm">
        <SummaryRow label="Subtotal" value={<Price price={subtotal} />} />
        <SummaryRow label="Delivery" value={<Price price={deliveryFee} />} />
        {couponDiscount > 0 && appliedCouponCode ? (
          <SummaryRow
            label={`Coupon (${appliedCouponCode})`}
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
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Coupon no longer applies to this order.
          </p>
        ) : null}
        {!appliedCouponCode ? <SummaryRow label="Discount" value="None" /> : null}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="font-medium">Estimated total</span>
          <Price price={total} className="shrink-0 text-base" />
        </div>
        <Button
          type="submit"
          className="mt-4 hidden h-11 w-full md:inline-flex"
          disabled={isSubmitting}
        >
          Place order
        </Button>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Submitting validates this mock checkout only. No order or payment is
          sent.
        </p>
      </div>
    </aside>
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

function mapCartItems(items: CartItem[]): SummaryItem[] {
  return items.map((item) => {
    const selectedVariant = item.product.variants.find(
      (variant) => variant.id === item.variantId,
    );

    return {
      id: `${item.product.id}-${item.variantId ?? "default"}`,
      name: item.product.name,
      detail: selectedVariant
        ? `${selectedVariant.color} / ${selectedVariant.size}`
        : item.product.category,
      quantity: item.quantity,
      price: item.product.price,
    };
  });
}
