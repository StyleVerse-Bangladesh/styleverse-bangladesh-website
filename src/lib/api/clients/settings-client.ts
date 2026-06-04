import { cache } from "react";
import { PaymentMethodCode } from "@prisma/client";
import { siteConfig } from "@/lib/constants/site";
import type { StorefrontSettingsDto } from "@/types/api/settings.dto";

const staticStorefrontSettings: StorefrontSettingsDto = {
  storeName: siteConfig.name,
  shortName: siteConfig.shortName,
  description: siteConfig.description,
  locale: siteConfig.locale,
  currency: siteConfig.currency,
  logo: {
    header: "/logo/StyleVerse-Logo-Long-Black.png",
    footer: "/logo/StyleVerse-Logo-Long-White.png",
  },
  contact: {},
  socialLinks: [],
  delivery: {
    defaultFee: 80,
    rules: [
      {
        id: "static-standard",
        deliveryMethod: "standard",
        label: "Standard Delivery",
        defaultFee: 80,
        isActive: true,
        sortOrder: 0,
      },
    ],
  },
  paymentMethods: [
    {
      id: "cash_on_delivery",
      label: "Cash on Delivery",
      isActive: true,
      sortOrder: 0,
    },
    {
      id: "online_payment",
      label: "Online Payment",
      isActive: false,
      isComingSoon: true,
      sortOrder: 1,
    },
  ],
  pwa: {
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    themeColor: "#111111",
    backgroundColor: "#ffffff",
  },
};

export const getStorefrontSettings = cache(
  async (): Promise<StorefrontSettingsDto> => {
    try {
      const { db } = await import("@/lib/db");
      const [settings, paymentMethods, deliveryRules] = await Promise.all([
        db.storeSettings.findUnique({
          where: { singletonKey: "storefront" },
          select: {
            address: true,
            currency: true,
            description: true,
            email: true,
            footerLogo: true,
            headerLogo: true,
            locale: true,
            phone: true,
            pwaSettings: true,
            shortName: true,
            socialLinks: true,
            storeName: true,
          },
        }),
        db.paymentMethod.findMany({
          orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
          select: {
            code: true,
            isActive: true,
            isComingSoon: true,
            label: true,
            sortOrder: true,
          },
        }),
        db.deliveryRule.findMany({
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
        }),
      ]);

      if (!settings && !paymentMethods.length && !deliveryRules.length) {
        return staticStorefrontSettings;
      }

      const delivery = buildDeliverySettings(deliveryRules);

      return {
        storeName: settings?.storeName || staticStorefrontSettings.storeName,
        shortName: settings?.shortName || staticStorefrontSettings.shortName,
        description:
          settings?.description || staticStorefrontSettings.description,
        locale: settings?.locale || staticStorefrontSettings.locale,
        currency: settings?.currency || staticStorefrontSettings.currency,
        logo: {
          header:
            settings?.headerLogo || staticStorefrontSettings.logo.header,
          footer:
            settings?.footerLogo || staticStorefrontSettings.logo.footer,
        },
        contact: {
          address:
            settings?.address ?? staticStorefrontSettings.contact.address,
          email: settings?.email ?? staticStorefrontSettings.contact.email,
          phone: settings?.phone ?? staticStorefrontSettings.contact.phone,
        },
        socialLinks: buildSocialLinks(settings?.socialLinks),
        delivery,
        paymentMethods: buildPaymentMethods(paymentMethods),
        pwa: buildPwaSettings(settings?.pwaSettings, settings),
      };
    } catch {
      return staticStorefrontSettings;
    }
  },
);

function buildPaymentMethods(
  methods: Array<{
    code: PaymentMethodCode;
    isActive: boolean;
    isComingSoon: boolean;
    label: string;
    sortOrder: number;
  }>,
): StorefrontSettingsDto["paymentMethods"] {
  if (!methods.length) {
    return staticStorefrontSettings.paymentMethods;
  }

  return methods.flatMap((method) => {
    const id = mapPaymentMethodCode(method.code);

    if (!id) {
      return [];
    }

    return [
      {
        id,
        isActive: method.isActive,
        isComingSoon: method.isComingSoon,
        label: method.label,
        sortOrder: method.sortOrder,
      },
    ];
  });
}

function buildDeliverySettings(
  rules: Array<{
    city: string | null;
    defaultFee: { toNumber(): number };
    deliveryMethod: string;
    freeShippingMinimum: { toNumber(): number } | null;
    id: string;
    isActive: boolean;
    sortOrder: number;
  }>,
): StorefrontSettingsDto["delivery"] {
  const mappedRules = rules.map((rule) => ({
    city: rule.city ?? undefined,
    defaultFee: rule.defaultFee.toNumber(),
    deliveryMethod: rule.deliveryMethod,
    freeShippingMinimum: rule.freeShippingMinimum?.toNumber(),
    id: rule.id,
    isActive: rule.isActive,
    label: formatDeliveryMethodLabel(rule.deliveryMethod, rule.city),
    sortOrder: rule.sortOrder,
  }));
  const activeRule = mappedRules.find((rule) => rule.isActive);

  if (!activeRule) {
    return staticStorefrontSettings.delivery;
  }

  return {
    defaultFee: activeRule.defaultFee,
    freeShippingMinimum: activeRule.freeShippingMinimum,
    rules: mappedRules,
  };
}

function buildSocialLinks(value: unknown): StorefrontSettingsDto["socialLinks"] {
  const record = readJsonRecord(value);
  const links = [
    socialLink("facebook", "Facebook", record.facebook),
    socialLink("instagram", "Instagram", record.instagram),
    socialLink("tiktok", "TikTok", record.tiktok),
    socialLink("youtube", "YouTube", record.youtube),
    socialLink("whatsapp", "WhatsApp", record.whatsapp),
  ].filter((item): item is StorefrontSettingsDto["socialLinks"][number] =>
    Boolean(item),
  );

  return links.length ? links : staticStorefrontSettings.socialLinks;
}

function buildPwaSettings(
  value: unknown,
  settings: {
    shortName: string;
    storeName: string;
  } | null,
): StorefrontSettingsDto["pwa"] {
  const record = readJsonRecord(value);

  return {
    backgroundColor:
      readJsonString(record, "backgroundColor") ||
      staticStorefrontSettings.pwa.backgroundColor,
    name:
      readJsonString(record, "appName") ||
      settings?.storeName ||
      staticStorefrontSettings.pwa.name,
    shortName:
      readJsonString(record, "shortName") ||
      settings?.shortName ||
      staticStorefrontSettings.pwa.shortName,
    themeColor:
      readJsonString(record, "themeColor") ||
      staticStorefrontSettings.pwa.themeColor,
  };
}

function socialLink(id: string, label: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return {
    href: value.trim(),
    id,
    isActive: true,
    label,
  };
}

function mapPaymentMethodCode(code: PaymentMethodCode) {
  if (code === PaymentMethodCode.CASH_ON_DELIVERY) {
    return "cash_on_delivery" as const;
  }

  if (code === PaymentMethodCode.ONLINE_PAYMENT) {
    return "online_payment" as const;
  }

  return null;
}

function formatDeliveryMethodLabel(method: string, city: string | null) {
  const label = method
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return city ? `${label} - ${city}` : label || "Delivery";
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
