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
  },
  paymentMethods: [
    {
      id: "cash_on_delivery",
      label: "Cash on Delivery",
      isActive: true,
    },
    {
      id: "online_payment",
      label: "Online Payment",
      isActive: false,
      isComingSoon: true,
    },
  ],
  pwa: {
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    themeColor: "#111111",
    backgroundColor: "#ffffff",
  },
};

export async function getStorefrontSettings(): Promise<StorefrontSettingsDto> {
  return staticStorefrontSettings;
}
