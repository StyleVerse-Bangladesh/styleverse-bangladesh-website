import { CouponType as PrismaCouponType } from "@prisma/client";
import { db } from "@/lib/db";
import { validateCoupon } from "@/lib/coupons";
import type { Coupon, CouponType } from "@/types/coupon";

type CouponValidationResult = {
  error?: string;
  isValid: boolean;
  source: "database" | "static";
  coupon?: Coupon;
};

type DatabaseCouponValidationResult =
  | CouponValidationResult
  | {
      error: string;
      isValid: false;
      reason: "not_found";
      source: "database";
    };

export async function validateCouponForStorefront(
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      error: "Coupon does not exist.",
      isValid: false,
      source: "database",
    };
  }

  if (!shouldUseDatabaseCoupons()) {
    return validateStaticCoupon(normalizedCode, subtotal);
  }

  try {
    const databaseResult = await validateDatabaseCoupon(normalizedCode, subtotal);

    if ("reason" in databaseResult && databaseResult.reason === "not_found") {
      return validateStaticCoupon(normalizedCode, subtotal);
    }

    return databaseResult;
  } catch {
    return validateStaticCoupon(normalizedCode, subtotal);
  }
}

function shouldUseDatabaseCoupons() {
  return process.env.COUPONS_FROM_DATABASE === "true";
}

async function validateDatabaseCoupon(
  code: string,
  subtotal: number,
): Promise<DatabaseCouponValidationResult> {
  const coupon = await db.coupon.findUnique({
    select: {
      code: true,
      id: true,
      isActive: true,
      maxUses: true,
      minimumOrder: true,
      type: true,
      usedCount: true,
      validUntil: true,
      value: true,
    },
    where: { code },
  });

  if (!coupon) {
    return {
      error: "Coupon does not exist.",
      isValid: false,
      reason: "not_found",
      source: "database",
    };
  }

  if (!coupon.isActive) {
    return {
      error: "Coupon is not active.",
      isValid: false,
      source: "database",
    };
  }

  if (coupon.validUntil && coupon.validUntil.getTime() < Date.now()) {
    return {
      error: "Coupon has expired.",
      isValid: false,
      source: "database",
    };
  }

  const minimumOrder = Number(coupon.minimumOrder ?? 0);

  if (minimumOrder > 0 && subtotal < minimumOrder) {
    return {
      error: `Minimum order is ${minimumOrder}.`,
      isValid: false,
      source: "database",
    };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return {
      error: "Coupon usage limit has been reached.",
      isValid: false,
      source: "database",
    };
  }

  return {
    coupon: {
      code: coupon.code,
      id: coupon.id,
      isActive: coupon.isActive,
      maxUses: coupon.maxUses ?? undefined,
      minimumOrder: minimumOrder || undefined,
      type: mapPrismaCouponType(coupon.type),
      validUntil: coupon.validUntil?.toISOString(),
      value: Number(coupon.value),
    },
    isValid: true,
    source: "database",
  };
}

function validateStaticCoupon(
  code: string,
  subtotal: number,
): CouponValidationResult {
  const result = validateCoupon(code, subtotal);

  return {
    ...result,
    source: "static",
  };
}

function mapPrismaCouponType(type: PrismaCouponType): CouponType {
  if (type === PrismaCouponType.PERCENTAGE) {
    return "percentage";
  }

  if (type === PrismaCouponType.FIXED) {
    return "fixed";
  }

  return "free_shipping";
}
