"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { db } from "@/lib/db";

export async function createRoleAction(formData: FormData) {
  await requireSuperAdmin();

  const name = readString(formData, "name");
  const slug = normalizeSlug(readString(formData, "slug") || name);
  const description = readString(formData, "description") || null;
  const permissionIds = readPermissionIds(formData);

  if (!name || !slug) {
    redirectWithMessage("rolesError", "Role name and slug are required.");
  }

  if (slug === "SUPER_ADMIN") {
    redirectWithMessage("rolesError", "SUPER_ADMIN role already exists and cannot be recreated.");
  }

  const existing = await db.role.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    redirectWithMessage("rolesError", "A role with that slug already exists.");
  }

  await db.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        description,
        name,
        slug,
      },
    });

    if (permissionIds.length) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          permissionId,
          roleId: role.id,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidateRoles();
  redirectWithMessage("rolesUpdated", "Role created.");
}

export async function updateRoleAction(formData: FormData) {
  await requireSuperAdmin();

  const roleId = readString(formData, "roleId");
  const name = readString(formData, "name");
  const description = readString(formData, "description") || null;
  const requestedSlug = normalizeSlug(readString(formData, "slug") || name);
  const requestedPermissionIds = readPermissionIds(formData);

  if (!roleId || !name) {
    redirectWithMessage("rolesError", "Role and name are required.");
  }

  const role = await db.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!role) {
    redirectWithMessage("rolesError", "Role no longer exists.");
  }

  const slug = role.slug === "SUPER_ADMIN" ? "SUPER_ADMIN" : requestedSlug;

  if (!slug) {
    redirectWithMessage("rolesError", "Role slug is required.");
  }

  const slugOwner = await db.role.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (slugOwner && slugOwner.id !== role.id) {
    redirectWithMessage("rolesError", "Another role already uses that slug.");
  }

  const permissionIds =
    role.slug === "SUPER_ADMIN"
      ? await getAllPermissionIds()
      : requestedPermissionIds;

  await db.$transaction(async (tx) => {
    await tx.role.update({
      where: { id: role.id },
      data: {
        description,
        name,
        slug,
      },
    });

    await tx.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (permissionIds.length) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          permissionId,
          roleId: role.id,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidateRoles();
  redirectWithMessage("rolesUpdated", "Role updated.");
}

export async function deleteRoleAction(formData: FormData) {
  await requireSuperAdmin();

  const roleId = readString(formData, "roleId");

  if (!roleId) {
    redirectWithMessage("rolesError", "Role is required.");
  }

  const role = await db.role.findUnique({
    where: { id: roleId },
    select: {
      _count: {
        select: {
          adminUsers: true,
        },
      },
      id: true,
      slug: true,
    },
  });

  if (!role) {
    redirectWithMessage("rolesError", "Role no longer exists.");
  }

  if (role.slug === "SUPER_ADMIN") {
    redirectWithMessage("rolesError", "SUPER_ADMIN role cannot be deleted.");
  }

  if (role._count.adminUsers > 0) {
    redirectWithMessage("rolesError", "Delete is allowed only when no admin users are assigned.");
  }

  await db.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: { roleId: role.id },
    });
    await tx.role.delete({
      where: { id: role.id },
    });
  });

  revalidateRoles();
  redirectWithMessage("rolesUpdated", "Role deleted.");
}

async function getAllPermissionIds() {
  const permissions = await db.permission.findMany({
    select: {
      id: true,
    },
  });

  return permissions.map((permission) => permission.id);
}

function readPermissionIds(formData: FormData) {
  return formData
    .getAll("permissionIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithMessage(key: string, message: string): never {
  redirect(`/admin/roles?${key}=${encodeURIComponent(message)}`);
}

function revalidateRoles() {
  try {
    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}
