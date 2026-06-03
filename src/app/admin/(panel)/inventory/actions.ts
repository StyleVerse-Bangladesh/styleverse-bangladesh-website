"use server";

import { revalidatePath } from "next/cache";
import { InventoryStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export type InventoryActionState = {
  error?: string;
  message?: string;
  ok?: boolean;
};

type StockOperation = "decrease" | "increase" | "set";

const inventoryStatuses = [
  InventoryStatus.IN_STOCK,
  InventoryStatus.LOW_STOCK,
  InventoryStatus.OUT_OF_STOCK,
  InventoryStatus.PRE_ORDER,
] as const;

export async function updateVariantStockAction(
  _state: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const adminUserId = await getActiveAdminId();

  if (!adminUserId) {
    return errorState("Admin session expired. Sign in again.");
  }

  const variantId = readRequiredString(formData, "variantId");
  const operation = parseStockOperation(readRequiredString(formData, "operation"));
  const quantity = parseInteger(readRequiredString(formData, "quantity"));
  const submittedReason = readRequiredString(formData, "reason");

  if (!variantId) {
    return errorState("Variant id is required.");
  }

  if (!operation) {
    return errorState("Choose a valid stock operation.");
  }

  if (quantity === null || quantity < 0) {
    return errorState("Stock quantity must be zero or greater.");
  }

  if (operation !== "set" && quantity === 0) {
    return errorState("Stock adjustment must be greater than zero.");
  }

  const result = await db.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!variant) {
      return errorState("Variant no longer exists.");
    }

    const previousStock = variant.stock;
    const newStock =
      operation === "increase"
        ? previousStock + quantity
        : operation === "decrease"
          ? previousStock - quantity
          : quantity;

    if (newStock < 0) {
      return errorState("Stock cannot go below zero.");
    }

    const changeQuantity = newStock - previousStock;

    if (changeQuantity === 0) {
      return successState("Stock is already set to that value.");
    }

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stock: newStock },
    });

    await tx.inventoryMovement.create({
      data: {
        adminUserId,
        changeQuantity,
        newStock,
        previousStock,
        reason:
          submittedReason ||
          buildDefaultStockReason(operation, changeQuantity, variant.product.name),
        variantId: variant.id,
      },
    });

    return successState(
      `Stock updated from ${previousStock} to ${newStock}.`,
    );
  });

  revalidateInventory();

  return result;
}

export async function updateVariantStatusAction(
  _state: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const variantId = readRequiredString(formData, "variantId");
  const status = parseInventoryStatus(readRequiredString(formData, "status"));
  const lowStockThreshold = parseOptionalInteger(
    readRequiredString(formData, "lowStockThreshold"),
  );

  if (!variantId) {
    return errorState("Variant id is required.");
  }

  if (!status) {
    return errorState("Choose a valid inventory status.");
  }

  if (lowStockThreshold !== null && lowStockThreshold < 0) {
    return errorState("Low stock threshold cannot be negative.");
  }

  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true },
  });

  if (!variant) {
    return errorState("Variant no longer exists.");
  }

  await db.productVariant.update({
    where: { id: variant.id },
    data: {
      lowStockThreshold,
      status,
    },
  });

  revalidateInventory();

  return successState("Inventory status saved.");
}

export async function updatePreorderAction(
  _state: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const variantId = readRequiredString(formData, "variantId");
  const enabled = formData.get("preorderEnabled") === "on";
  const shipsAt = parseOptionalDate(readRequiredString(formData, "shipsAt"));
  const limitQuantity = parseOptionalInteger(
    readRequiredString(formData, "limitQuantity"),
  );

  if (!variantId) {
    return errorState("Variant id is required.");
  }

  if (limitQuantity !== null && limitQuantity < 0) {
    return errorState("Preorder limit cannot be negative.");
  }

  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true },
  });

  if (!variant) {
    return errorState("Variant no longer exists.");
  }

  if (!enabled) {
    await db.preorderSetting.deleteMany({
      where: { variantId: variant.id },
    });

    revalidateInventory();

    return successState("Preorder disabled.");
  }

  await db.preorderSetting.upsert({
    where: { variantId: variant.id },
    update: {
      enabled: true,
      limitQuantity,
      shipsAt,
    },
    create: {
      enabled: true,
      limitQuantity,
      shipsAt,
      variantId: variant.id,
    },
  });

  revalidateInventory();

  return successState("Preorder settings saved.");
}

async function getActiveAdminId() {
  let session;

  try {
    session = await getSession();
  } catch {
    return null;
  }

  if (!session) {
    return null;
  }

  const admin = await db.adminUser.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      isActive: true,
    },
  });

  return admin?.isActive ? admin.id : null;
}

function readRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseStockOperation(value: string): StockOperation | null {
  if (value === "decrease" || value === "increase" || value === "set") {
    return value;
  }

  return null;
}

function parseInventoryStatus(value: string) {
  return inventoryStatuses.find((status) => status === value) ?? null;
}

function parseInteger(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInteger(value: string) {
  return value ? parseInteger(value) : null;
}

function parseOptionalDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function buildDefaultStockReason(
  operation: StockOperation,
  changeQuantity: number,
  productName: string,
) {
  if (operation === "set") {
    return `Manual stock set for ${productName}`;
  }

  return changeQuantity > 0
    ? `Manual stock increase for ${productName}`
    : `Manual stock decrease for ${productName}`;
}

function revalidateInventory() {
  try {
    revalidatePath("/admin/inventory");
  } catch {
    // Keep Server Action responses valid if invoked outside Next's request store.
  }
}

function successState(message: string): InventoryActionState {
  return {
    message,
    ok: true,
  };
}

function errorState(error: string): InventoryActionState {
  return {
    error,
    ok: false,
  };
}
