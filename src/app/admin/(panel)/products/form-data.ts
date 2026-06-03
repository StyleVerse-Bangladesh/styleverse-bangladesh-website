import type {
  ProductFormCategoryOption,
  ProductFormGender,
  ProductFormImage,
  ProductFormInventoryStatus,
  ProductFormStatus,
  ProductFormValues,
  ProductFormVariant,
} from "@/app/admin/(panel)/products/product-form";
import { db } from "@/lib/db";

export async function getProductFormCategories() {
  const categories = await db.category.findMany({
    orderBy: [{ pathKey: "asc" }],
    select: {
      depth: true,
      id: true,
      label: true,
      pathKey: true,
    },
  });

  return categories satisfies ProductFormCategoryOption[];
}

export function getBlankProductFormValues(): ProductFormValues {
  return {
    additionalCategoryIds: [],
    compareAtPrice: "",
    description: "",
    gender: "UNISEX",
    images: [],
    name: "",
    price: "0.00",
    primaryCategoryId: "",
    slug: "",
    status: "DRAFT",
    variants: [],
  };
}

export async function getProductFormValues(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    select: {
      compareAtPrice: true,
      description: true,
      gender: true,
      id: true,
      images: {
        orderBy: [{ sortOrder: "asc" }],
        select: {
          alt: true,
          id: true,
          isPrimary: true,
          url: true,
        },
      },
      name: true,
      price: true,
      primaryCategoryId: true,
      productCategories: {
        select: {
          categoryId: true,
          isPrimary: true,
        },
      },
      slug: true,
      status: true,
      variants: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          colorName: true,
          colorValue: true,
          id: true,
          lowStockThreshold: true,
          preorderSetting: {
            select: {
              limitQuantity: true,
              shipsAt: true,
            },
          },
          size: true,
          sku: true,
          status: true,
          stock: true,
        },
        where: {
          isActive: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const primaryCategoryId =
    product.primaryCategoryId ??
    product.productCategories.find((category) => category.isPrimary)
      ?.categoryId ??
    "";

  return {
    additionalCategoryIds: product.productCategories
      .filter((category) => !category.isPrimary)
      .map((category) => category.categoryId),
    compareAtPrice: product.compareAtPrice
      ? formatDecimal(Number(product.compareAtPrice))
      : "",
    description: product.description ?? "",
    gender: product.gender satisfies ProductFormGender,
    id: product.id,
    images: product.images.map<ProductFormImage>((image) => ({
      alt: image.alt ?? "",
      isPrimary: image.isPrimary,
      key: image.id,
      url: image.url,
    })),
    name: product.name,
    price: formatDecimal(Number(product.price)),
    primaryCategoryId,
    slug: product.slug,
    status: product.status satisfies ProductFormStatus,
    variants: product.variants.map<ProductFormVariant>((variant) => ({
      colorName: variant.colorName,
      colorValue: variant.colorValue,
      id: variant.id,
      key: variant.id,
      lowStockThreshold:
        variant.lowStockThreshold === null
          ? ""
          : String(variant.lowStockThreshold),
      preorderLimit:
        variant.preorderSetting?.limitQuantity === null ||
        variant.preorderSetting?.limitQuantity === undefined
          ? ""
          : String(variant.preorderSetting.limitQuantity),
      preorderShipsAt: variant.preorderSetting?.shipsAt
        ? formatDateInput(variant.preorderSetting.shipsAt)
        : "",
      size: variant.size,
      sku: variant.sku ?? "",
      status: variant.status satisfies ProductFormInventoryStatus,
      stock: String(variant.stock),
    })),
  } satisfies ProductFormValues;
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
