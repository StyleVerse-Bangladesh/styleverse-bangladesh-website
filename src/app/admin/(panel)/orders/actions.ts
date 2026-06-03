"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

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
