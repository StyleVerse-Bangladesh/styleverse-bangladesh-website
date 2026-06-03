import "dotenv/config";
import {
  InventoryStatus,
  PaymentMethodCode,
  PrismaClient,
  ProductGender,
  ProductStatus,
  type Category as PrismaCategory,
  type Permission,
  type Role,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";
import productData from "../src/data/products.json";
import {
  getCategoryById,
  getCategoryByPath,
  getAllCategories,
  type CategoryNode,
} from "../src/data/category-taxonomy";
import type {
  Product as StorefrontProduct,
  ProductVariant as StorefrontProductVariant,
} from "../src/types/product";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type SeedProductVariant = StorefrontProductVariant & {
  sku?: string;
};

type SeedProduct = StorefrontProduct & {
  description?: string;
  publishedAt?: string | null;
  seoDescription?: string;
  seoTitle?: string;
  status?: string;
  variants: SeedProductVariant[];
};

type ProductSeedStats = {
  images: number;
  preorders: number;
  productCategoryLinks: number;
  products: number;
  variants: number;
};

const storefrontProducts = productData as SeedProduct[];

const roles = [
  {
    slug: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Full BMS access.",
  },
  {
    slug: "ADMIN",
    name: "Admin",
    description: "Store management access.",
  },
  {
    slug: "STAFF",
    name: "Staff",
    description: "Operational staff access.",
  },
] as const;

const permissions = [
  permission("products.manage", "Products Manage", "products"),
  permission("categories.manage", "Categories Manage", "categories"),
  permission("inventory.manage", "Inventory Manage", "inventory"),
  permission("orders.manage", "Orders Manage", "orders"),
  permission("coupons.manage", "Coupons Manage", "coupons"),
  permission("cms.manage", "CMS Manage", "cms"),
  permission("settings.manage", "Settings Manage", "settings"),
] as const;

async function main() {
  const seededRoles = new Map<string, Role>();
  const seededPermissions = new Map<string, Permission>();

  for (const role of roles) {
    const seededRole = await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });

    seededRoles.set(role.slug, seededRole);
  }

  for (const item of permissions) {
    const seededPermission = await prisma.permission.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        module: item.module,
        description: item.description,
      },
      create: item,
    });

    seededPermissions.set(item.slug, seededPermission);
  }

  await grantPermissions(
    seededRoles.get("SUPER_ADMIN"),
    Array.from(seededPermissions.values()),
  );
  await grantPermissions(
    seededRoles.get("ADMIN"),
    Array.from(seededPermissions.values()).filter(
      (item) => item.slug !== "settings.manage",
    ),
  );
  await grantPermissions(
    seededRoles.get("STAFF"),
    ["inventory.manage", "orders.manage"].map((slug) =>
      requirePermission(seededPermissions, slug),
    ),
  );

  const superAdminRole = requireRole(seededRoles, "SUPER_ADMIN");
  const superAdminPasswordHash = await hashPassword("ChangeMe123!");

  await prisma.adminUser.upsert({
    where: { email: "admin@styleverse.local" },
    update: {
      name: "StyleVerse Super Admin",
      passwordHash: superAdminPasswordHash,
      roleId: superAdminRole.id,
      isActive: true,
    },
    create: {
      name: "StyleVerse Super Admin",
      email: "admin@styleverse.local",
      passwordHash: superAdminPasswordHash,
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  await prisma.storeSettings.upsert({
    where: { singletonKey: "storefront" },
    update: {
      storeName: "StyleVerse Bangladesh",
      shortName: "StyleVerse",
      description: "Fashion ecommerce for StyleVerse Bangladesh.",
      locale: "en-BD",
      currency: "BDT",
      email: "support@example.com",
      phone: "+8800000000000",
    },
    create: {
      singletonKey: "storefront",
      storeName: "StyleVerse Bangladesh",
      shortName: "StyleVerse",
      description: "Fashion ecommerce for StyleVerse Bangladesh.",
      locale: "en-BD",
      currency: "BDT",
      email: "support@example.com",
      phone: "+8800000000000",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: PaymentMethodCode.CASH_ON_DELIVERY },
    update: {
      label: "Cash On Delivery",
      isActive: true,
      isComingSoon: false,
      sortOrder: 0,
    },
    create: {
      code: PaymentMethodCode.CASH_ON_DELIVERY,
      label: "Cash On Delivery",
      isActive: true,
      isComingSoon: false,
      sortOrder: 0,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: PaymentMethodCode.ONLINE_PAYMENT },
    update: {
      label: "Online Payment",
      isActive: false,
      isComingSoon: true,
      sortOrder: 1,
    },
    create: {
      code: PaymentMethodCode.ONLINE_PAYMENT,
      label: "Online Payment",
      isActive: false,
      isComingSoon: true,
      sortOrder: 1,
    },
  });

  await prisma.deliveryRule.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      name: "Default Delivery",
      deliveryMethod: "standard",
      defaultFee: "80.00",
      freeShippingMinimum: "0.00",
      city: null,
      isActive: true,
      sortOrder: 0,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Default Delivery",
      deliveryMethod: "standard",
      defaultFee: "80.00",
      freeShippingMinimum: "0.00",
      city: null,
      isActive: true,
      sortOrder: 0,
    },
  });

  const categoryCount = await seedStorefrontCategories();
  const productStats = await seedStorefrontProducts();

  console.log(
    [
      `Seed completed. Imported ${categoryCount} categories.`,
      `Imported ${productStats.products} products, ${productStats.images} images,`,
      `${productStats.variants} variants, ${productStats.productCategoryLinks} category links,`,
      `and ${productStats.preorders} preorder settings.`,
    ].join(" "),
  );
}

function permission(slug: string, name: string, module: string) {
  return {
    slug,
    name,
    module,
    description: `Allows ${slug}.`,
  };
}

async function seedStorefrontCategories() {
  const categories = [...getAllCategories()].sort(
    (left, right) =>
      left.depth - right.depth ||
      left.path.join("/").localeCompare(right.path.join("/")),
  );
  const categoryIdsByPathKey = new Map<string, string>();

  for (const category of categories) {
    const pathKey = buildCategoryPathKey(category.path);
    const parentId = resolveSeededParentId(category, categoryIdsByPathKey);
    const seededCategory = await prisma.category.upsert({
      where: { pathKey },
      update: buildCategorySeedData(category, pathKey, parentId),
      create: {
        ...buildCategorySeedData(category, pathKey, parentId),
        ...getCompatibleCategoryId(category),
      },
    });

    categoryIdsByPathKey.set(pathKey, seededCategory.id);
  }

  return categories.length;
}

function buildCategorySeedData(
  category: CategoryNode,
  pathKey: string,
  parentId: string | null,
) {
  return {
    depth: category.depth,
    featured: category.featured ?? false,
    icon: category.icon ?? null,
    image: category.image ?? null,
    isActive: category.isActive,
    label: category.label,
    parentId,
    path: category.path,
    pathKey,
    rootSlug: category.rootSlug,
    seoDescription: category.seo?.description ?? null,
    seoTitle: category.seo?.title ?? null,
    showInFilter: category.showInFilter,
    showInNav: category.showInNav,
    slug: category.slug,
    sortOrder: category.sortOrder,
    tone: category.tone ?? null,
  };
}

function resolveSeededParentId(
  category: CategoryNode,
  categoryIdsByPathKey: Map<string, string>,
) {
  if (category.depth === 0) {
    return null;
  }

  const parentPathKey = buildCategoryPathKey(category.path.slice(0, -1));
  const parentId = categoryIdsByPathKey.get(parentPathKey);

  if (!parentId) {
    throw new Error(`Missing seeded parent category: ${parentPathKey}`);
  }

  return parentId;
}

function getCompatibleCategoryId(category: CategoryNode) {
  if (!isUuid(category.id)) {
    return {};
  }

  return {
    id: category.id,
  } satisfies Pick<PrismaCategory, "id">;
}

function buildCategoryPathKey(path: string[]) {
  return path.join("/");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function seedStorefrontProducts(): Promise<ProductSeedStats> {
  const stats: ProductSeedStats = {
    images: 0,
    preorders: 0,
    productCategoryLinks: 0,
    products: storefrontProducts.length,
    variants: 0,
  };

  for (const product of storefrontProducts) {
    const primaryCategoryId = await requireProductCategoryId(product);
    const seededProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: buildProductSeedData(product, primaryCategoryId),
      create: buildProductSeedData(product, primaryCategoryId),
    });

    stats.images += await seedProductImages(seededProduct.id, product);
    stats.variants += await seedProductVariants(seededProduct.id, product, stats);
    stats.productCategoryLinks += await seedProductCategoryLinks(
      seededProduct.id,
      product,
      primaryCategoryId,
    );
  }

  return stats;
}

function buildProductSeedData(product: SeedProduct, primaryCategoryId: string) {
  return {
    compareAtPrice: formatDecimal(product.compareAtPrice),
    currency: product.currency,
    description: product.description ?? null,
    gender: mapProductGender(product.gender),
    isDiscounted: product.isDiscounted ?? false,
    isNew: product.isNew ?? false,
    name: product.name,
    price: formatRequiredDecimal(product.price),
    primaryCategoryId,
    publishedAt: parseDateTime(product.publishedAt),
    seoDescription: product.seoDescription ?? null,
    seoTitle: product.seoTitle ?? null,
    slug: product.slug,
    status: mapProductStatus(product.status),
  };
}

async function seedProductImages(productId: string, product: SeedProduct) {
  for (const [index, url] of product.images.entries()) {
    await prisma.productImage.upsert({
      where: {
        productId_sortOrder: {
          productId,
          sortOrder: index,
        },
      },
      update: {
        alt: product.name,
        isPrimary: index === 0,
        url,
      },
      create: {
        alt: product.name,
        isPrimary: index === 0,
        productId,
        sortOrder: index,
        url,
      },
    });
  }

  return product.images.length;
}

async function seedProductVariants(
  productId: string,
  product: SeedProduct,
  stats: ProductSeedStats,
) {
  for (const variant of product.variants) {
    const seededVariant = await prisma.productVariant.upsert({
      where: {
        productId_size_colorName: {
          colorName: variant.color,
          productId,
          size: variant.size,
        },
      },
      update: buildProductVariantSeedData(product, variant),
      create: {
        ...buildProductVariantSeedData(product, variant),
        productId,
      },
    });

    if (variant.preorder?.enabled) {
      await prisma.preorderSetting.upsert({
        where: { variantId: seededVariant.id },
        update: buildPreorderSeedData(variant),
        create: {
          ...buildPreorderSeedData(variant),
          variantId: seededVariant.id,
        },
      });

      stats.preorders += 1;
    }
  }

  return product.variants.length;
}

function buildProductVariantSeedData(
  product: SeedProduct,
  variant: SeedProductVariant,
) {
  return {
    colorName: variant.color,
    colorValue: requireProductColorValue(product, variant.color),
    isActive: true,
    lowStockThreshold: variant.lowStockThreshold ?? null,
    priceOverride: null,
    size: variant.size,
    sku: variant.sku ?? variant.id,
    status: mapInventoryStatus(variant),
    stock: variant.stock,
  };
}

async function seedProductCategoryLinks(
  productId: string,
  product: SeedProduct,
  primaryCategoryId: string,
) {
  const categoryIds = await resolveProductCategoryIds(product, primaryCategoryId);

  for (const categoryId of categoryIds) {
    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          categoryId,
          productId,
        },
      },
      update: {
        isPrimary: categoryId === primaryCategoryId,
      },
      create: {
        categoryId,
        isPrimary: categoryId === primaryCategoryId,
        productId,
      },
    });
  }

  return categoryIds.length;
}

async function resolveProductCategoryIds(
  product: SeedProduct,
  primaryCategoryId: string,
) {
  const categoryIds = new Set<string>([primaryCategoryId]);

  for (const categoryId of product.categoryIds ?? []) {
    categoryIds.add(await requireCategoryIdByStorefrontCategoryId(categoryId));
  }

  return Array.from(categoryIds);
}

async function requireProductCategoryId(product: SeedProduct) {
  if (product.primaryCategoryId) {
    return requireCategoryIdByStorefrontCategoryId(product.primaryCategoryId);
  }

  if (product.categoryPath?.length) {
    return requireCategoryIdByPath(product.categoryPath);
  }

  throw new Error(`Missing primary category for product: ${product.slug}`);
}

async function requireCategoryIdByStorefrontCategoryId(categoryId: string) {
  const category = getCategoryById(categoryId);

  if (!category) {
    throw new Error(`Unknown storefront category id: ${categoryId}`);
  }

  return requireCategoryIdByPath(category.path);
}

async function requireCategoryIdByPath(path: string[]) {
  const category = getCategoryByPath(path);
  const pathKey = buildCategoryPathKey(path);

  if (!category) {
    throw new Error(`Unknown storefront category path: ${pathKey}`);
  }

  const dbCategory = await prisma.category.findUnique({
    where: { pathKey },
    select: { id: true },
  });

  if (!dbCategory) {
    throw new Error(`Missing database category: ${pathKey}`);
  }

  return dbCategory.id;
}

function requireProductColorValue(product: SeedProduct, colorName: string) {
  const color = product.colors.find((item) => item.name === colorName);

  if (!color) {
    throw new Error(
      `Missing color "${colorName}" for product: ${product.slug}`,
    );
  }

  return color.value;
}

function buildPreorderSeedData(variant: SeedProductVariant) {
  return {
    enabled: variant.preorder?.enabled ?? false,
    limitQuantity: variant.preorder?.limit ?? null,
    shipsAt: parseDate(variant.preorder?.shipsAt),
  };
}

function mapProductStatus(value: unknown) {
  const normalized = normalizeStatusValue(value);

  if (normalized === "draft") {
    return ProductStatus.DRAFT;
  }

  if (normalized === "archived") {
    return ProductStatus.ARCHIVED;
  }

  // Static storefront products are active by default; Prisma stores that as PUBLISHED.
  return ProductStatus.PUBLISHED;
}

function mapProductGender(value: SeedProduct["gender"]) {
  const normalized = value.toUpperCase();

  if (normalized in ProductGender) {
    return ProductGender[normalized as keyof typeof ProductGender];
  }

  throw new Error(`Unsupported product gender: ${value}`);
}

function mapInventoryStatus(variant: SeedProductVariant) {
  if (variant.preorder?.enabled || variant.status === "pre_order") {
    return InventoryStatus.PRE_ORDER;
  }

  if (variant.status === "low_stock") {
    return InventoryStatus.LOW_STOCK;
  }

  if (variant.status === "out_of_stock") {
    return InventoryStatus.OUT_OF_STOCK;
  }

  if (variant.stock <= 0) {
    return InventoryStatus.OUT_OF_STOCK;
  }

  const lowStockThreshold = variant.lowStockThreshold ?? 0;

  if (lowStockThreshold > 0 && variant.stock <= lowStockThreshold) {
    return InventoryStatus.LOW_STOCK;
  }

  return InventoryStatus.IN_STOCK;
}

function normalizeStatusValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/[_\s]+/g, "-");
}

function formatDecimal(value: number | undefined) {
  return value === undefined ? null : value.toFixed(2);
}

function formatRequiredDecimal(value: number) {
  return value.toFixed(2);
}

function parseDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function parseDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

async function grantPermissions(
  role: Role | undefined,
  permissionsToGrant: Permission[],
) {
  if (!role) {
    return;
  }

  for (const item of permissionsToGrant) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: item.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: item.id,
      },
    });
  }
}

function requirePermission(
  seededPermissions: Map<string, Permission>,
  slug: string,
) {
  const item = seededPermissions.get(slug);

  if (!item) {
    throw new Error(`Missing seeded permission: ${slug}`);
  }

  return item;
}

function requireRole(seededRoles: Map<string, Role>, slug: string) {
  const item = seededRoles.get(slug);

  if (!item) {
    throw new Error(`Missing seeded role: ${slug}`);
  }

  return item;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
