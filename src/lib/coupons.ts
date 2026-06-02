import { coupons } from "@/data/coupons";
import type { Coupon, CouponType } from "@/types/coupon";

type CouponValidationResult = {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
};

type CouponDiscountInput = {
  type: CouponType;
  value: number;
};

type PricingWithDiscounts = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

export function validateCoupon(
  code: string,
  subtotal: number,
): CouponValidationResult {
  const normalizedCode = code.trim().toUpperCase();
  const coupon = coupons.find((item) => item.code === normalizedCode);

  if (!normalizedCode || !coupon) {
    return {
      isValid: false,
      error: "Coupon does not exist.",
    };
  }

  if (!coupon.isActive) {
    return {
      isValid: false,
      error: "Coupon is not active.",
    };
  }

  if (isCouponExpired(coupon)) {
    return {
      isValid: false,
      error: "Coupon has expired.",
    };
  }

  if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
    return {
      isValid: false,
      error: `Minimum order is ${coupon.minimumOrder}.`,
    };
  }

  return {
    isValid: true,
    coupon,
  };
}

export function getCouponDiscount(
  coupon: CouponDiscountInput,
  subtotal: number,
  deliveryFee: number,
) {
  if (coupon.type === "percentage") {
    return (subtotal * coupon.value) / 100;
  }

  if (coupon.type === "fixed") {
    return Math.min(coupon.value, subtotal);
  }

  return deliveryFee;
}

export function applyCouponToPricing(
  pricing: PricingWithDiscounts,
  coupon: CouponDiscountInput,
) {
  const discount = getCouponDiscount(
    coupon,
    pricing.subtotal,
    pricing.deliveryFee,
  );
  const couponDiscount = coupon.type === "free_shipping" ? 0 : discount;
  const shippingDiscount = coupon.type === "free_shipping" ? discount : 0;
  const totalDiscount = couponDiscount + shippingDiscount;
  const total = pricing.subtotal - totalDiscount + pricing.deliveryFee;

  return {
    ...pricing,
    discount: totalDiscount,
    couponDiscount,
    shippingDiscount,
    total,
  };
}

function isCouponExpired(coupon: Coupon) {
  if (!coupon.validUntil) {
    return false;
  }

  const validUntil = new Date(coupon.validUntil);

  if (Number.isNaN(validUntil.getTime())) {
    return false;
  }

  validUntil.setHours(23, 59, 59, 999);

  return validUntil.getTime() < Date.now();
}
