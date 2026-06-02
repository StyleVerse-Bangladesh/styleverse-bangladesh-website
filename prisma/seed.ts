import "dotenv/config";
import {
  PaymentMethodCode,
  PrismaClient,
  type Permission,
  type Role,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

  console.log("Seed completed.");
}

function permission(slug: string, name: string, module: string) {
  return {
    slug,
    name,
    module,
    description: `Allows ${slug}.`,
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
