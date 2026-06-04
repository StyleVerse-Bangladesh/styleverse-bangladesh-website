import { ProductStatus, type Prisma } from "@prisma/client";
import {
  ProductAdminPage,
  type ProductAdminFilters,
  type ProductAdminItem,
  type ProductAdminStatus,
} from "@/app/admin/(panel)/products/product-admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Products",
};

type AdminProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const categoryOptions = await getCategoryOptions();
  const filters = getFilters(params, categoryOptions.map((item) => item.id));
  const [products, summary] = await Promise.all([
    getProducts(filters),
    getProductSummary(),
  ]);

  return (
    <ProductAdminPage
      categories={categoryOptions}
      filters={filters}
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

async function getProducts(filters: ProductAdminFilters) {
  const where = buildProductWhere(filters);
  const products = await db.product.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      _count: {
        select: {
          orderItems: true,
        },
      },
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
      slug: true,
      status: true,
      updatedAt: true,
      variants: {
        where: {
          isActive: true,
        },
        select: {
          preorderSetting: {
            select: {
              enabled: true,
            },
          },
          stock: true,
        },
      },
    },
    where,
  });

  return products.map<ProductAdminItem>((product) => {
    const primaryImage =
      product.images.find((image) => image.isPrimary) ?? product.images[0];

    return {
      compareAtPrice: product.compareAtPrice
        ? formatMoney(Number(product.compareAtPrice), product.currency)
        : null,
      createdAt: formatDate(product.createdAt),
      hasPreorder: product.variants.some(
        (variant) => variant.preorderSetting?.enabled,
      ),
      id: product.id,
      imageAlt: primaryImage?.alt ?? product.name,
      imageUrl: primaryImage?.url ?? null,
      name: product.name,
      orderItemCount: product._count.orderItems,
      price: formatMoney(Number(product.price), product.currency),
      primaryCategoryLabel: product.primaryCategory?.label ?? null,
      primaryCategoryPathKey: product.primaryCategory?.pathKey ?? null,
      slug: product.slug,
      status: product.status,
      totalStock: product.variants.reduce(
        (total, variant) => total + variant.stock,
        0,
      ),
      updatedAt: formatDate(product.updatedAt),
      variantCount: product.variants.length,
    };
  });
}

async function getProductSummary() {
  const [total, published, draft, archived] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: ProductStatus.PUBLISHED } }),
    db.product.count({ where: { status: ProductStatus.DRAFT } }),
    db.product.count({ where: { status: ProductStatus.ARCHIVED } }),
  ]);

  return {
    archived,
    draft,
    published,
    total,
  };
}

function buildProductWhere(filters: ProductAdminFilters): Prisma.ProductWhereInput {
  return {
    OR: filters.search
      ? [
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
        ]
      : undefined,
    primaryCategoryId: filters.category || undefined,
    status: parseProductStatus(filters.status) ?? undefined,
  };
}

function getFilters(
  params: Awaited<AdminProductsPageProps["searchParams"]>,
  categoryIds: string[],
): ProductAdminFilters {
  const search = String(params?.search ?? "").trim();
  const status = parseProductStatus(params?.status) ?? "";
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

function parseProductStatus(value: unknown): ProductAdminStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  if (value in ProductStatus) {
    return ProductStatus[value as keyof typeof ProductStatus];
  }

  return null;
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
