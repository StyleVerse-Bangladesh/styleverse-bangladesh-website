"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  InventoryStatus,
  Prisma,
  ProductGender,
  ProductStatus,
} from "@prisma/client";
import { db } from "@/lib/db";

export type ProductActionState = {
  message?: string;
  status?: "error" | "success";
};

export type ProductFormActionState = ProductActionState;

type ProductImageInput = {
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
  url: string;
};

type ProductVariantInput = {
  colorName: string;
  colorValue: string;
  id: string | null;
  lowStockThreshold: number | null;
  preorderLimit: number | null;
  preorderShipsAt: Date | null;
  size: string;
  sku: string | null;
  status: InventoryStatus;
  stock: number;
};

type ProductMutationInput = {
  additionalCategoryIds: string[];
  compareAtPrice: string | null;
  description: string | null;
  gender: ProductGender;
  images: ProductImageInput[];
  name: string;
  price: string;
  primaryCategoryId: string;
  slug: string;
  status: ProductStatus;
  variants: ProductVariantInput[];
};

export async function updateProductStatusAction(
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const id = readRequiredString(formData, "id");
  const status = parseProductStatus(readRequiredString(formData, "status"));

  if (!id) {
    return errorState("Product id is required.");
  }

  if (!status) {
    return errorState("Choose a valid product status.");
  }

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!product) {
    return errorState("Product no longer exists.");
  }

  await db.product.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/products");

  return {
    message: `${product.name} status updated.`,
    status: "success",
  };
}

export async function createProductAction(
  _state: ProductFormActionState,
  formData: FormData,
): Promise<ProductFormActionState> {
  const parsed = await parseAndValidateProductForm(formData);

  if (!isProductMutationInput(parsed)) {
    return parsed;
  }

  const product = await db.$transaction(async (tx) => {
    const createdProduct = await tx.product.create({
      data: {
        compareAtPrice: parsed.compareAtPrice,
        currency: "BDT",
        description: parsed.description,
        gender: parsed.gender,
        name: parsed.name,
        price: parsed.price,
        primaryCategoryId: parsed.primaryCategoryId,
        slug: parsed.slug,
        status: parsed.status,
      },
      select: { id: true },
    });

    await syncProductChildren(tx, createdProduct.id, parsed);

    return createdProduct;
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProductAction(
  _state: ProductFormActionState,
  formData: FormData,
): Promise<ProductFormActionState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return errorState("Product id is required.");
  }

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!product) {
    return errorState("Product no longer exists.");
  }

  const parsed = await parseAndValidateProductForm(formData, id);

  if (!isProductMutationInput(parsed)) {
    return parsed;
  }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        compareAtPrice: parsed.compareAtPrice,
        description: parsed.description,
        gender: parsed.gender,
        name: parsed.name,
        price: parsed.price,
        primaryCategoryId: parsed.primaryCategoryId,
        slug: parsed.slug,
        status: parsed.status,
      },
    });

    await syncProductChildren(tx, id, parsed);
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);

  return {
    message: "Product saved.",
    status: "success",
  };
}

export async function archiveProductAction(
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return errorState("Product id is required.");
  }

  const product = await db.product.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          orderItems: true,
        },
      },
      name: true,
      status: true,
    },
  });

  if (!product) {
    return errorState("Product no longer exists.");
  }

  if (product.status === ProductStatus.ARCHIVED) {
    return {
      message: `${product.name} is already archived.`,
      status: "success",
    };
  }

  await db.product.update({
    where: { id },
    data: { status: ProductStatus.ARCHIVED },
  });

  revalidatePath("/admin/products");

  return {
    message:
      product._count.orderItems > 0
        ? `${product.name} has order history, so it was archived instead of deleted.`
        : `${product.name} archived.`,
    status: "success",
  };
}

async function parseAndValidateProductForm(
  formData: FormData,
  productId?: string,
): Promise<ProductMutationInput | ProductFormActionState> {
  const name = readRequiredString(formData, "name");
  const slug = slugifyProduct(readRequiredString(formData, "slug") || name);
  const description = readNullableString(formData, "description");
  const status = parseProductStatus(readRequiredString(formData, "status"));
  const gender = parseProductGender(readRequiredString(formData, "gender"));
  const price = parseDecimalInput(readRequiredString(formData, "price"));
  const compareAtPrice = parseOptionalDecimalInput(
    readRequiredString(formData, "compareAtPrice"),
  );
  const primaryCategoryId = readRequiredString(formData, "primaryCategoryId");
  const additionalCategoryIds = uniqueStrings(
    formData.getAll("additionalCategoryIds").map((value) => String(value)),
  ).filter((categoryId) => categoryId !== primaryCategoryId);
  const images = parseImages(formData);
  const variants = parseVariants(formData);

  if (!name) {
    return errorState("Product name is required.");
  }

  if (!slug) {
    return errorState("Product slug is required.");
  }

  if (!status) {
    return errorState("Choose a valid product status.");
  }

  if (!gender) {
    return errorState("Choose a valid product gender.");
  }

  if (!primaryCategoryId) {
    return errorState("Primary category is required.");
  }

  if (!price || Number(price) < 0) {
    return errorState("Price must be zero or greater.");
  }

  if (compareAtPrice !== null && Number(compareAtPrice) < 0) {
    return errorState("Compare price must be zero or greater.");
  }

  const uniqueCategoryIds = uniqueStrings([
    primaryCategoryId,
    ...additionalCategoryIds,
  ]);
  const categoryCount = await db.category.count({
    where: { id: { in: uniqueCategoryIds } },
  });

  if (categoryCount !== uniqueCategoryIds.length) {
    return errorState("One or more selected categories no longer exist.");
  }

  const slugMatch = await db.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (slugMatch && slugMatch.id !== productId) {
    return errorState("Another product already uses this slug.");
  }

  const variantValidation = await validateVariants(variants, productId);

  if (variantValidation) {
    return errorState(variantValidation);
  }

  return {
    additionalCategoryIds,
    compareAtPrice,
    description,
    gender,
    images,
    name,
    price,
    primaryCategoryId,
    slug,
    status,
    variants,
  };
}

function parseImages(formData: FormData): ProductImageInput[] {
  const urls = formData.getAll("imageUrl").map((value) => String(value).trim());
  const alts = formData.getAll("imageAlt").map((value) => String(value).trim());
  const primaryImageIndex = parseInteger(
    readRequiredString(formData, "primaryImageIndex"),
  );
  const images = urls
    .map((url, index) => ({
      alt: alts[index] || null,
      originalIndex: index,
      url,
    }))
    .filter((image) => image.url);
  const selectedImageIndex = images.some(
    (image) => image.originalIndex === primaryImageIndex,
  )
    ? primaryImageIndex
    : images[0]?.originalIndex;

  return images.map((image, index) => ({
    alt: image.alt,
    isPrimary: image.originalIndex === selectedImageIndex,
    sortOrder: index,
    url: image.url,
  }));
}

function parseVariants(formData: FormData): ProductVariantInput[] {
  const ids = formData.getAll("variantId").map((value) => String(value).trim());
  const sizes = formData
    .getAll("variantSize")
    .map((value) => String(value).trim());
  const colorNames = formData
    .getAll("variantColorName")
    .map((value) => String(value).trim());
  const colorValues = formData
    .getAll("variantColorValue")
    .map((value) => String(value).trim());
  const skus = formData
    .getAll("variantSku")
    .map((value) => String(value).trim());
  const stocks = formData
    .getAll("variantStock")
    .map((value) => String(value).trim());
  const lowStockThresholds = formData
    .getAll("variantLowStockThreshold")
    .map((value) => String(value).trim());
  const statuses = formData
    .getAll("variantStatus")
    .map((value) => String(value).trim());
  const preorderShipsAt = formData
    .getAll("variantPreorderShipsAt")
    .map((value) => String(value).trim());
  const preorderLimits = formData
    .getAll("variantPreorderLimit")
    .map((value) => String(value).trim());
  const maxLength = Math.max(
    ids.length,
    sizes.length,
    colorNames.length,
    colorValues.length,
    skus.length,
    stocks.length,
    lowStockThresholds.length,
    statuses.length,
    preorderShipsAt.length,
    preorderLimits.length,
  );
  const variants: ProductVariantInput[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const size = sizes[index] ?? "";
    const colorName = colorNames[index] ?? "";
    const colorValue = colorValues[index] || "#000000";
    const sku = skus[index] || null;
    const stock = parseInteger(stocks[index] ?? "");
    const lowStockThreshold = parseOptionalInteger(
      lowStockThresholds[index] ?? "",
    );
    const status = parseInventoryStatus(statuses[index] ?? "");
    const preorderShipDate = parseOptionalDate(preorderShipsAt[index] ?? "");
    const preorderLimit = parseOptionalInteger(preorderLimits[index] ?? "");
    const rowHasData = [
      ids[index],
      size,
      colorName,
      colorValues[index],
      sku,
      stocks[index],
      lowStockThresholds[index],
      preorderShipsAt[index],
      preorderLimits[index],
    ].some((value) => String(value ?? "").trim());

    if (!rowHasData) {
      continue;
    }

    variants.push({
      colorName,
      colorValue,
      id: ids[index] || null,
      lowStockThreshold,
      preorderLimit,
      preorderShipsAt: preorderShipDate,
      size,
      sku,
      status: status ?? InventoryStatus.IN_STOCK,
      stock: stock ?? 0,
    });
  }

  return variants;
}

async function validateVariants(
  variants: ProductVariantInput[],
  productId?: string,
) {
  const variantKeys = new Set<string>();
  const submittedVariantIds = new Set(
    variants.flatMap((variant) => (variant.id ? [variant.id] : [])),
  );
  const skus = uniqueStrings(
    variants.flatMap((variant) => (variant.sku ? [variant.sku] : [])),
  );

  for (const variant of variants) {
    if (!variant.size) {
      return "Variant size is required.";
    }

    if (!variant.colorName) {
      return "Variant color is required.";
    }

    if (variant.stock < 0) {
      return "Variant stock must be zero or greater.";
    }

    if (
      variant.lowStockThreshold !== null &&
      variant.lowStockThreshold < 0
    ) {
      return "Low stock threshold must be zero or greater.";
    }

    if (variant.preorderLimit !== null && variant.preorderLimit < 0) {
      return "Preorder limit must be zero or greater.";
    }

    const variantKey = `${variant.size.toLowerCase()}::${variant.colorName.toLowerCase()}`;

    if (variantKeys.has(variantKey)) {
      return "Variants must have unique size and color combinations.";
    }

    variantKeys.add(variantKey);
  }

  if (productId && submittedVariantIds.size) {
    const variantCount = await db.productVariant.count({
      where: {
        id: { in: Array.from(submittedVariantIds) },
        productId,
      },
    });

    if (variantCount !== submittedVariantIds.size) {
      return "One or more submitted variants do not belong to this product.";
    }
  }

  if (skus.length) {
    const skuMatches = await db.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { id: true, sku: true },
    });

    for (const match of skuMatches) {
      const submittedVariant = variants.find(
        (variant) => variant.sku === match.sku,
      );

      if (submittedVariant?.id !== match.id) {
        return `Another variant already uses SKU ${match.sku}.`;
      }
    }
  }

  return null;
}

async function syncProductChildren(
  tx: Prisma.TransactionClient,
  productId: string,
  input: ProductMutationInput,
) {
  await syncProductCategories(tx, productId, input);
  await syncProductImages(tx, productId, input.images);
  await syncProductVariants(tx, productId, input.variants);
}

async function syncProductCategories(
  tx: Prisma.TransactionClient,
  productId: string,
  input: ProductMutationInput,
) {
  const categoryIds = uniqueStrings([
    input.primaryCategoryId,
    ...input.additionalCategoryIds,
  ]);

  await tx.productCategory.deleteMany({ where: { productId } });

  for (const categoryId of categoryIds) {
    await tx.productCategory.create({
      data: {
        categoryId,
        isPrimary: categoryId === input.primaryCategoryId,
        productId,
      },
    });
  }
}

async function syncProductImages(
  tx: Prisma.TransactionClient,
  productId: string,
  images: ProductImageInput[],
) {
  await tx.productImage.deleteMany({ where: { productId } });

  for (const image of images) {
    await tx.productImage.create({
      data: {
        alt: image.alt,
        isPrimary: image.isPrimary,
        productId,
        sortOrder: image.sortOrder,
        url: image.url,
      },
    });
  }
}

async function syncProductVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: ProductVariantInput[],
) {
  const existingVariants = await tx.productVariant.findMany({
    where: { productId },
    select: {
      _count: {
        select: {
          inventoryMovements: true,
          orderItems: true,
        },
      },
      id: true,
    },
  });
  const activeVariantIds = new Set<string>();

  for (const variant of variants) {
    const data = {
      colorName: variant.colorName,
      colorValue: variant.colorValue,
      isActive: true,
      lowStockThreshold: variant.lowStockThreshold,
      size: variant.size,
      sku: variant.sku,
      status: variant.status,
      stock: variant.stock,
    };
    const savedVariant = variant.id
      ? await tx.productVariant.update({
          where: { id: variant.id },
          data,
          select: { id: true },
        })
      : await tx.productVariant.create({
          data: {
            ...data,
            productId,
          },
          select: { id: true },
        });

    activeVariantIds.add(savedVariant.id);

    if (variant.status === InventoryStatus.PRE_ORDER) {
      await tx.preorderSetting.upsert({
        where: { variantId: savedVariant.id },
        update: {
          enabled: true,
          limitQuantity: variant.preorderLimit,
          shipsAt: variant.preorderShipsAt,
        },
        create: {
          enabled: true,
          limitQuantity: variant.preorderLimit,
          shipsAt: variant.preorderShipsAt,
          variantId: savedVariant.id,
        },
      });
    } else {
      await tx.preorderSetting.deleteMany({
        where: { variantId: savedVariant.id },
      });
    }
  }

  for (const variant of existingVariants) {
    if (activeVariantIds.has(variant.id)) {
      continue;
    }

    await tx.preorderSetting.deleteMany({
      where: { variantId: variant.id },
    });

    if (variant._count.orderItems || variant._count.inventoryMovements) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { isActive: false },
      });
    } else {
      await tx.productVariant.delete({
        where: { id: variant.id },
      });
    }
  }
}

function readRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isProductMutationInput(
  value: ProductMutationInput | ProductFormActionState,
): value is ProductMutationInput {
  return "name" in value && "slug" in value;
}

function readNullableString(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);

  return value || null;
}

function parseProductStatus(value: string) {
  if (value in ProductStatus) {
    return ProductStatus[value as keyof typeof ProductStatus];
  }

  return null;
}

function parseProductGender(value: string) {
  if (value in ProductGender) {
    return ProductGender[value as keyof typeof ProductGender];
  }

  return null;
}

function parseInventoryStatus(value: string) {
  if (value === "PREORDER") {
    return InventoryStatus.PRE_ORDER;
  }

  if (value in InventoryStatus) {
    return InventoryStatus[value as keyof typeof InventoryStatus];
  }

  return null;
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
  if (!value) {
    return null;
  }

  return parseDecimalInput(value);
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function slugifyProduct(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['â€™]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function errorState(message: string): ProductActionState {
  return {
    message,
    status: "error",
  };
}
