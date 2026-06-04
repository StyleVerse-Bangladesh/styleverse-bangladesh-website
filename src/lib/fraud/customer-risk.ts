import { Prisma, RiskLevel } from "@prisma/client";
import { db } from "@/lib/db";

export type RiskMetrics = {
  cancelledOrders?: number;
  deliveredOrders?: number;
  returnedOrders?: number;
  successRate?: number | null;
  totalOrders?: number;
};

type CreatePlaceholderRiskCheckInput = {
  customerId?: string | null;
  orderId?: string | null;
  phone: string;
};

export function calculateRiskLevel(metrics: RiskMetrics) {
  const totalOrders = metrics.totalOrders ?? 0;
  const cancelledOrders = metrics.cancelledOrders ?? 0;
  const returnedOrders = metrics.returnedOrders ?? 0;
  const successRate = metrics.successRate;

  if (totalOrders <= 0 || successRate === null || successRate === undefined) {
    return RiskLevel.UNKNOWN;
  }

  const failedOrders = cancelledOrders + returnedOrders;
  const failureRate = totalOrders > 0 ? (failedOrders / totalOrders) * 100 : 0;

  if (failedOrders >= 3 || failureRate >= 50) {
    return RiskLevel.HIGH;
  }

  if (failedOrders >= 2 && successRate < 80) {
    return RiskLevel.HIGH;
  }

  if (failedOrders >= 2 || failureRate >= 30) {
    return RiskLevel.MEDIUM;
  }

  if (successRate >= 80) {
    return RiskLevel.LOW;
  }

  if (successRate >= 50) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.HIGH;
}

export async function createPlaceholderRiskCheck({
  customerId,
  orderId,
  phone,
}: CreatePlaceholderRiskCheckInput) {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    throw new Error("Customer phone is required for risk check.");
  }

  return db.customerRiskCheck.create({
    data: {
      cancelledOrders: 0,
      customerId: customerId || null,
      deliveredOrders: 0,
      orderId: orderId || null,
      phone: normalizedPhone,
      provider: "PLACEHOLDER",
      providerPayload: {
        message: "Pathao fraud check endpoint is not configured yet.",
      },
      returnedOrders: 0,
      riskLevel: RiskLevel.UNKNOWN,
      riskScore: null,
      successRate: null,
      totalOrders: 0,
    },
  });
}

export async function createRiskCheckFromMetrics({
  customerId,
  metrics,
  orderId,
  phone,
  provider,
  providerPayload,
}: {
  customerId?: string | null;
  metrics: Required<Omit<RiskMetrics, "successRate">> & {
    successRate: number | null;
  };
  orderId?: string | null;
  phone: string;
  provider: string;
  providerPayload: Prisma.InputJsonValue | null;
}) {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    throw new Error("Customer phone is required for risk check.");
  }

  const riskLevel = calculateRiskLevel(metrics);

  return db.customerRiskCheck.create({
    data: {
      cancelledOrders: metrics.cancelledOrders,
      customerId: customerId || null,
      deliveredOrders: metrics.deliveredOrders,
      orderId: orderId || null,
      phone: normalizedPhone,
      provider,
      providerPayload: providerPayload ?? Prisma.JsonNull,
      returnedOrders: metrics.returnedOrders,
      riskLevel,
      riskScore: calculateRiskScore(metrics, riskLevel),
      successRate:
        metrics.successRate === null
          ? null
          : new Prisma.Decimal(metrics.successRate).toFixed(2),
      totalOrders: metrics.totalOrders,
    },
  });
}

export async function getLatestRiskCheckByPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  return db.customerRiskCheck.findFirst({
    orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }],
    where: { phone: normalizedPhone },
  });
}

export function normalizePhone(phone: string) {
  return phone.trim().replace(/[\s()-]/g, "");
}

function calculateRiskScore(
  metrics: Required<Omit<RiskMetrics, "successRate">> & {
    successRate: number | null;
  },
  riskLevel: RiskLevel,
) {
  if (riskLevel === RiskLevel.UNKNOWN || metrics.successRate === null) {
    return null;
  }

  const failedOrders = metrics.cancelledOrders + metrics.returnedOrders;
  const failurePenalty = Math.min(40, failedOrders * 12);
  const successPenalty = Math.max(0, 100 - metrics.successRate);

  return Math.min(100, Math.round(successPenalty + failurePenalty));
}
