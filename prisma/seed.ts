import "dotenv/config";
import {
  CouponType,
  HomepageSectionType,
  InventoryStatus,
  PaymentMethodCode,
  Prisma,
  PrismaClient,
  ProductGender,
  ProductStatus,
  type Category as PrismaCategory,
  type Permission,
  type Role,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";
import { coupons as staticCoupons } from "../src/data/coupons";
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
const defaultAdminSeedEmail = "admin@styleverse.local";
const defaultAdminSeedPassword = "ChangeMe123!";
const adminSeedEmail =
  process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase() || defaultAdminSeedEmail;
const adminSeedPassword =
  process.env.ADMIN_SEED_PASSWORD || defaultAdminSeedPassword;

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
  const superAdminPasswordHash = await hashPassword(adminSeedPassword);

  await prisma.adminUser.upsert({
    where: { email: adminSeedEmail },
    update: {
      name: "StyleVerse Super Admin",
      passwordHash: superAdminPasswordHash,
      roleId: superAdminRole.id,
      isActive: true,
    },
    create: {
      name: "StyleVerse Super Admin",
      email: adminSeedEmail,
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

  await prisma.paymentGateway.upsert({
    where: { code: "ONLINE_PAYMENT" },
    update: {},
    create: {
      code: "ONLINE_PAYMENT",
      isActive: false,
      isTestMode: true,
      label: "Online Payment Placeholder",
      provider: "SSL_COMMERZ_PLACEHOLDER",
      publicConfig: {
        note: "Placeholder only. No payment provider is connected.",
      },
      sortOrder: 0,
    },
  });

  await prisma.courierAccount.upsert({
    where: { id: "00000000-0000-0000-0000-000000000201" },
    update: {
      isActive: false,
      isTestMode: true,
      label: "Pathao Merchant",
      provider: "PATHAO",
      sortOrder: 0,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000201",
      isActive: false,
      isTestMode: true,
      label: "Pathao Merchant",
      provider: "PATHAO",
      publicConfig: {
        note: "Placeholder only. No Pathao Merchant API calls are enabled.",
      },
      sortOrder: 0,
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
  const homepageStats = await seedHomepageCmsContent();
  const homepageCategorySlotStats = await seedHomepageCategorySlots();
  const couponCount = await seedCoupons();

  console.log(
    [
      `Seed completed. Imported ${categoryCount} categories.`,
      `Imported ${productStats.products} products, ${productStats.images} images,`,
      `${productStats.variants} variants, ${productStats.productCategoryLinks} category links,`,
      `and ${productStats.preorders} preorder settings.`,
      `Seeded ${homepageStats.sections} homepage sections and ${homepageStats.items} homepage items.`,
      homepageCategorySlotStats.skipped
        ? "Skipped homepage Shop By Category slot seed because one or more categories are missing."
        : `Seeded ${homepageCategorySlotStats.slots} homepage category slots and ${homepageCategorySlotStats.items} slot items.`,
      `Seeded ${couponCount} coupons.`,
      `Seeded admin user ${adminSeedEmail}.`,
      "Seeded placeholder Pathao courier account.",
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
    featureInBanner: category.featureInBanner ?? false,
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

function mapCouponType(value: string) {
  if (value === "percentage") {
    return CouponType.PERCENTAGE;
  }

  if (value === "fixed") {
    return CouponType.FIXED;
  }

  return CouponType.FREE_SHIPPING;
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

async function seedHomepageCmsContent() {
  const productsBySlug = await getHomepageProductsBySlug();
  const categoriesByPathKey = await getHomepageCategoriesByPathKey();
  const sections = getHomepageSectionSeeds();
  let itemCount = 0;

  for (const section of sections) {
    await prisma.homepageSection.upsert({
      where: { id: section.id },
      update: {
        isActive: section.isActive,
        settings: section.settings,
        sortOrder: section.sortOrder,
        subtitle: section.subtitle,
        title: section.title,
        type: section.type,
      },
      create: {
        id: section.id,
        isActive: section.isActive,
        settings: section.settings,
        sortOrder: section.sortOrder,
        subtitle: section.subtitle,
        title: section.title,
        type: section.type,
      },
    });

    for (const item of section.items) {
      const productId = item.productSlug
        ? productsBySlug.get(item.productSlug)?.id ?? null
        : null;
      const categoryId = item.categoryPathKey
        ? categoriesByPathKey.get(item.categoryPathKey)?.id ?? null
        : null;

      await prisma.homepageSectionItem.upsert({
        where: { id: item.id },
        update: {
          alt: item.alt ?? null,
          categoryId,
          href: item.href ?? null,
          image: item.image ?? null,
          metadata: item.metadata ?? Prisma.JsonNull,
          productId,
          sectionId: section.id,
          sortOrder: item.sortOrder,
          subtitle: item.subtitle ?? null,
          title: item.title ?? null,
        },
        create: {
          id: item.id,
          alt: item.alt ?? null,
          categoryId,
          href: item.href ?? null,
          image: item.image ?? null,
          metadata: item.metadata ?? Prisma.JsonNull,
          productId,
          sectionId: section.id,
          sortOrder: item.sortOrder,
          subtitle: item.subtitle ?? null,
          title: item.title ?? null,
        },
      });
      itemCount += 1;
    }
  }

  return {
    items: itemCount,
    sections: sections.length,
  };
}

async function seedHomepageCategorySlots() {
  const categoriesByPathKey = await getHomepageCategoriesByPathKey();
  const seeds = getHomepageCategorySlotSeeds();
  const missingPathKeys = seeds.flatMap((slot) => {
    const requiredPathKeys = [slot.rootPathKey, ...slot.itemPathKeys];

    return requiredPathKeys.filter((pathKey) => !categoriesByPathKey.has(pathKey));
  });

  if (missingPathKeys.length) {
    console.warn(
      `Skipping homepage Shop By Category slot seed. Missing categories: ${[
        ...new Set(missingPathKeys),
      ].join(", ")}`,
    );

    return {
      items: 0,
      skipped: true,
      slots: 0,
    };
  }

  let itemCount = 0;

  for (const seed of seeds) {
    const rootCategory = categoriesByPathKey.get(seed.rootPathKey);

    if (!rootCategory) {
      continue;
    }

    const slot = await prisma.homepageCategorySlot.upsert({
      where: { position: seed.position },
      update: {
        isActive: true,
        rootCategoryId: rootCategory.id,
        title: seed.title,
      },
      create: {
        isActive: true,
        position: seed.position,
        rootCategoryId: rootCategory.id,
        title: seed.title,
      },
      select: {
        id: true,
      },
    });

    for (const [index, pathKey] of seed.itemPathKeys.entries()) {
      const category = categoriesByPathKey.get(pathKey);

      if (!category) {
        continue;
      }

      await prisma.homepageCategorySlotItem.upsert({
        where: {
          slotId_position: {
            position: index + 1,
            slotId: slot.id,
          },
        },
        update: {
          categoryId: category.id,
          imageOverride: null,
          labelOverride: null,
        },
        create: {
          categoryId: category.id,
          imageOverride: null,
          labelOverride: null,
          position: index + 1,
          slotId: slot.id,
        },
      });
      itemCount += 1;
    }
  }

  return {
    items: itemCount,
    skipped: false,
    slots: seeds.length,
  };
}

async function seedCoupons() {
  for (const coupon of staticCoupons) {
    const minimumOrder =
      coupon.minimumOrder === undefined
        ? null
        : formatRequiredDecimal(coupon.minimumOrder);
    const validUntil = coupon.validUntil
      ? new Date(`${coupon.validUntil}T23:59:59.999Z`)
      : null;
    const data = {
      isActive: coupon.isActive,
      maxUses: coupon.maxUses ?? null,
      maxUsesPerCustomer: coupon.maxUsesPerCustomer ?? null,
      minimumOrder,
      type: mapCouponType(coupon.type),
      validUntil,
      value: formatRequiredDecimal(coupon.value),
    };

    await prisma.coupon.upsert({
      where: { code: coupon.code.toUpperCase() },
      update: data,
      create: {
        ...data,
        code: coupon.code.toUpperCase(),
      },
    });
  }

  return staticCoupons.length;
}

async function getHomepageProductsBySlug() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
    },
  });

  return new Map(products.map((product) => [product.slug, product]));
}

async function getHomepageCategoriesByPathKey() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      pathKey: true,
    },
  });

  return new Map(categories.map((category) => [category.pathKey, category]));
}

type HomepageSectionSeed = {
  id: string;
  isActive: boolean;
  items: HomepageItemSeed[];
  settings: Prisma.InputJsonObject;
  sortOrder: number;
  subtitle: string | null;
  title: string;
  type: HomepageSectionType;
};

type HomepageItemSeed = {
  alt?: string;
  categoryPathKey?: string;
  href?: string;
  id: string;
  image?: string;
  metadata?: Prisma.InputJsonObject;
  productSlug?: string;
  sortOrder: number;
  subtitle?: string;
  title?: string;
};

type HomepageCategorySlotSeed = {
  itemPathKeys: string[];
  position: number;
  rootPathKey: string;
  title: string;
};

function getHomepageCategorySlotSeeds(): HomepageCategorySlotSeed[] {
  return [
    {
      itemPathKeys: ["men/t-shirts", "men/polo-t-shirts", "men/shirts", "men/joggers"],
      position: 1,
      rootPathKey: "men",
      title: "Men Essentials",
    },
    {
      itemPathKeys: [
        "women/dresses",
        "women/tops",
        "women/co-ord-set",
        "women/outerwear",
      ],
      position: 2,
      rootPathKey: "women",
      title: "Women Collection",
    },
    {
      itemPathKeys: ["kids/t-shirts", "kids/sets", "kids/shoes", "kids/accessories"],
      position: 3,
      rootPathKey: "kids",
      title: "Kids",
    },
    {
      itemPathKeys: [
        "accessories/bags",
        "accessories/caps",
        "accessories/belts",
        "accessories/sunglasses",
      ],
      position: 4,
      rootPathKey: "accessories",
      title: "Accessories",
    },
  ];
}

function getHomepageSectionSeeds(): HomepageSectionSeed[] {
  return [
    {
      id: "00000000-0000-0000-0000-000000000101",
      type: HomepageSectionType.HERO,
      title: "Hero",
      subtitle: null,
      sortOrder: 0,
      isActive: true,
      settings: { seededBy: "default-homepage-cms" },
      items: [1, 2, 3, 4, 5].map((index) => ({
        id: `00000000-0000-0000-0001-${String(index).padStart(12, "0")}`,
        title: `Hero Banner ${index}`,
        image: `/images/hero/hero-${index}.webp`,
        alt: `StyleVerse Bangladesh hero banner ${index}`,
        href: "#",
        sortOrder: index - 1,
        metadata: {
          height: 690,
          width: 1920,
        },
      })),
    },
    {
      id: "00000000-0000-0000-0000-000000000102",
      type: HomepageSectionType.FEATURE_STRIP,
      title: "Feature Strip",
      subtitle: null,
      sortOrder: 1,
      isActive: true,
      settings: { seededBy: "default-homepage-cms" },
      items: [
        featureSeed(1, "Premium Quality Products", "check", 0),
        featureSeed(2, "Fastest Shipping Countrywide", "truck", 1),
        featureSeed(3, "Easy Exchange Policy", "refresh", 2),
        featureSeed(4, "Online Support 24/7", "headphones", 3),
      ],
    },
    {
      id: "00000000-0000-0000-0000-000000000103",
      type: HomepageSectionType.CATEGORY_GROUP,
      title: "SHOP BY CATEGORY",
      subtitle: null,
      sortOrder: 2,
      isActive: true,
      settings: { seededBy: "default-homepage-cms" },
      items: categoryHomepageSeeds(),
    },
    {
      id: "00000000-0000-0000-0000-000000000104",
      type: HomepageSectionType.NEW_ARRIVALS,
      title: "New Arrival Products",
      subtitle: null,
      sortOrder: 3,
      isActive: true,
      settings: { seededBy: "default-homepage-cms" },
      items: newArrivalHomepageSeeds(),
    },
    {
      id: "00000000-0000-0000-0000-000000000105",
      type: HomepageSectionType.RECOMMENDED_PRODUCTS,
      title: "Product You May Like",
      subtitle: null,
      sortOrder: 4,
      isActive: true,
      settings: { seededBy: "default-homepage-cms" },
      items: storefrontProducts.map((product, index) => ({
        id: `00000000-0000-0000-0005-${String(index + 1).padStart(12, "0")}`,
        productSlug: product.slug,
        sortOrder: index,
        title: product.name,
      })),
    },
  ];
}

function featureSeed(
  index: number,
  title: string,
  icon: string,
  sortOrder: number,
): HomepageItemSeed {
  return {
    id: `00000000-0000-0000-0002-${String(index).padStart(12, "0")}`,
    title,
    sortOrder,
    metadata: { icon },
  };
}

function categoryHomepageSeeds(): HomepageItemSeed[] {
  const groups = [
    {
      title: "Men Essentials",
      sortOrder: 0,
      items: [
        categorySeed("T-Shirts", "/men/t-shirts", "from-zinc-950 to-zinc-600", "men/t-shirts"),
        categorySeed("Polo", "/men/polo-t-shirts", "from-neutral-700 to-stone-300", "men/polo-t-shirts"),
        categorySeed("Shirts", "/men/shirts", "from-slate-900 to-slate-500", "men/shirts"),
        categorySeed("Joggers", "/men/joggers", "from-stone-800 to-zinc-400", "men/joggers"),
      ],
    },
    {
      title: "Women Collection",
      sortOrder: 1,
      items: [
        categorySeed("Dresses", "/women", "from-zinc-900 to-rose-200", "women/dresses"),
        categorySeed("Tops", "/women", "from-neutral-800 to-zinc-300", "women/tops"),
        categorySeed("Co-Ord Set", "/women", "from-stone-900 to-stone-300", "women/co-ord-set"),
        categorySeed("Outerwear", "/women", "from-slate-950 to-slate-400", "women/outerwear"),
      ],
    },
    {
      title: "Kids",
      sortOrder: 2,
      items: [
        categorySeed("T-Shirts", "/kids", "from-black to-zinc-500", "kids/t-shirts"),
        categorySeed("Sets", "/kids", "from-zinc-900 to-neutral-300", "kids/sets"),
        categorySeed("Shoes", "/kids", "from-slate-900 to-slate-400", "kids/shoes"),
        categorySeed("Accessories", "/kids", "from-stone-800 to-stone-300", "kids/accessories"),
      ],
    },
    {
      title: "Accessories",
      sortOrder: 3,
      items: [
        categorySeed("Bags", "/accessories", "from-neutral-950 to-neutral-500", "accessories/bags"),
        categorySeed("Caps", "/accessories", "from-zinc-800 to-zinc-300", "accessories/caps"),
        categorySeed("Belts", "/accessories", "from-stone-950 to-stone-500", "accessories/belts"),
        categorySeed("Sunglasses", "/accessories", "from-slate-900 to-zinc-300", "accessories/sunglasses"),
      ],
    },
  ];

  return groups.flatMap((group) =>
    group.items.map((item, itemIndex) => ({
      ...item,
      id: `00000000-0000-0000-0003-${String(group.sortOrder * 10 + itemIndex + 1).padStart(12, "0")}`,
      metadata: {
        groupSortOrder: group.sortOrder,
        groupTitle: group.title,
        tone: item.metadata?.tone,
      },
      sortOrder: group.sortOrder * 10 + itemIndex,
    })),
  );
}

function categorySeed(
  title: string,
  href: string,
  tone: string,
  categoryPathKey: string,
): Omit<HomepageItemSeed, "id"> {
  return {
    categoryPathKey,
    href,
    metadata: { tone },
    sortOrder: 0,
    title,
  };
}

function newArrivalHomepageSeeds(): HomepageItemSeed[] {
  return [
    newArrivalSeed(
      1,
      "structured-cotton-shirt",
      "Half Sleeve Printed Casual Shirt For Men",
      "/images/products/half-sleeve-printed-casual-shirt-black.webp",
      990,
      1490,
      "/products/structured-cotton-shirt",
      "svb-001",
    ),
    newArrivalSeed(
      2,
      "structured-cotton-shirt",
      "Half Sleeve Printed Casual Shirt For Men",
      "/images/products/half-sleeve-printed-casual-shirt-white.webp",
      990,
      1490,
      "/products/structured-cotton-shirt",
      "svb-001",
    ),
    newArrivalSeed(
      3,
      "relaxed-linen-dress",
      "Premium Knitted Polo Shirt For Men",
      "/images/products/premium-knitted-polo-shirt-black.webp",
      1190,
      1500,
      "/products/relaxed-linen-dress",
      "svb-002",
    ),
    newArrivalSeed(
      4,
      "performance-knit-sneaker",
      "Premium Knitted Polo Shirt For Men",
      "/images/products/premium-knitted-polo-shirt-cream.webp",
      1190,
      1500,
      "/products/performance-knit-sneaker",
      "svb-004",
    ),
    newArrivalSeed(
      5,
      "kids-everyday-hoodie",
      "Premium Knit Casual Polo",
      "/images/products/premium-knit-casual-polo-olive.webp",
      1190,
      1500,
      "/products/kids-everyday-hoodie",
      "svb-003",
    ),
    newArrivalSeed(
      6,
      "structured-cotton-shirt",
      "Relaxed Everyday Fashion Shirt",
      "/images/products/relaxed-everyday-fashion-shirt-sand.webp",
      1290,
      1690,
      "/products/structured-cotton-shirt",
      "svb-001",
    ),
  ];
}

function newArrivalSeed(
  index: number,
  productSlug: string,
  title: string,
  image: string,
  price: number,
  compareAtPrice: number,
  href: string,
  wishlistId: string,
): HomepageItemSeed {
  return {
    id: `00000000-0000-0000-0004-${String(index).padStart(12, "0")}`,
    productSlug,
    title,
    image,
    href,
    sortOrder: index - 1,
    metadata: {
      compareAtPrice,
      price,
      wishlistId,
    },
  };
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
