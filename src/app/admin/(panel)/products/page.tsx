import { ProductStatus, type Prisma } from "@prisma/client";
import {
  ProductAdminPage,
  type ProductAdminFilters,
  type ProductAdminItem,
  type ProductAdminStatus,
  type ProductAdminStatusFilter,
} from "@/app/admin/(panel)/products/product-admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Products",
};

type AdminProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    page?: string;
    search?: string;
    status?: string;
  }>;
};

const productsPerPage = 10;

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const categoryOptions = await getCategoryOptions();
  const filters = getFilters(params, categoryOptions.map((item) => item.id));
  const where = buildProductWhere(filters);
  const [filteredProductCount, summary] = await Promise.all([
    db.product.count({ where }),
    getProductSummary(),
  ]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProductCount / productsPerPage),
  );
  const currentPage = clampPage(params?.page, totalPages);
  const products = await getProducts(where, currentPage);

  return (
    <ProductAdminPage
      categories={categoryOptions}
      filters={filters}
      pagination={{
        currentPage,
        pageSize: productsPerPage,
        totalItems: filteredProductCount,
        totalPages,
      }}
      products={products}
      summary={summary}
    />
  );
}

async function getCategoryOptions() {
  const categories = await db.category.findMany({
    select: {
      _count: {
        select: {
          primaryProducts: true,
          productCategories: true,
        },
      },
      id: true,
      label: true,
      pathKey: true,
    },
  });

  return categories
    .map((category) => ({
      id: category.id,
      label: category.label,
      pathKey: category.pathKey,
      productCount:
        category._count.primaryProducts + category._count.productCategories,
    }))
    .filter((category) => category.productCount > 0)
    .sort((left, right) => left.pathKey.localeCompare(right.pathKey));
}

async function getProducts(where: Prisma.ProductWhereInput, page: number) {
  const products = await db.product.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      compareAtPrice: true,
      createdAt: true,
      currency: true,
      id: true,
      images: {
        orderBy: [{ sortOrder: "asc" }],
        select: {
          alt: true,
          isPrimary: true,
          url: true,
        },
      },
      name: true,
      price: true,
      primaryCategory: {
        select: {
          label: true,
          pathKey: true,
        },
      },
      productCategories: {
        orderBy: [{ category: { pathKey: "asc" } }],
        select: {
          category: {
            select: {
              label: true,
              pathKey: true,
            },
          },
          isPrimary: true,
        },
      },
      slug: true,
      status: true,
      updatedAt: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: [{ size: "asc" }, { colorName: "asc" }],
        select: {
          colorName: true,
          preorderSetting: {
            select: {
              enabled: true,
            },
          },
          size: true,
          stock: true,
        },
      },
    },
    skip: (page - 1) * productsPerPage,
    take: productsPerPage,
    where,
  });

  return products.map<ProductAdminItem>((product) => {
    const primaryImage =
      product.images.find((image) => image.isPrimary) ?? product.images[0];
    const categories = getDisplayCategories(product);
    const stockUnits = product.variants.reduce(
      (total, variant) => total + Math.max(variant.stock, 0),
      0,
    );
    const hasPreorder = product.variants.some(
      (variant) => variant.preorderSetting?.enabled,
    );

    return {
      categories,
      compareAtPrice: product.compareAtPrice
        ? formatMoney(Number(product.compareAtPrice), product.currency)
        : null,
      createdAt: formatDate(product.createdAt),
      hasPreorder,
      id: product.id,
      imageAlt: primaryImage?.alt ?? product.name,
      imageUrl: primaryImage?.url ?? null,
      inventoryBreakdown: product.variants.map((variant) => ({
        label: formatVariantLabel(variant.size, variant.colorName),
        stock: variant.stock,
      })),
      inventoryState:
        stockUnits > 0
          ? "IN_STOCK"
          : hasPreorder
            ? "PREORDER"
            : "OUT_OF_STOCK",
      name: product.name,
      price: formatMoney(Number(product.price), product.currency),
      primaryCategoryLabel: product.primaryCategory?.label ?? null,
      primaryCategoryPathKey: product.primaryCategory?.pathKey ?? null,
      slug: product.slug,
      status: product.status,
      totalStock: stockUnits,
      updatedAt: formatDate(product.updatedAt),
      variantCount: product.variants.length,
    };
  });
}

async function getProductSummary() {
  const [total, published, archived] = await Promise.all([
    db.product.count({
      where: { status: { in: [ProductStatus.PUBLISHED, ProductStatus.ARCHIVED] } },
    }),
    db.product.count({ where: { status: ProductStatus.PUBLISHED } }),
    db.product.count({ where: { status: ProductStatus.ARCHIVED } }),
  ]);

  return {
    archived,
    published,
    total,
  };
}

function buildProductWhere(
  filters: ProductAdminFilters,
): Prisma.ProductWhereInput {
  const searchWhere: Prisma.ProductWhereInput | undefined = filters.search
    ? {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ],
      }
    : undefined;
  const categoryWhere: Prisma.ProductWhereInput | undefined = filters.category
    ? {
        OR: [
          { primaryCategoryId: filters.category },
          {
            productCategories: {
              some: {
                categoryId: filters.category,
              },
            },
          },
        ],
      }
    : undefined;
  const conditions = [searchWhere, categoryWhere].filter(
    (condition): condition is Prisma.ProductWhereInput => Boolean(condition),
  );

  return {
    AND: conditions.length ? conditions : undefined,
    status: getStatusWhere(filters.status),
  };
}

function getFilters(
  params: Awaited<AdminProductsPageProps["searchParams"]>,
  categoryIds: string[],
): ProductAdminFilters {
  const search = String(params?.search ?? "").trim();
  const status = parseStatusFilter(params?.status);
  const submittedCategory = String(params?.category ?? "").trim();
  const category = categoryIds.includes(submittedCategory)
    ? submittedCategory
    : "";

  return {
    category,
    search,
    status,
  };
}

function parseStatusFilter(value: unknown): ProductAdminStatusFilter {
  if (typeof value !== "string") {
    return "ALL";
  }

  if (value === "ALL") {
    return "ALL";
  }

  if (value in ProductStatus) {
    return ProductStatus[
      value as keyof typeof ProductStatus
    ] as ProductAdminStatusFilter;
  }

  return "ALL";
}

function parseProductStatus(value: unknown): ProductAdminStatus | null {
  if (typeof value === "string" && value in ProductStatus) {
    return ProductStatus[value as keyof typeof ProductStatus];
  }

  return null;
}

function getStatusWhere(
  status: ProductAdminStatusFilter,
): Prisma.ProductWhereInput["status"] {
  if (status === "ALL") {
    return { in: [ProductStatus.PUBLISHED, ProductStatus.ARCHIVED] };
  }

  return parseProductStatus(status) ?? undefined;
}

function clampPage(value: unknown, totalPages: number) {
  const page =
    typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.min(page, totalPages);
}

function getDisplayCategories(product: {
  primaryCategory: { label: string; pathKey: string } | null;
  productCategories: {
    category: { label: string; pathKey: string };
    isPrimary: boolean;
  }[];
}) {
  const categories = new Map<string, { label: string; pathKey: string }>();

  if (product.primaryCategory) {
    categories.set(product.primaryCategory.pathKey, product.primaryCategory);
  }

  for (const item of product.productCategories) {
    categories.set(item.category.pathKey, item.category);
  }

  return Array.from(categories.values());
}

function formatVariantLabel(size: string, colorName: string) {
  return size ? `${size} - ${colorName}` : colorName;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}
