"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export type InvoiceDownloadActionState = {
  message?: string;
  status?: "error" | "success";
};

export async function downloadInvoicePdfPlaceholderAction(
  _state: InvoiceDownloadActionState,
  formData: FormData,
): Promise<InvoiceDownloadActionState> {
  const orderId = String(formData.get("orderId") ?? "").trim();

  if (!orderId) {
    return errorState("Order id is required.");
  }

  const adminUserId = await getActiveAdminId();

  if (!adminUserId) {
    return errorState("Admin session is required.");
  }

  const invoice = await db.invoice.findUnique({
    select: {
      id: true,
    },
    where: { orderId },
  });

  if (!invoice) {
    return errorState("Invoice has not been generated yet.");
  }

  return successState("PDF generation not connected yet.");
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
    select: {
      id: true,
      isActive: true,
    },
    where: { id: session.adminId },
  });

  return admin?.isActive ? admin.id : null;
}

function successState(message: string): InvoiceDownloadActionState {
  return {
    message,
    status: "success",
  };
}

function errorState(message: string): InvoiceDownloadActionState {
  return {
    message,
    status: "error",
  };
}
