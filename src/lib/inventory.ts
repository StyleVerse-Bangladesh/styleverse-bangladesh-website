import type { InventoryStatus, Product, ProductVariant } from "@/types/product";

export const inventoryStatuses: readonly InventoryStatus[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "pre_order",
];

export type VariantAvailability = {
  status: InventoryStatus;
  label: string;
  buttonLabel: string;
  purchasable: boolean;
  isPreorder: boolean;
  availableQuantity: number;
  maxQuantity?: number;
  shipsAt?: string;
};

export type ProductAvailability = VariantAvailability & {
  variant?: ProductVariant;
};

export function getVariantAvailability(
  variant: ProductVariant,
): VariantAvailability {
  const isPreorder =
    variant.preorder?.enabled === true || variant.status === "pre_order";

  if (isPreorder) {
    const shipsAt = variant.preorder?.shipsAt;

    return {
      status: "pre_order",
      label: shipsAt ? `Pre Order · Ships by ${formatShipsAt(shipsAt)}` : "Pre Order",
      buttonLabel: "Pre Order",
      purchasable: true,
      isPreorder: true,
      availableQuantity: 0,
      maxQuantity: variant.preorder?.limit,
      shipsAt,
    };
  }

  if (variant.stock <= 0) {
    return {
      status: "out_of_stock",
      label: "Out of Stock",
      buttonLabel: "Out of Stock",
      purchasable: false,
      isPreorder: false,
      availableQuantity: 0,
      maxQuantity: 0,
    };
  }

  const lowStockThreshold = variant.lowStockThreshold ?? 0;

  if (variant.stock <= lowStockThreshold) {
    return {
      status: "low_stock",
      label: `Only ${variant.stock} left`,
      buttonLabel: "Add To Cart",
      purchasable: true,
      isPreorder: false,
      availableQuantity: variant.stock,
      maxQuantity: variant.stock,
    };
  }

  return {
    status: "in_stock",
    label: "In Stock",
    buttonLabel: "Add To Cart",
    purchasable: true,
    isPreorder: false,
    availableQuantity: variant.stock,
    maxQuantity: variant.stock,
  };
}

export function getProductAvailability(product: Product): ProductAvailability {
  const variant = findPurchasableVariant(product);

  if (variant) {
    return {
      ...getVariantAvailability(variant),
      variant,
    };
  }

  return {
    status: "out_of_stock",
    label: "Out of Stock",
    buttonLabel: "Out of Stock",
    purchasable: false,
    isPreorder: false,
    availableQuantity: 0,
    maxQuantity: 0,
  };
}

export function findPurchasableVariant(product: Product) {
  return (
    product.variants.find((variant) => {
      const availability = getVariantAvailability(variant);

      return availability.purchasable && !availability.isPreorder;
    }) ??
    product.variants.find((variant) => getVariantAvailability(variant).purchasable)
  );
}

function formatShipsAt(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}
