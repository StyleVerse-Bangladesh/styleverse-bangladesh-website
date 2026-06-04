"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { fetchPathaoCustomerRisk } from "@/lib/courier/pathao-risk";
import { db } from "@/lib/db";
import {
  createPlaceholderRiskCheck,
  createRiskCheckFromMetrics,
} from "@/lib/fraud/customer-risk";

const orderStatusOptions = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

const paymentStatusOptions = [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
] as const;

const deliveryStatusOptions = [
  DeliveryStatus.PENDING,
  DeliveryStatus.PACKING,
  DeliveryStatus.SHIPPED,
  DeliveryStatus.DELIVERED,
  DeliveryStatus.RETURNED,
] as const;

type StatusType = "DELIVERY" | "ORDER" | "PAYMENT";
type OrderOperationValidation = { orderId: string } | { error: string };

export type OrderActionState = {
  message?: string;
  status?: "error" | "success";
};

export async function updateOrderLifecycleStatusAction(formData: FormData) {
  const orderId = readString(formData, "orderId");
  const statusType = parseStatusType(readString(formData, "statusType"));
  const toStatus = readString(formData, "toStatus");
  const note = readString(formData, "note").slice(0, 500) || null;

  if (!orderId) {
    redirect("/admin/orders");
  }

  if (!statusType || !isValidStatus(statusType, toStatus)) {
    redirectWithMessage(orderId, "statusError", "Choose a valid status.");
  }

  const adminUserId = await getActiveAdminId();

  if (!adminUserId) {
    redirect("/admin/login");
  }

  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        deliveryStatus: true,
        id: true,
        orderStatus: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return { error: "Order no longer exists." };
    }

    const fromStatus = getCurrentStatus(order, statusType);

    if (fromStatus === toStatus) {
      return { message: "Status is already set to that value." };
    }

    if (statusType === "ORDER") {
      await tx.order.update({
        where: { id: order.id },
        data: { orderStatus: toStatus as OrderStatus },
      });
    }

    if (statusType === "PAYMENT") {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: toStatus as PaymentStatus },
      });
    }

    if (statusType === "DELIVERY") {
      await tx.order.update({
        where: { id: order.id },
        data: { deliveryStatus: toStatus as DeliveryStatus },
      });
    }

    await tx.orderStatusHistory.create({
      data: {
        changedByAdminId: adminUserId,
        fromStatus,
        note,
        orderId: order.id,
        statusType,
        toStatus,
      },
    });

    return { message: `${formatStatusType(statusType)} status updated.` };
  });

  revalidateOrders(orderId);

  if ("error" in result && result.error) {
    redirectWithMessage(orderId, "statusError", result.error);
  }

  redirectWithMessage(
    orderId,
    "statusUpdated",
    result.message ?? "Status update complete.",
  );
}

export async function checkFraudRiskAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const validation = await validateOrderOperation(formData);

  if ("error" in validation) {
    return errorState(validation.error);
  }

  const order = await db.order.findUnique({
    where: { id: validation.orderId },
    select: {
      customerId: true,
      customerPhone: true,
      id: true,
    },
  });

  if (!order) {
    return errorState("Order no longer exists.");
  }

  const riskResult = await fetchPathaoCustomerRisk(order.customerPhone);

  if (!riskResult.ok) {
    await createPlaceholderRiskCheck({
      customerId: order.customerId,
      orderId: order.id,
      phone: order.customerPhone,
    });

    revalidateOrders(order.id);

    return successState(
      `${riskResult.error} Placeholder UNKNOWN risk check saved.`,
    );
  }

  await createRiskCheckFromMetrics({
    customerId: order.customerId,
    metrics: riskResult.metrics,
    orderId: order.id,
    phone: order.customerPhone,
    provider: riskResult.provider,
    providerPayload: riskResult.providerPayload,
  });

  revalidateOrders(order.id);

  return successState("Fraud/risk check saved.");
}

export async function syncPaymentStatusAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const validation = await validateOrderOperation(formData);

  if ("error" in validation) {
    return errorState(validation.error);
  }

  return successState("Payment status sync service not connected yet.");
}

export async function createPathaoShipmentAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const validation = await validateOrderOperation(formData);

  if ("error" in validation) {
    return errorState(validation.error);
  }

  return successState("Pathao shipment service not connected yet.");
}

export async function syncCourierStatusAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const validation = await validateOrderOperation(formData);

  if ("error" in validation) {
    return errorState(validation.error);
  }

  return successState("Courier status sync service not connected yet.");
}

export async function saveOrderAdminNotesAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const validation = await validateOrderOperation(formData);

  if ("error" in validation) {
    return errorState(validation.error);
  }

  const adminNotes = readString(formData, "adminNotes").slice(0, 2000) || null;

  await db.order.update({
    data: {
      adminNotes,
    },
    where: { id: validation.orderId },
  });

  revalidateOrders(validation.orderId);

  return successState("Internal order notes saved.");
}

async function getActiveAdminId() {
  let session;

  try {
    session = await getSession();
  } catch {
    return null;
  }

  if (!session) {
    return null;
  }

  const admin = await db.adminUser.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      isActive: true,
    },
  });

  return admin?.isActive ? admin.id : null;
}

async function validateOrderOperation(
  formData: FormData,
): Promise<OrderOperationValidation> {
  const orderId = readString(formData, "orderId");

  if (!orderId) {
    return { error: "Order id is required." };
  }

  const adminUserId = await getActiveAdminId();

  if (!adminUserId) {
    return { error: "Admin session is required." };
  }

  const order = await db.order.findUnique({
    select: {
      id: true,
    },
    where: { id: orderId },
  });

  if (!order) {
    return { error: "Order no longer exists." };
  }

  return { orderId: order.id };
}

function getCurrentStatus(
  order: {
    deliveryStatus: DeliveryStatus;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
  },
  statusType: StatusType,
) {
  if (statusType === "ORDER") {
    return order.orderStatus;
  }

  if (statusType === "PAYMENT") {
    return order.paymentStatus;
  }

  return order.deliveryStatus;
}

function isValidStatus(statusType: StatusType, status: string) {
  if (statusType === "ORDER") {
    return orderStatusOptions.some((option) => option === status);
  }

  if (statusType === "PAYMENT") {
    return paymentStatusOptions.some((option) => option === status);
  }

  return deliveryStatusOptions.some((option) => option === status);
}

function parseStatusType(value: string): StatusType | null {
  if (value === "ORDER" || value === "PAYMENT" || value === "DELIVERY") {
    return value;
  }

  return null;
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithMessage(
  orderId: string,
  key: string,
  message: string,
): never {
  redirect(`/admin/orders/${orderId}?${key}=${encodeURIComponent(message)}`);
}

function revalidateOrders(orderId: string) {
  try {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}

function formatStatusType(statusType: StatusType) {
  return statusType.charAt(0) + statusType.slice(1).toLowerCase();
}

function successState(message: string): OrderActionState {
  return {
    message,
    status: "success",
  };
}

function errorState(message: string): OrderActionState {
  return {
    message,
    status: "error",
  };
}
