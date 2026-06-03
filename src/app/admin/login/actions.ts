"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

export type AdminLoginState = {
  email?: string;
  error?: string;
};

export async function loginAdminAction(
  _state: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      email,
      error: "Enter your admin email and password.",
    };
  }

  const admin = await db.adminUser.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!admin?.isActive) {
    return {
      email,
      error: "Invalid admin credentials.",
    };
  }

  const isPasswordValid = await verifyPassword(password, admin.passwordHash);

  if (!isPasswordValid) {
    return {
      email,
      error: "Invalid admin credentials.",
    };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(admin.id, admin.roleId);

  redirect("/admin");
}
