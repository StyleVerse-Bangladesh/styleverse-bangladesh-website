"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth/password";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { db } from "@/lib/db";

export async function createAdminUserAction(formData: FormData) {
  await requireSuperAdmin();

  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const roleId = readString(formData, "roleId");
  const password = String(formData.get("password") ?? "");
  const isActive = readString(formData, "isActive") === "true";

  if (!name || !email || !roleId || !password) {
    redirectWithMessage("usersError", "Name, email, role, and password are required.");
  }

  if (password.length < 8) {
    redirectWithMessage("usersError", "Password must be at least 8 characters.");
  }

  const role = await db.role.findUnique({
    where: { id: roleId },
    select: { id: true },
  });

  if (!role) {
    redirectWithMessage("usersError", "Choose a valid role.");
  }

  const existing = await db.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    redirectWithMessage("usersError", "An admin user with that email already exists.");
  }

  await db.adminUser.create({
    data: {
      email,
      isActive,
      name,
      passwordHash: await hashPassword(password),
      roleId: role.id,
    },
  });

  revalidateUsers();
  redirectWithMessage("usersUpdated", "Admin user created.");
}

export async function updateAdminUserAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();

  const userId = readString(formData, "userId");
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const roleId = readString(formData, "roleId");
  const password = String(formData.get("password") ?? "");
  const isActive = readString(formData, "isActive") === "true";

  if (!userId || !name || !email || !roleId) {
    redirectWithMessage("usersError", "User, name, email, and role are required.");
  }

  if (password && password.length < 8) {
    redirectWithMessage("usersError", "Password must be at least 8 characters.");
  }

  const [targetUser, nextRole] = await Promise.all([
    db.adminUser.findUnique({
      where: { id: userId },
      select: {
        email: true,
        id: true,
        role: {
          select: {
            slug: true,
          },
        },
      },
    }),
    db.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        slug: true,
      },
    }),
  ]);

  if (!targetUser) {
    redirectWithMessage("usersError", "Admin user no longer exists.");
  }

  if (!nextRole) {
    redirectWithMessage("usersError", "Choose a valid role.");
  }

  if (targetUser.id === currentAdmin.id && !isActive) {
    redirectWithMessage("usersError", "You cannot deactivate your own account.");
  }

  await assertSuperAdminCanChange({
    nextIsActive: isActive,
    nextRoleSlug: nextRole.slug,
    targetRoleSlug: targetUser.role.slug,
    userId: targetUser.id,
  });

  const emailOwner = await db.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (emailOwner && emailOwner.id !== targetUser.id) {
    redirectWithMessage("usersError", "Another admin user already uses that email.");
  }

  await db.adminUser.update({
    where: { id: targetUser.id },
    data: {
      email,
      isActive,
      name,
      passwordHash: password ? await hashPassword(password) : undefined,
      roleId: nextRole.id,
    },
  });

  revalidateUsers();
  redirectWithMessage("usersUpdated", "Admin user updated.");
}

export async function resetAdminPasswordAction(formData: FormData) {
  await requireSuperAdmin();

  const userId = readString(formData, "userId");
  const password = String(formData.get("password") ?? "");

  if (!userId) {
    redirectWithMessage("usersError", "Admin user is required.");
  }

  if (!password) {
    redirectWithMessage("usersError", "Enter a new password to reset.");
  }

  if (password.length < 8) {
    redirectWithMessage("usersError", "Password must be at least 8 characters.");
  }

  const user = await db.adminUser.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    redirectWithMessage("usersError", "Admin user no longer exists.");
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
    },
  });

  revalidateUsers();
  redirectWithMessage("usersUpdated", "Admin password reset.");
}

export async function setAdminActiveAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();

  const userId = readString(formData, "userId");
  const isActive = readString(formData, "isActive") === "true";

  if (!userId) {
    redirectWithMessage("usersError", "Admin user is required.");
  }

  const targetUser = await db.adminUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!targetUser) {
    redirectWithMessage("usersError", "Admin user no longer exists.");
  }

  if (targetUser.id === currentAdmin.id && !isActive) {
    redirectWithMessage("usersError", "You cannot deactivate your own account.");
  }

  await assertSuperAdminCanChange({
    nextIsActive: isActive,
    nextRoleSlug: targetUser.role.slug,
    targetRoleSlug: targetUser.role.slug,
    userId: targetUser.id,
  });

  await db.adminUser.update({
    where: { id: targetUser.id },
    data: { isActive },
  });

  revalidateUsers();
  redirectWithMessage(
    "usersUpdated",
    isActive ? "Admin user activated." : "Admin user deactivated.",
  );
}

async function assertSuperAdminCanChange({
  nextIsActive,
  nextRoleSlug,
  targetRoleSlug,
  userId,
}: {
  nextIsActive: boolean;
  nextRoleSlug: string;
  targetRoleSlug: string;
  userId: string;
}) {
  if (
    targetRoleSlug !== "SUPER_ADMIN" ||
    (nextIsActive && nextRoleSlug === "SUPER_ADMIN")
  ) {
    return;
  }

  const activeSuperAdminsRemaining = await db.adminUser.count({
    where: {
      id: { not: userId },
      isActive: true,
      role: {
        slug: "SUPER_ADMIN",
      },
    },
  });

  if (activeSuperAdminsRemaining < 1) {
    redirectWithMessage(
      "usersError",
      "At least one active SUPER_ADMIN must remain.",
    );
  }
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithMessage(key: string, message: string): never {
  redirect(`/admin/users?${key}=${encodeURIComponent(message)}`);
}

function revalidateUsers() {
  try {
    revalidatePath("/admin/users");
    revalidatePath("/admin/roles");
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}
