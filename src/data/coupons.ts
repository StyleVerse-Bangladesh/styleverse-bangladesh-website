import type { Coupon } from "@/types/coupon";

export const coupons: Coupon[] = [
  {
    id: "coupon-save10",
    code: "SAVE10",
    type: "percentage",
    value: 10,
    minimumOrder: 1000,
    isActive: true,
  },
  {
    id: "coupon-save200",
    code: "SAVE200",
    type: "fixed",
    value: 200,
    minimumOrder: 1500,
    isActive: true,
  },
  {
    id: "coupon-freeship",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minimumOrder: 800,
    isActive: true,
  },
  {
    id: "coupon-expired10",
    code: "EXPIRED10",
    type: "percentage",
    value: 10,
    validUntil: "2025-01-01",
    isActive: true,
  },
];
