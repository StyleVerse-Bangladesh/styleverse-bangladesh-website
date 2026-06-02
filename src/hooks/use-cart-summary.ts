import { useCartStore } from "@/store/cart-store";
import { applyCouponToPricing, validateCoupon } from "@/lib/coupons";
import { getOrderPricing } from "@/lib/pricing";

export function useCartSummary() {
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const pricing = getOrderPricing(items);
  const couponValidation = appliedCoupon
    ? validateCoupon(appliedCoupon.code, pricing.subtotal)
    : undefined;
  const isCouponApplicable = Boolean(couponValidation?.isValid);
  const couponPricing =
    couponValidation?.coupon && isCouponApplicable
      ? applyCouponToPricing(pricing, couponValidation.coupon)
      : {
          ...pricing,
          couponDiscount: 0,
          shippingDiscount: 0,
        };

  return {
    itemCount,
    subtotal: couponPricing.subtotal,
    deliveryFee: couponPricing.deliveryFee,
    discount: couponPricing.discount,
    couponDiscount: couponPricing.couponDiscount,
    shippingDiscount: couponPricing.shippingDiscount,
    total: couponPricing.total,
    appliedCoupon,
    isCouponApplicable,
  };
}
