"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { db } from "@/lib/db";

type GatewayFormData =
  | {
      code: string;
      isActive: boolean;
      isTestMode: boolean;
      label: string;
      provider: string;
      publicConfig: Prisma.InputJsonValue | null;
      secretConfigInput: string;
      sortOrder: number;
      webhookSecretInput: string;
    }
  | { error: string };

export async function createPaymentGatewayAction(formData: FormData) {
  await requireSuperAdmin();

  const data = parseGatewayForm(formData);

  if ("error" in data) {
    redirectWithMessage("paymentsError", data.error);
  }

  const existing = await db.paymentGateway.findUnique({
    where: { code: data.code },
    select: { id: true },
  });

  if (existing) {
    redirectWithMessage("paymentsError", "A payment gateway with that code already exists.");
  }

  await db.paymentGateway.create({
    data: {
      code: data.code,
      isActive: data.isActive,
      isTestMode: data.isTestMode,
      label: data.label,
      provider: data.provider,
      publicConfig: toPrismaJsonInput(data.publicConfig),
      secretConfigPlaceholder: data.secretConfigInput
        ? buildSecretPlaceholder()
        : null,
      sortOrder: data.sortOrder,
      webhookSecretPlaceholder: data.webhookSecretInput
        ? buildSecretPlaceholder()
        : null,
    },
  });

  revalidatePayments();
  redirectWithMessage("paymentsUpdated", "Payment gateway created.");
}

export async function updatePaymentGatewayAction(formData: FormData) {
  await requireSuperAdmin();

  const gatewayId = readString(formData, "gatewayId");
  const data = parseGatewayForm(formData);

  if (!gatewayId) {
    redirectWithMessage("paymentsError", "Payment gateway is required.");
  }

  if ("error" in data) {
    redirectWithMessage("paymentsError", data.error);
  }

  const gateway = await db.paymentGateway.findUnique({
    where: { id: gatewayId },
    select: { code: true, id: true },
  });

  if (!gateway) {
    redirectWithMessage("paymentsError", "Payment gateway no longer exists.");
  }

  const codeOwner = await db.paymentGateway.findUnique({
    where: { code: data.code },
    select: { id: true },
  });

  if (codeOwner && codeOwner.id !== gateway.id) {
    redirectWithMessage("paymentsError", "Another payment gateway already uses that code.");
  }

  await db.paymentGateway.update({
    where: { id: gateway.id },
    data: {
      code: data.code,
      isActive: data.isActive,
      isTestMode: data.isTestMode,
      label: data.label,
      provider: data.provider,
      publicConfig: toPrismaJsonInput(data.publicConfig),
      secretConfigPlaceholder: data.secretConfigInput
        ? buildSecretPlaceholder()
        : undefined,
      sortOrder: data.sortOrder,
      webhookSecretPlaceholder: data.webhookSecretInput
        ? buildSecretPlaceholder()
        : undefined,
    },
  });

  revalidatePayments();
  redirectWithMessage("paymentsUpdated", "Payment gateway saved.");
}

function parseGatewayForm(formData: FormData): GatewayFormData {
  const label = readString(formData, "label");
  const provider = normalizeCode(readString(formData, "provider"));
  const code = normalizeCode(readString(formData, "code"));
  const sortOrderValue = readString(formData, "sortOrder");
  const sortOrder = Number.parseInt(sortOrderValue || "0", 10);
  const publicConfigResult = parsePublicConfig(
    readString(formData, "publicConfig"),
  );

  if (!label) {
    return { error: "Gateway label is required." };
  }

  if (!provider) {
    return { error: "Gateway provider is required." };
  }

  if (!code) {
    return { error: "Gateway code is required." };
  }

  if (!Number.isFinite(sortOrder)) {
    return { error: "Sort order must be numeric." };
  }

  if ("error" in publicConfigResult) {
    return publicConfigResult;
  }

  return {
    code,
    isActive: formData.get("isActive") === "on",
    isTestMode: formData.get("isTestMode") === "on",
    label,
    provider,
    publicConfig: publicConfigResult.value,
    secretConfigInput: readString(formData, "secretConfigInput"),
    sortOrder,
    webhookSecretInput: readString(formData, "webhookSecretInput"),
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

function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildSecretPlaceholder() {
  return `CONFIGURED_${new Date().toISOString()}`;
}

function redirectWithMessage(key: string, message: string): never {
  redirect(`/admin/settings/payments?${key}=${encodeURIComponent(message)}`);
}

function revalidatePayments() {
  try {
    revalidatePath("/admin/settings/payments");
    revalidatePath("/admin/settings");
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}
