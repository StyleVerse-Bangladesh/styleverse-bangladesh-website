"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { testPathaoConnection } from "@/lib/courier/pathao";
import { db } from "@/lib/db";

export type PathaoConnectionActionState =
  | {
      error?: never;
      message: string;
      ok: true;
      tokenExpiresAt: string | null;
    }
  | {
      error: string;
      message?: never;
      ok: false;
      tokenExpiresAt: string | null;
    };

type CourierAccountFormData =
  | {
      clientIdPlaceholder: string | null;
      clientSecretInput: string;
      isActive: boolean;
      isTestMode: boolean;
      label: string;
      passwordInput: string;
      provider: "PATHAO";
      publicConfig: Prisma.InputJsonValue | null;
      sortOrder: number;
      storeIdPlaceholder: string | null;
      usernamePlaceholder: string | null;
    }
  | { error: string };

type CourierAreaMappingFormData =
  | {
      areaId: string;
      areaName: string;
      cityId: string;
      cityName: string;
      isActive: boolean;
      provider: "PATHAO";
      zoneId: string;
      zoneName: string;
    }
  | { error: string };

export async function createCourierAccountAction(formData: FormData) {
  await requireSuperAdmin();

  const data = parseCourierAccountForm(formData);

  if ("error" in data) {
    redirectWithMessage("courierError", data.error);
  }

  await db.courierAccount.create({
    data: {
      clientIdPlaceholder: data.clientIdPlaceholder,
      clientSecretPlaceholder: data.clientSecretInput
        ? buildSecretPlaceholder()
        : null,
      isActive: data.isActive,
      isTestMode: data.isTestMode,
      label: data.label,
      passwordPlaceholder: data.passwordInput ? buildSecretPlaceholder() : null,
      provider: data.provider,
      publicConfig: toPrismaJsonInput(data.publicConfig),
      sortOrder: data.sortOrder,
      storeIdPlaceholder: data.storeIdPlaceholder,
      usernamePlaceholder: data.usernamePlaceholder,
    },
  });

  revalidateCourierSettings();
  redirectWithMessage("courierUpdated", "Courier account created.");
}

export async function updateCourierAccountAction(formData: FormData) {
  await requireSuperAdmin();

  const accountId = readString(formData, "accountId");
  const data = parseCourierAccountForm(formData);

  if (!accountId) {
    redirectWithMessage("courierError", "Courier account is required.");
  }

  if ("error" in data) {
    redirectWithMessage("courierError", data.error);
  }

  const account = await db.courierAccount.findUnique({
    where: { id: accountId },
    select: { id: true },
  });

  if (!account) {
    redirectWithMessage("courierError", "Courier account no longer exists.");
  }

  await db.courierAccount.update({
    where: { id: account.id },
    data: {
      clientIdPlaceholder: data.clientIdPlaceholder,
      clientSecretPlaceholder: data.clientSecretInput
        ? buildSecretPlaceholder()
        : undefined,
      isActive: data.isActive,
      isTestMode: data.isTestMode,
      label: data.label,
      passwordPlaceholder: data.passwordInput
        ? buildSecretPlaceholder()
        : undefined,
      provider: data.provider,
      publicConfig: toPrismaJsonInput(data.publicConfig),
      sortOrder: data.sortOrder,
      storeIdPlaceholder: data.storeIdPlaceholder,
      usernamePlaceholder: data.usernamePlaceholder,
    },
  });

  revalidateCourierSettings();
  redirectWithMessage("courierUpdated", "Courier account saved.");
}

export async function createCourierAreaMappingAction(formData: FormData) {
  await requireSuperAdmin();

  const data = parseAreaMappingForm(formData);

  if ("error" in data) {
    redirectWithMessage("courierError", data.error);
  }

  const existing = await db.courierAreaMapping.findUnique({
    where: {
      provider_cityId_zoneId_areaId: {
        areaId: data.areaId,
        cityId: data.cityId,
        provider: data.provider,
        zoneId: data.zoneId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    redirectWithMessage("courierError", "That courier area mapping already exists.");
  }

  await db.courierAreaMapping.create({
    data,
  });

  revalidateCourierSettings();
  redirectWithMessage("courierUpdated", "Courier area mapping created.");
}

export async function updateCourierAreaMappingAction(formData: FormData) {
  await requireSuperAdmin();

  const mappingId = readString(formData, "mappingId");
  const data = parseAreaMappingForm(formData);

  if (!mappingId) {
    redirectWithMessage("courierError", "Courier area mapping is required.");
  }

  if ("error" in data) {
    redirectWithMessage("courierError", data.error);
  }

  const mapping = await db.courierAreaMapping.findUnique({
    where: { id: mappingId },
    select: { id: true },
  });

  if (!mapping) {
    redirectWithMessage("courierError", "Courier area mapping no longer exists.");
  }

  const existing = await db.courierAreaMapping.findUnique({
    where: {
      provider_cityId_zoneId_areaId: {
        areaId: data.areaId,
        cityId: data.cityId,
        provider: data.provider,
        zoneId: data.zoneId,
      },
    },
    select: { id: true },
  });

  if (existing && existing.id !== mapping.id) {
    redirectWithMessage("courierError", "Another mapping already uses those Pathao IDs.");
  }

  await db.courierAreaMapping.update({
    where: { id: mapping.id },
    data,
  });

  revalidateCourierSettings();
  redirectWithMessage("courierUpdated", "Courier area mapping saved.");
}

export async function testPathaoConnectionAction(
  accountId: string,
): Promise<PathaoConnectionActionState> {
  await requireSuperAdmin();

  if (!accountId) {
    return {
      error: "Courier account is required.",
      ok: false,
      tokenExpiresAt: null,
    };
  }

  const result = await testPathaoConnection(accountId);

  revalidateCourierSettings();

  return result;
}

function parseCourierAccountForm(formData: FormData): CourierAccountFormData {
  const provider = normalizeProvider(readString(formData, "provider"));
  const label = readString(formData, "label");
  const sortOrderValue = readString(formData, "sortOrder");
  const sortOrder = Number.parseInt(sortOrderValue || "0", 10);
  const publicConfigResult = parsePublicConfig(
    readString(formData, "publicConfig"),
  );

  if (provider !== "PATHAO") {
    return { error: "Provider must be PATHAO." };
  }

  if (!label) {
    return { error: "Courier account label is required." };
  }

  if (!Number.isFinite(sortOrder)) {
    return { error: "Sort order must be numeric." };
  }

  if ("error" in publicConfigResult) {
    return publicConfigResult;
  }

  return {
    clientIdPlaceholder: readNullableString(formData, "clientIdPlaceholder"),
    clientSecretInput: readString(formData, "clientSecretInput"),
    isActive: formData.get("isActive") === "on",
    isTestMode: formData.get("isTestMode") === "on",
    label,
    passwordInput: readString(formData, "passwordInput"),
    provider,
    publicConfig: publicConfigResult.value,
    sortOrder,
    storeIdPlaceholder: readNullableString(formData, "storeIdPlaceholder"),
    usernamePlaceholder: readNullableString(formData, "usernamePlaceholder"),
  };
}

function parseAreaMappingForm(formData: FormData): CourierAreaMappingFormData {
  const provider = normalizeProvider(readString(formData, "provider"));
  const cityName = readString(formData, "cityName");
  const cityId = readString(formData, "cityId");
  const zoneName = readString(formData, "zoneName");
  const zoneId = readString(formData, "zoneId");
  const areaName = readString(formData, "areaName");
  const areaId = readString(formData, "areaId");

  if (provider !== "PATHAO") {
    return { error: "Provider must be PATHAO." };
  }

  if (!cityName || !cityId || !zoneName || !zoneId || !areaName || !areaId) {
    return { error: "City, zone, and area names and IDs are required." };
  }

  return {
    areaId,
    areaName,
    cityId,
    cityName,
    isActive: formData.get("isActive") === "on",
    provider,
    zoneId,
    zoneName,
  };
}

function parsePublicConfig(value: string):
  | { value: Prisma.InputJsonValue | null }
  | { error: string } {
  if (!value) {
    return { value: null };
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "Public config must be a JSON object." };
    }

    return { value: parsed as Prisma.InputJsonValue };
  } catch {
    return { error: "Public config must be valid JSON." };
  }
}

function toPrismaJsonInput(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

function normalizeProvider(value: string) {
  return value.trim().toUpperCase();
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);

  return value || null;
}

function buildSecretPlaceholder() {
  return `CONFIGURED_${new Date().toISOString()}`;
}

function redirectWithMessage(key: string, message: string): never {
  redirect(`/admin/settings/courier?${key}=${encodeURIComponent(message)}`);
}

function revalidateCourierSettings() {
  try {
    revalidatePath("/admin/settings/courier");
    revalidatePath("/admin/settings");
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}
