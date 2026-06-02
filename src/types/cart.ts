import type { Product } from "./product";
import type { CouponType } from "./coupon";

export type CartItem = {
  product: Product;
  variantId?: string;
  quantity: number;
};

export type AppliedCoupon = {
  code: string;
  couponId: string;
  type: CouponType;
  value: number;
  minimumOrder?: number;
};
