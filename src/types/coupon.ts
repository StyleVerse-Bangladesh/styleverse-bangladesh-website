export type CouponType = "percentage" | "fixed" | "free_shipping";

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minimumOrder?: number;
  validUntil?: string;
  isActive: boolean;
  maxUses?: number;
  maxUsesPerCustomer?: number;
};
