import { Prisma } from "@prisma/client";
import type { RiskMetrics } from "@/lib/fraud/customer-risk";

export type PathaoRiskResult =
  | {
      metrics: Required<Omit<RiskMetrics, "successRate">> & {
        successRate: number | null;
      };
      ok: true;
      provider: "PATHAO";
      providerPayload: Prisma.InputJsonValue;
    }
  | {
      error: string;
      ok: false;
    };

const endpointNotConfiguredMessage =
  "Pathao fraud check endpoint is not configured yet.";

export async function fetchPathaoCustomerRisk(
  phone: string,
): Promise<PathaoRiskResult> {
  if (process.env.PATHAO_FRAUD_CHECK_ENABLED !== "true") {
    return {
      error: endpointNotConfiguredMessage,
      ok: false,
    };
  }

  const endpoint = buildFraudEndpoint(phone);

  if (!endpoint) {
    return {
      error: endpointNotConfiguredMessage,
      ok: false,
    };
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    if (!response.ok) {
      return {
        error: `Pathao fraud check failed with status ${response.status}.`,
        ok: false,
      };
    }

    const payload = (await response.json()) as unknown;

    return {
      metrics: normalizePathaoRiskMetrics(payload),
      ok: true,
      provider: "PATHAO",
      providerPayload: sanitizeProviderPayload(payload),
    };
  } catch {
    return {
      error: "Pathao fraud check failed.",
      ok: false,
    };
  }
}

function buildFraudEndpoint(phone: string) {
  const configuredEndpoint = process.env.PATHAO_FRAUD_CHECK_ENDPOINT?.trim();

  if (!configuredEndpoint) {
    return null;
  }

  const encodedPhone = encodeURIComponent(phone);

  if (/^https?:\/\//i.test(configuredEndpoint)) {
    const url = new URL(configuredEndpoint);
    url.searchParams.set("phone", phone);

    return url.toString();
  }

  const baseUrl = process.env.PATHAO_API_BASE_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/g, "");
  const normalizedEndpoint = configuredEndpoint.startsWith("/")
    ? configuredEndpoint
    : `/${configuredEndpoint}`;

  return `${normalizedBaseUrl}${normalizedEndpoint.replace(":phone", encodedPhone)}`;
}

function normalizePathaoRiskMetrics(payload: unknown) {
  const record = readRecord(payload);
  const data = readRecord(record?.data) ?? record;
  const totalOrders = readNumber(data, [
    "total_orders",
    "totalOrders",
    "total_deliveries",
  ]);
  const deliveredOrders = readNumber(data, [
    "delivered_orders",
    "deliveredOrders",
    "successful_deliveries",
  ]);
  const cancelledOrders = readNumber(data, [
    "cancelled_orders",
    "cancelledOrders",
    "canceled_orders",
  ]);
  const returnedOrders = readNumber(data, [
    "returned_orders",
    "returnedOrders",
    "return_orders",
  ]);
  const successRate =
    readNumber(data, ["success_rate", "successRate", "delivery_success_rate"]) ??
    calculateSuccessRate(totalOrders, deliveredOrders);

  return {
    cancelledOrders: cancelledOrders ?? 0,
    deliveredOrders: deliveredOrders ?? 0,
    returnedOrders: returnedOrders ?? 0,
    successRate,
    totalOrders: totalOrders ?? 0,
  };
}

function sanitizeProviderPayload(payload: unknown): Prisma.InputJsonValue {
  const safePayload = removeSensitiveKeys(payload);

  return safePayload === undefined ? {} : safePayload;
}

function removeSensitiveKeys(value: unknown): Prisma.InputJsonValue | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => removeSensitiveKeys(entry))
      .filter((entry): entry is Prisma.InputJsonValue => entry !== undefined);
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const sanitized: Record<string, Prisma.InputJsonValue> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    if (/token|secret|password|credential|authorization/i.test(key)) {
      sanitized[key] = "[redacted]";
      continue;
    }

    const sanitizedValue = removeSensitiveKeys(entryValue);

    if (sanitizedValue !== undefined) {
      sanitized[key] = sanitizedValue;
    }
  }

  return sanitized;
}

function readRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readNumber(record: Record<string, unknown> | null, keys: string[]) {
  for (const key of keys) {
    const value = record?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function calculateSuccessRate(totalOrders: number | null, deliveredOrders: number | null) {
  if (!totalOrders || deliveredOrders === null) {
    return null;
  }

  return Math.round((deliveredOrders / totalOrders) * 10000) / 100;
}
