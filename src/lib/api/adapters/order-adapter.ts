import type { AppliedCoupon, CartItem } from "@/types/cart";
import type { CreateOrderRequestDto } from "@/types/api/order.dto";

export type CheckoutOrderFormValues = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  deliveryMethod: string;
  paymentMethod: string;
};

export type OrderPricingSummary = {
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  shippingDiscount: number;
  total: number;
  appliedCoupon?: Pick<AppliedCoupon, "code">;
};

export type BuildCreateOrderPayloadInput = {
  items: CartItem[];
  checkoutValues: CheckoutOrderFormValues;
  pricingSummary: OrderPricingSummary;
};

/**
 * Builds the future BMS order creation payload from current checkout state.
 *
 * Future source of truth warning:
 * price, inventory, coupon validation, delivery fee, and totals must be
 * recalculated and validated by BMS/backend before an order is created.
 */
export function buildCreateOrderPayload({
  items,
  checkoutValues,
  pricingSummary,
}: BuildCreateOrderPayloadInput): CreateOrderRequestDto {
  return {
    customer: {
      fullName: checkoutValues.fullName,
      email: checkoutValues.email,
      phone: checkoutValues.phone,
    },
    address: {
      address: checkoutValues.address,
      apartment: normalizeOptionalValue(checkoutValues.apartment),
      city: checkoutValues.city,
      postalCode: normalizeOptionalValue(checkoutValues.postalCode),
    },
    items: items.map((item) => ({
      productId: item.product.id,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
      unitPrice: item.product.price,
    })),
    subtotal: pricingSummary.subtotal,
    deliveryFee: pricingSummary.deliveryFee,
    couponCode: normalizeOptionalValue(pricingSummary.appliedCoupon?.code),
    couponDiscount: pricingSummary.couponDiscount,
    shippingDiscount: pricingSummary.shippingDiscount,
    total: pricingSummary.total,
    paymentMethod: checkoutValues.paymentMethod,
    deliveryMethod: checkoutValues.deliveryMethod,
  };
}

function normalizeOptionalValue(value: string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}
