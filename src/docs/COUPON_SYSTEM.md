# Coupon System

This document describes the current frontend coupon flow and the expected shape
of a future Admin/BMS-backed coupon implementation.

## Current Frontend Flow

- Static coupon definitions live in `src/data/coupons.ts`.
- Coupon validation lives in `src/lib/coupons.ts`.
- Base cart pricing lives in `src/lib/pricing.ts`.
- Applied coupon state lives in `src/store/cart-store.ts` as an applied coupon
  snapshot.
- `src/hooks/use-cart-summary.ts` centralizes cart pricing, coupon
  revalidation, coupon discount calculation, shipping discount calculation, and
  final total calculation.
- The cart drawer and cart page use `src/components/cart/coupon-input.tsx` to
  apply or remove coupons.
- Checkout does not have its own coupon input. It reads the applied coupon from
  the cart store through `useCartSummary()`.
- Checkout revalidates the applied coupon before submit and blocks the current
  client-side submit flow if the coupon is invalid or no longer applies.

## Supported Coupon Types

- `percentage`: discounts the subtotal by a percentage.
- `fixed`: discounts the subtotal by a fixed amount, capped at the subtotal.
- `free_shipping`: discounts the delivery fee.

## Existing Test Coupons

- `SAVE10`: 10 percent discount, minimum order 1000.
- `SAVE200`: 200 fixed discount, minimum order 1500.
- `FREESHIP`: free shipping, minimum order 800.
- `EXPIRED10`: expired 10 percent discount used to verify rejection.

## Current Limitations

- Validation is frontend-only.
- Customer usage is not tracked.
- `maxUses` is defined in the coupon type but not enforced.
- `maxUsesPerCustomer` is defined in the coupon type but not enforced.
- Backend order validation is not implemented yet.
- There is no database coupon table yet.

## Future Admin/BMS Coupon Model

A future coupon table should include at least:

- `id`
- `code`
- `type`
- `value`
- `minimumOrder`
- `startsAt`
- `validUntil`
- `isActive`
- `maxUses`
- `usedCount`
- `maxUsesPerCustomer`
- `createdAt`
- `updatedAt`

## Future Server-Side Validation Flow

1. Customer submits checkout with the current cart and applied coupon code.
2. Backend validates the coupon against the database and customer/order rules.
3. Backend recalculates subtotal, delivery fee, coupon discount, shipping
   discount, and grand total from trusted product and delivery data.
4. Backend creates the order with a coupon snapshot.
5. BMS/admin records coupon usage and increments or decrements usage counters as
   appropriate for the final order lifecycle.

## Order Snapshot Recommendation

Orders should store the coupon and pricing values used at creation time:

- `couponId`
- `couponCode`
- `couponType`
- `couponValue`
- `couponDiscount`
- `shippingDiscount`
- `subtotal`
- `deliveryFee`
- `grandTotal`

## Developer Warning

Client totals are preview only. The server/BMS must be the source of truth for
coupon validation, pricing, usage tracking, and final order totals.
