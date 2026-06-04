"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type CustomerActionState = {
  message?: string;
  status?: "error" | "success";
};

export async function updateCustomerStatusAction(
  _state: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const customerId = readRequiredString(formData, "customerId");
  const status = readRequiredString(formData, "status");

  if (!customerId) {
    return errorState("Customer id is required.");
  }

  if (status !== "ACTIVE" && status !== "BLOCKED") {
    return errorState("Choose a valid customer status.");
  }

  const customer = await db.customer.findUnique({
    select: {
      fullName: true,
      id: true,
    },
    where: { id: customerId },
  });

  if (!customer) {
    return errorState("Customer no longer exists.");
  }

  await db.customer.update({
    data: {
      isActive: status === "ACTIVE",
    },
    where: { id: customer.id },
  });

  revalidateCustomer(customer.id);

  return {
    message: `${customer.fullName || "Customer"} marked ${status === "ACTIVE" ? "active" : "blocked"}.`,
    status: "success",
  };
}

export async function saveCustomerNotesAction(
  _state: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const customerId = readRequiredString(formData, "customerId");
  const adminNotes = readRequiredString(formData, "adminNotes") || null;

  if (!customerId) {
    return errorState("Customer id is required.");
  }

  const customer = await db.customer.findUnique({
    select: {
      id: true,
    },
    where: { id: customerId },
  });

  if (!customer) {
    return errorState("Customer no longer exists.");
  }

  await db.customer.update({
    data: {
      adminNotes,
    },
    where: { id: customer.id },
  });

  revalidateCustomer(customer.id);

  return {
    message: "Internal notes saved.",
    status: "success",
  };
}

function readRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateCustomer(customerId: string) {
  try {
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}

function errorState(message: string): CustomerActionState {
  return {
    message,
    status: "error",
  };
}
