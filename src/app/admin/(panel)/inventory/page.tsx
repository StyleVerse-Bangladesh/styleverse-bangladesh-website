import { InventoryStatus, type Prisma } from "@prisma/client";
import {
  InventoryAdminPage,
  type InventoryFilters,
  type InventoryItem,
  type InventoryStatusValue,
} from "@/app/admin/(panel)/inventory/inventory-admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Inventory",
};

type AdminInventoryPageProps = {
  searchParams?: Promise<{
    lowStock?: string;
    preorder?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function AdminInventoryPage({
  searchParams,
}: AdminInventoryPageProps) {
  const params = await searchParams;
  const filters = getFilters(params);
  const [items, summary] = await Promise.all([
    getInventoryItems(filters),
    getInventorySummary(),
  ]);

  return (
    <InventoryAdminPage filters={filters} items={items} summary={summary} />
  );
}

async function getInventoryItems(filters: InventoryFilters) {
  const variants = await db.productVariant.findMany({
    orderBy: [{ product: { name: "asc" } }, { size: "asc" }, { colorName: "asc" }],
    select: {
      colorName: true,
      colorValue: true,
      id: true,
      lowStockThreshold: true,
      preorderSetting: {
        select: {
          enabled: true,
          limitQuantity: true,
          shipsAt: true,
        },
      },
      product: {
        select: {
          images: {
            orderBy: [{ sortOrder: "asc" }],
            select: {
              alt: true,
              isPrimary: true,
              url: true,
            },
          },
          name: true,
          slug: true,
        },
      },
      size: true,
      sku: true,
      status: true,
      stock: true,
    },
    where: buildVariantWhere(filters),
  });
  const filteredVariants = filters.lowStockOnly
    ? variants.filter((variant) => isLowStock(variant))
    : variants;

  return filteredVariants.map<InventoryItem>((variant) => {
    const primaryImage =
      variant.product.images.find((image) => image.isPrimary) ??
      variant.product.images[0];

    return {
      colorName: variant.colorName,
      colorValue: variant.colorValue,
      id: variant.id,
      imageAlt: primaryImage?.alt ?? variant.product.name,
      imageUrl: primaryImage?.url ?? null,
      isLowStock: isLowStock(variant),
      lowStockThreshold:
        variant.lowStockThreshold === null
          ? ""
          : String(variant.lowStockThreshold),
      preorderEnabled: variant.preorderSetting?.enabled ?? false,
      preorderLimit:
        variant.preorderSetting?.limitQuantity === null ||
        variant.preorderSetting?.limitQuantity === undefined
          ? ""
          : String(variant.preorderSetting.limitQuantity),
      preorderShipsAt: variant.preorderSetting?.shipsAt
        ? formatDateInput(variant.preorderSetting.shipsAt)
        : "",
      preorderShipsAtLabel: variant.preorderSetting?.shipsAt
        ? formatDate(variant.preorderSetting.shipsAt)
        : "not set",
      productName: variant.product.name,
      productSlug: variant.product.slug,
      size: variant.size,
      sku: variant.sku ?? "",
      status: variant.status satisfies InventoryStatusValue,
      stock: variant.stock,
    };
  });
}

async function getInventorySummary() {
  const variants = await db.productVariant.findMany({
    where: { isActive: true },
    select: {
      lowStockThreshold: true,
      preorderSetting: {
        select: {
          enabled: true,
        },
      },
      status: true,
      stock: true,
    },
  });

  return {
    lowStock: variants.filter((variant) => isLowStock(variant)).length,
    outOfStock: variants.filter(
      (variant) => variant.status === InventoryStatus.OUT_OF_STOCK,
    ).length,
    preorder: variants.filter((variant) => variant.preorderSetting?.enabled)
      .length,
    total: variants.length,
  };
}

function buildVariantWhere(
  filters: InventoryFilters,
): Prisma.ProductVariantWhereInput {
  return {
    OR: filters.search
      ? [
          {
            sku: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            product: {
              name: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          },
        ]
      : undefined,
    isActive: true,
    preorderSetting: filters.preorderOnly
      ? {
          is: {
            enabled: true,
          },
        }
      : undefined,
    status: filters.status || undefined,
  };
}

function getFilters(
  params: Awaited<AdminInventoryPageProps["searchParams"]>,
): InventoryFilters {
  return {
    lowStockOnly: params?.lowStock === "1",
    preorderOnly: params?.preorder === "1",
    search: String(params?.search ?? "").trim(),
    status: parseInventoryStatus(params?.status) ?? "",
  };
}

function parseInventoryStatus(value: unknown): InventoryStatusValue | null {
  if (typeof value !== "string") {
    return null;
  }

  if (value in InventoryStatus) {
    return InventoryStatus[
      value as keyof typeof InventoryStatus
    ] as InventoryStatusValue;
  }

  return null;
}

function isLowStock(variant: {
  lowStockThreshold: number | null;
  status: InventoryStatus;
  stock: number;
}) {
  return (
    variant.status === InventoryStatus.LOW_STOCK ||
    (variant.lowStockThreshold !== null &&
      variant.stock <= variant.lowStockThreshold)
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
