import { PaymentMethodCode } from "@prisma/client";
import {
  SettingsAdminPage,
  type DeliveryRuleFormData,
  type PaymentMethodFormData,
  type SettingsMediaOption,
  type StoreSettingsFormData,
} from "@/app/admin/(panel)/settings/settings-admin";
import { db } from "@/lib/db";
import { getMediaPreviewUrl } from "@/lib/media-preview";

export const metadata = {
  title: "Admin Store Settings",
};

export default async function AdminSettingsPage() {
  const [settings, paymentMethods, deliveryRules, media] = await Promise.all([
    getStoreSettings(),
    getPaymentMethods(),
    getDeliveryRules(),
    getMediaOptions(),
  ]);

  return (
    <SettingsAdminPage
      deliveryRules={deliveryRules}
      media={media}
      paymentMethods={paymentMethods}
      settings={settings}
    />
  );
}

async function getStoreSettings(): Promise<StoreSettingsFormData> {
  const settings = await db.storeSettings.upsert({
    where: { singletonKey: "storefront" },
    update: {},
    create: {
      description: "Fashion ecommerce for StyleVerse Bangladesh.",
      locale: "en-BD",
      currency: "BDT",
      shortName: "StyleVerse",
      singletonKey: "storefront",
      storeName: "StyleVerse Bangladesh",
    },
    select: {
      address: true,
      description: true,
      email: true,
      footerLogo: true,
      headerLogo: true,
      phone: true,
      pwaSettings: true,
      shortName: true,
      socialLinks: true,
      storeName: true,
    },
  });

  const socialLinks = readJsonRecord(settings.socialLinks);
  const pwaSettings = readJsonRecord(settings.pwaSettings);

  return {
    address: settings.address ?? "",
    description: settings.description ?? "",
    email: settings.email ?? "",
    footerLogo: settings.footerLogo ?? "",
    headerLogo: settings.headerLogo ?? "",
    phone: settings.phone ?? "",
    pwaSettings: {
      appName: readJsonString(pwaSettings, "appName") || settings.storeName,
      backgroundColor:
        readJsonString(pwaSettings, "backgroundColor") || "#ffffff",
      shortName: readJsonString(pwaSettings, "shortName") || settings.shortName,
      themeColor: readJsonString(pwaSettings, "themeColor") || "#111827",
    },
    shortName: settings.shortName,
    socialLinks: {
      facebook: readJsonString(socialLinks, "facebook"),
      instagram: readJsonString(socialLinks, "instagram"),
      tiktok: readJsonString(socialLinks, "tiktok"),
      whatsapp: readJsonString(socialLinks, "whatsapp"),
      youtube: readJsonString(socialLinks, "youtube"),
    },
    storeName: settings.storeName,
  };
}

async function getPaymentMethods(): Promise<PaymentMethodFormData[]> {
  await Promise.all([
    db.paymentMethod.upsert({
      where: { code: PaymentMethodCode.CASH_ON_DELIVERY },
      update: {},
      create: {
        code: PaymentMethodCode.CASH_ON_DELIVERY,
        isActive: true,
        isComingSoon: false,
        label: "Cash On Delivery",
        sortOrder: 0,
      },
    }),
    db.paymentMethod.upsert({
      where: { code: PaymentMethodCode.ONLINE_PAYMENT },
      update: {},
      create: {
        code: PaymentMethodCode.ONLINE_PAYMENT,
        isActive: false,
        isComingSoon: true,
        label: "Online Payment",
        sortOrder: 1,
      },
    }),
  ]);

  const methods = await db.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      code: true,
      id: true,
      isActive: true,
      isComingSoon: true,
      label: true,
      sortOrder: true,
    },
    where: {
      code: {
        in: [
          PaymentMethodCode.CASH_ON_DELIVERY,
          PaymentMethodCode.ONLINE_PAYMENT,
        ],
      },
    },
  });

  return methods.map((method) => ({
    code: method.code,
    id: method.id,
    isActive: method.isActive,
    isComingSoon: method.isComingSoon,
    label: method.label,
    sortOrder: method.sortOrder,
  }));
}

async function getDeliveryRules(): Promise<DeliveryRuleFormData[]> {
  const existingCount = await db.deliveryRule.count();

  if (!existingCount) {
    await db.deliveryRule.create({
      data: {
        defaultFee: "80.00",
        deliveryMethod: "standard",
        freeShippingMinimum: "0.00",
        isActive: true,
        name: "Default Delivery",
        sortOrder: 0,
      },
    });
  }

  const rules = await db.deliveryRule.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      city: true,
      defaultFee: true,
      deliveryMethod: true,
      freeShippingMinimum: true,
      id: true,
      isActive: true,
      sortOrder: true,
    },
  });

  return rules.map((rule) => ({
    city: rule.city ?? "",
    defaultFee: rule.defaultFee.toFixed(2),
    deliveryMethod: rule.deliveryMethod,
    freeShippingMinimum: rule.freeShippingMinimum?.toFixed(2) ?? "",
    id: rule.id,
    isActive: rule.isActive,
    sortOrder: rule.sortOrder,
  }));
}

async function getMediaOptions(): Promise<SettingsMediaOption[]> {
  const files = await db.mediaFile.findMany({
    orderBy: [{ uploadedAt: "desc" }],
    select: {
      filename: true,
      id: true,
      mimeType: true,
      publicId: true,
      secureUrl: true,
      sizeBytes: true,
      storageProvider: true,
      uploadedAt: true,
      url: true,
    },
    take: 24,
    where: {
      deletedAt: null,
    },
  });

  return Promise.all(
    files.map(async (file) => {
      const preview = await getMediaPreviewUrl(file);

      return {
        filename: file.filename,
        id: file.id,
        previewUrl: preview.previewUrl,
        url: preview.mediaUrl ?? file.url,
      };
    }),
  );
}

function readJsonRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readJsonString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" ? value : "";
}
