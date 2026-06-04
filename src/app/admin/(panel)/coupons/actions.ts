"use server";

import { revalidatePath } from "next/cache";
import { CouponType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type CouponActionState = {
  message?: string;
  status?: "error" | "success";
  values?: {
    code?: string;
    isActive?: boolean;
    maxUses?: string;
    maxUsesPerCustomer?: string;
    minimumOrder?: string;
    type?: string;
    validUntil?: string;
    value?: string;
  };
};

type CouponMutationInput = {
  code: string;
  isActive: boolean;
  maxUses: number | null;
  maxUsesPerCustomer: number | null;
  minimumOrder: string | null;
  type: CouponType | null;
  validUntil: Date | null;
  validUntilInput: string;
  value: string | null;
};

const couponTypes = [
  CouponType.PERCENTAGE,
  CouponType.FIXED,
  CouponType.FREE_SHIPPING,
] as const;

export async function createCouponAction(
  _state: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const input = parseCouponFormData(formData);
  const validationError = await validateCouponInput(input);

  if (validationError) {
    return errorState(validationError, input);
  }

  try {
    await db.coupon.create({
      data: {
        code: input.code,
        isActive: input.isActive,
        maxUses: input.maxUses,
        maxUsesPerCustomer: input.maxUsesPerCustomer,
        minimumOrder: input.minimumOrder,
        type: input.type ?? CouponType.PERCENTAGE,
        validUntil: input.validUntil,
        value: input.value ?? "0.00",
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorState("Another coupon already uses this code.", input);
    }

    throw error;
  }

  revalidateCoupons();

  return {
    message: `${input.code} created.`,
    status: "success",
  };
}

export async function updateCouponAction(
  _state: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const id = readRequiredString(formData, "id");
  const input = parseCouponFormData(formData);

  if (!id) {
    return errorState("Coupon id is required.", input);
  }

  const existingCoupon = await db.coupon.findUnique({
    select: { id: true },
    where: { id },
  });

  if (!existingCoupon) {
    return errorState("Coupon no longer exists.", input);
  }

  const validationError = await validateCouponInput(input, id);

  if (validationError) {
    return errorState(validationError, input);
  }

  try {
    await db.coupon.update({
      data: {
        code: input.code,
        isActive: input.isActive,
        maxUses: input.maxUses,
        maxUsesPerCustomer: input.maxUsesPerCustomer,
        minimumOrder: input.minimumOrder,
        type: input.type ?? CouponType.PERCENTAGE,
        validUntil: input.validUntil,
        value: input.value ?? "0.00",
      },
      where: { id },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorState("Another coupon already uses this code.", input);
    }

    throw error;
  }

  revalidateCoupons();

  return {
    message: `${input.code} saved.`,
    status: "success",
  };
}

export async function toggleCouponStatusAction(
  _state: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return {
      message: "Coupon id is required.",
      status: "error",
    };
  }

  const coupon = await db.coupon.findUnique({
    select: {
      code: true,
      isActive: true,
    },
    where: { id },
  });

  if (!coupon) {
    return {
      message: "Coupon no longer exists.",
      status: "error",
    };
  }

  await db.coupon.update({
    data: { isActive: !coupon.isActive },
    where: { id },
  });

  revalidateCoupons();

  return {
    message: `${coupon.code} ${coupon.isActive ? "deactivated" : "activated"}.`,
    status: "success",
  };
}

export async function deleteCouponAction(
  _state: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return {
      message: "Coupon id is required.",
      status: "error",
    };
  }

  const coupon = await db.coupon.findUnique({
    select: {
      _count: {
        select: {
          orders: true,
          redemptions: true,
        },
      },
      code: true,
      usedCount: true,
    },
    where: { id },
  });

  if (!coupon) {
    return {
      message: "Coupon no longer exists.",
      status: "error",
    };
  }

  const hasHistory =
    coupon.usedCount > 0 || coupon._count.redemptions > 0 || coupon._count.orders > 0;

  if (hasHistory) {
    await db.coupon.update({
      data: { isActive: false },
      where: { id },
    });

    revalidateCoupons();

    return {
      message: `${coupon.code} has redemption history, so it was deactivated instead of deleted.`,
      status: "success",
    };
  }

  await db.coupon.delete({
    where: { id },
  });

  revalidateCoupons();

  return {
    message: `${coupon.code} deleted.`,
    status: "success",
  };
}

function parseCouponFormData(formData: FormData): CouponMutationInput {
  const code = readRequiredString(formData, "code").toUpperCase();
  const type = parseCouponType(readRequiredString(formData, "type"));
  const value = parseDecimalInput(readRequiredString(formData, "value"));
  const minimumOrder = parseOptionalDecimalInput(
    readRequiredString(formData, "minimumOrder"),
  );
  const maxUses = parseOptionalInteger(readRequiredString(formData, "maxUses"));
  const maxUsesPerCustomer = parseOptionalInteger(
    readRequiredString(formData, "maxUsesPerCustomer"),
  );
  const validUntilInput = readRequiredString(formData, "validUntil");

  return {
    code,
    isActive: formData.get("isActive") === "on",
    maxUses,
    maxUsesPerCustomer,
    minimumOrder,
    type,
    validUntil: parseOptionalDate(validUntilInput),
    validUntilInput,
    value,
  };
}

async function validateCouponInput(input: CouponMutationInput, couponId?: string) {
  if (!input.code) {
    return "Coupon code is required.";
  }

  if (!input.type) {
    return "Choose a valid coupon type.";
  }

  if (input.value === null || Number(input.value) < 0) {
    return "Value must be zero or greater.";
  }

  if (input.minimumOrder !== null && Number(input.minimumOrder) < 0) {
    return "Minimum order must be zero or greater.";
  }

  if (input.maxUses !== null && input.maxUses < 0) {
    return "Max uses must be zero or greater.";
  }

  if (input.maxUsesPerCustomer !== null && input.maxUsesPerCustomer < 0) {
    return "Max uses per customer must be zero or greater.";
  }

  if (input.validUntilInput && !input.validUntil) {
    return "Valid until must be a valid date.";
  }

  const codeMatch = await db.coupon.findUnique({
    select: { id: true },
    where: { code: input.code },
  });

  if (codeMatch && codeMatch.id !== couponId) {
    return "Another coupon already uses this code.";
  }

  return null;
}

function parseCouponType(value: string) {
  return couponTypes.find((type) => type === value) ?? null;
}

function parseDecimalInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed.toFixed(2);
}

function parseOptionalDecimalInput(value: string) {
  return value ? parseDecimalInput(value) : null;
}

function parseOptionalInteger(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T23:59:59.999Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function readRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function revalidateCoupons() {
  try {
    revalidatePath("/admin/coupons");
  } catch {
    // Keep action responses valid if invoked outside Next's request store.
  }
}

function errorState(
  message: string,
  input: CouponMutationInput,
): CouponActionState {
  return {
    message,
    status: "error",
    values: {
      code: input.code,
      isActive: input.isActive,
      maxUses: input.maxUses === null ? "" : String(input.maxUses),
      maxUsesPerCustomer:
        input.maxUsesPerCustomer === null ? "" : String(input.maxUsesPerCustomer),
      minimumOrder: input.minimumOrder ?? "",
      type: input.type ?? "",
      validUntil: input.validUntilInput,
      value: input.value ?? "",
    },
  };
}
