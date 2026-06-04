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
    rules: Array<{
      id: string;
      deliveryMethod: string;
      label: string;
      defaultFee: number;
      freeShippingMinimum?: number;
      city?: string;
      isActive: boolean;
      sortOrder: number;
    }>;
  };
  paymentMethods: Array<{
    id: "cash_on_delivery" | "online_payment";
    label: string;
    isActive: boolean;
    isComingSoon?: boolean;
    sortOrder: number;
  }>;
  pwa: {
    name: string;
    shortName: string;
    themeColor: string;
    backgroundColor: string;
  };
};
