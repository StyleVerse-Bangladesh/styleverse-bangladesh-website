"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethodCode, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type SettingsActionState = {
  message?: string;
  status?: "error" | "success";
  values?: Record<string, string | boolean | undefined>;
};

const settingsKey = "storefront";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateStoreIdentityAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const storeName = readString(formData, "storeName");
  const shortName = readString(formData, "shortName");
  const description = readNullableString(formData, "description");
  const headerLogo = readNullableString(formData, "headerLogo");
  const footerLogo = readNullableString(formData, "footerLogo");

  const values = {
    description: description ?? "",
    footerLogo: footerLogo ?? "",
    headerLogo: headerLogo ?? "",
    shortName,
    storeName,
  };

  if (!storeName) {
    return errorState("Store name is required.", values);
  }

  await db.storeSettings.upsert({
    where: { singletonKey: settingsKey },
    update: {
      description,
      footerLogo,
      headerLogo,
      shortName: shortName || storeName,
      storeName,
    },
    create: {
      description,
      footerLogo,
      headerLogo,
      shortName: shortName || storeName,
      singletonKey: settingsKey,
      storeName,
    },
  });

  revalidateSettings();

  return successState("Store identity saved.");
}

export async function updateContactInfoAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const phone = readNullableString(formData, "phone");
  const email = readNullableString(formData, "email");
  const address = readNullableString(formData, "address");
  const values = {
    address: address ?? "",
    email: email ?? "",
    phone: phone ?? "",
  };

  if (email && !emailPattern.test(email)) {
    return errorState("Enter a valid email address.", values);
  }

  await db.storeSettings.upsert({
    where: { singletonKey: settingsKey },
    update: {
      address,
      email,
      phone,
    },
    create: {
      address,
      email,
      phone,
      shortName: "StyleVerse",
      singletonKey: settingsKey,
      storeName: "StyleVerse Bangladesh",
    },
  });

  revalidateSettings();

  return successState("Contact info saved.");
}

export async function updateSocialLinksAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const socialLinks = {
    facebook: readString(formData, "facebook"),
    instagram: readString(formData, "instagram"),
    tiktok: readString(formData, "tiktok"),
    youtube: readString(formData, "youtube"),
    whatsapp: readString(formData, "whatsapp"),
  };

  await db.storeSettings.upsert({
    where: { singletonKey: settingsKey },
    update: {
      socialLinks,
    },
    create: {
      shortName: "StyleVerse",
      singletonKey: settingsKey,
      socialLinks,
      storeName: "StyleVerse Bangladesh",
    },
  });

  revalidateSettings();

  return successState("Social links saved.");
}

export async function updatePwaSettingsAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const pwaSettings = {
    appName: readString(formData, "appName"),
    backgroundColor: readString(formData, "backgroundColor"),
    shortName: readString(formData, "pwaShortName"),
    themeColor: readString(formData, "themeColor"),
  };

  await db.storeSettings.upsert({
    where: { singletonKey: settingsKey },
    update: {
      pwaSettings,
    },
    create: {
      pwaSettings,
      shortName: pwaSettings.shortName || "StyleVerse",
      singletonKey: settingsKey,
      storeName: pwaSettings.appName || "StyleVerse Bangladesh",
    },
  });

  revalidateSettings();

  return successState("PWA metadata saved.");
}

export async function updatePaymentMethodAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const code = parsePaymentMethodCode(readString(formData, "code"));
  const label = readString(formData, "label");
  const sortOrderValue = readString(formData, "sortOrder");
  const sortOrder = parseInteger(sortOrderValue);
  const isActive = formData.get("isActive") === "on";
  const isComingSoon = formData.get("isComingSoon") === "on";
  const values = {
    isActive,
    isComingSoon,
    label,
    sortOrder: sortOrderValue,
  };

  if (!code) {
    return errorState("Payment method code is invalid.", values);
  }

  if (!label) {
    return errorState("Payment method label is required.", values);
  }

  if (!Number.isFinite(sortOrder)) {
    return errorState("Sort order must be numeric.", values);
  }

  await db.paymentMethod.upsert({
    where: { code },
    update: {
      isActive,
      isComingSoon,
      label,
      sortOrder,
    },
    create: {
      code,
      isActive,
      isComingSoon,
      label,
      sortOrder,
    },
  });

  revalidateSettings();

  return successState("Payment method saved.");
}

export async function updateDeliveryRuleAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const id = readString(formData, "id");
  const deliveryMethod = readString(formData, "deliveryMethod");
  const defaultFeeValue = readString(formData, "defaultFee");
  const freeShippingMinimumValue = readString(formData, "freeShippingMinimum");
  const sortOrderValue = readString(formData, "sortOrder");
  const defaultFee = parseCurrency(defaultFeeValue);
  const freeShippingMinimum = parseOptionalCurrency(freeShippingMinimumValue);
  const sortOrder = parseInteger(sortOrderValue);
  const city = readNullableString(formData, "city");
  const isActive = formData.get("isActive") === "on";
  const values = {
    city: city ?? "",
    defaultFee: defaultFeeValue,
    deliveryMethod,
    freeShippingMinimum: freeShippingMinimumValue,
    isActive,
    sortOrder: sortOrderValue,
  };

  if (!id) {
    return errorState("Delivery rule id is required.", values);
  }

  if (!deliveryMethod) {
    return errorState("Delivery method is required.", values);
  }

  if (!Number.isFinite(defaultFee) || defaultFee < 0) {
    return errorState("Default fee must be 0 or greater.", values);
  }

  if (
    freeShippingMinimum !== null &&
    (!Number.isFinite(freeShippingMinimum) || freeShippingMinimum < 0)
  ) {
    return errorState("Free shipping minimum must be 0 or greater.", values);
  }

  if (!Number.isFinite(sortOrder)) {
    return errorState("Sort order must be numeric.", values);
  }

  await db.deliveryRule.update({
    where: { id },
    data: {
      city,
      defaultFee: formatDecimal(defaultFee),
      deliveryMethod,
      freeShippingMinimum:
        freeShippingMinimum === null ? null : formatDecimal(freeShippingMinimum),
      isActive,
      name: buildDeliveryRuleName(deliveryMethod, city),
      sortOrder,
    },
  });

  revalidateSettings();

  return successState("Delivery rule saved.");
}

function parsePaymentMethodCode(value: string) {
  if (value in PaymentMethodCode) {
    return PaymentMethodCode[value as keyof typeof PaymentMethodCode];
  }

  return null;
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);

  return value || null;
}

function parseInteger(value: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseCurrency(value: string) {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseOptionalCurrency(value: string) {
  if (!value) {
    return null;
  }

  return parseCurrency(value);
}

function formatDecimal(value: number) {
  return new Prisma.Decimal(value).toFixed(2);
}

function buildDeliveryRuleName(deliveryMethod: string, city: string | null) {
  return city ? `${deliveryMethod} - ${city}` : deliveryMethod;
}

function errorState(
  message: string,
  values?: SettingsActionState["values"],
): SettingsActionState {
  return {
    message,
    status: "error",
    values,
  };
}

function successState(message: string): SettingsActionState {
  return {
    message,
    status: "success",
  };
}

function revalidateSettings() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
