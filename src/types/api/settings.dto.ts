export type StorefrontSettingsDto = {
  storeName: string;
  shortName: string;
  description: string;
  locale: string;
  currency: string;
  logo: {
    header: string;
    footer: string;
  };
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  socialLinks: Array<{
    id: string;
    label: string;
    href: string;
    isActive: boolean;
  }>;
  delivery: {
    defaultFee: number;
    freeShippingMinimum?: number;
  };
  paymentMethods: Array<{
    id: "cash_on_delivery" | "online_payment";
    label: string;
    isActive: boolean;
    isComingSoon?: boolean;
  }>;
  pwa: {
    name: string;
    shortName: string;
    themeColor: string;
    backgroundColor: string;
  };
};
