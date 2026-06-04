import { InventoryStatus, ProductGender, ProductStatus } from "@prisma/client";
import type { Category } from "@/data/category-taxonomy";
import { flattenCategories } from "@/data/category-db";
import { db } from "@/lib/db";
import type { InventoryStatus as StorefrontInventoryStatus, Product } from "@/types/product";

type PrismaProductRecord = Awaited<ReturnType<typeof getDatabaseProductRecords>>[number];

export async function getDatabaseProducts(
  categories: Category[],
): Promise<Product[]> {
  const products = await getDatabaseProductRecords();

  return products.map((product) =>
    mapPrismaProductToStorefrontProduct(product, categories),
  );
}

async function getDatabaseProductRecords() {
  return db.product.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      compareAtPrice: true,
      currency: true,
      gender: true,
      id: true,
      images: {
        orderBy: [{ sortOrder: "asc" }],
        select: {
          url: true,
        },
      },
      isDiscounted: true,
      isNew: true,
      name: true,
      price: true,
      primaryCategory: {
        select: {
          id: true,
          label: true,
          path: true,
          slug: true,
        },
      },
      primaryCategoryId: true,
      productCategories: {
        select: {
          category: {
            select: {
              id: true,
              label: true,
              path: true,
              slug: true,
            },
          },
          categoryId: true,
        },
      },
      slug: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: [{ size: "asc" }, { colorName: "asc" }],
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
          size: true,
          status: true,
          stock: true,
        },
      },
    },
    where: {
      status: ProductStatus.PUBLISHED,
    },
  });
}

export function mapPrismaProductToStorefrontProduct(
  product: PrismaProductRecord,
  categories: Category[],
): Product {
  const allCategories = flattenCategories(categories);
  const primaryCategory =
    allCategories.find((category) => category.id === product.primaryCategoryId) ??
    allCategories.find((category) =>
      arePathsEqual(category.path, product.primaryCategory?.path ?? []),
    );
  const productCategoryIds = product.productCategories.map(
    (item) => item.categoryId,
  );
  const categoryPath = primaryCategory?.path ?? product.primaryCategory?.path ?? [];
  const categoryLabel = primaryCategory?.label ?? product.primaryCategory?.label ?? "Products";
  const productColors = getProductColors(product);
  const productSizes = getProductSizes(product);

  return {
    category: categoryLabel,
    categoryIds: uniqueStrings([
      product.primaryCategoryId,
      ...productCategoryIds,
    ].filter((value): value is string => Boolean(value))),
    categoryPath,
    categorySlug: categoryPath[1] ?? primaryCategory?.slug ?? product.primaryCategory?.slug,
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : undefined,
    currency: product.currency === "BDT" ? "BDT" : "BDT",
    department: mapDepartment(categoryPath[0]),
    gender: mapProductGender(product.gender),
    id: product.id,
    images: product.images.map((image) => image.url),
    isDiscounted: product.isDiscounted,
    isNew: product.isNew,
    name: product.name,
    price: Number(product.price),
    primaryCategoryId: product.primaryCategoryId ?? undefined,
    sizes: productSizes,
    slug: product.slug,
    subcategory: getSubcategoryLabel(categoryPath, allCategories),
    subcategorySlug: categoryPath[2],
    colors: productColors,
    variants: product.variants.map((variant) => ({
      color: variant.colorName,
      id: variant.id,
      lowStockThreshold: variant.lowStockThreshold ?? undefined,
      preorder: variant.preorderSetting?.enabled
        ? {
            enabled: true,
            limit: variant.preorderSetting.limitQuantity ?? undefined,
            shipsAt: variant.preorderSetting.shipsAt
              ? formatDateInput(variant.preorderSetting.shipsAt)
              : undefined,
          }
        : undefined,
      size: variant.size,
      status: mapInventoryStatus(variant.status),
      stock: variant.stock,
    })),
  };
}

function getProductColors(product: PrismaProductRecord) {
  const colorByName = new Map<string, { name: string; value: string }>();

  for (const variant of product.variants) {
    colorByName.set(variant.colorName.toLowerCase(), {
      name: variant.colorName,
      value: variant.colorValue,
    });
  }

  return Array.from(colorByName.values());
}

function getProductSizes(product: PrismaProductRecord) {
  return uniqueStrings(product.variants.map((variant) => variant.size));
}

function getSubcategoryLabel(path: string[], categories: Category[]) {
  if (path.length < 3) {
    return undefined;
  }

  return categories.find((category) => arePathsEqual(category.path, path))?.label;
}

function mapProductGender(gender: ProductGender): Product["gender"] {
  if (gender === ProductGender.MEN) {
    return "men";
  }

  if (gender === ProductGender.WOMEN) {
    return "women";
  }

  if (gender === ProductGender.KIDS) {
    return "kids";
  }

  return "unisex";
}

function mapDepartment(value: string | undefined): Product["department"] {
  if (
    value === "men" ||
    value === "women" ||
    value === "kids" ||
    value === "sports" ||
    value === "shoes" ||
    value === "accessories" ||
    value === "seasonal-fits"
  ) {
    return value;
  }

  return undefined;
}

function mapInventoryStatus(
  status: InventoryStatus,
): StorefrontInventoryStatus {
  if (status === InventoryStatus.LOW_STOCK) {
    return "low_stock";
  }

  if (status === InventoryStatus.OUT_OF_STOCK) {
    return "out_of_stock";
  }

  if (status === InventoryStatus.PRE_ORDER) {
    return "pre_order";
  }

  return "in_stock";
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function arePathsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
