import type { ReactNode } from "react";
import {
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  createRoleAction,
  deleteRoleAction,
  updateRoleAction,
} from "@/app/admin/(panel)/roles/actions";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Roles & Permissions",
};

type AdminRolesPageProps = {
  searchParams?: Promise<{
    rolesError?: string;
    rolesUpdated?: string;
  }>;
};

const permissionModuleOrder = [
  "products",
  "categories",
  "inventory",
  "orders",
  "coupons",
  "cms",
  "settings",
] as const;

export default async function AdminRolesPage({
  searchParams,
}: AdminRolesPageProps) {
  await requireSuperAdmin();
  const resolvedSearchParams = await searchParams;
  const [roles, permissions] = await Promise.all([getRoles(), getPermissions()]);
  const permissionGroups = groupPermissionsByModule(permissions);

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Access Control</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Roles & Permissions
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-500">
            Manage BMS roles and assign module permissions.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5">
          <ShieldCheck className="h-4 w-4 text-sky-600" aria-hidden="true" />
          SUPER_ADMIN only
        </div>
      </header>

      {resolvedSearchParams?.rolesUpdated ? (
        <AlertMessage message={resolvedSearchParams.rolesUpdated} tone="success" />
      ) : null}
      {resolvedSearchParams?.rolesError ? (
        <AlertMessage message={resolvedSearchParams.rolesError} tone="error" />
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Create Role</h2>
            <p className="text-sm text-zinc-500">
              Add a role and assign its starting permissions.
            </p>
          </div>
        </div>
        <form action={createRoleAction} className="grid gap-4 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Role Name">
              <input className={inputClassName} name="name" required />
            </FormField>
            <FormField label="Slug">
              <input
                className={inputClassName}
                name="slug"
                placeholder="ADMIN"
              />
            </FormField>
            <FormField label="Description">
              <input className={inputClassName} name="description" />
            </FormField>
          </div>
          <PermissionCheckboxGroups
            permissionGroups={permissionGroups}
            selectedPermissionIds={new Set()}
          />
          <button className={primaryButtonClassName} type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create role
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Role Directory</h2>
            <p className="text-sm text-zinc-500">
              SUPER_ADMIN cannot be deleted and always keeps every permission.
            </p>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Admin Users</th>
                <th className="px-4 py-3">Edit</th>
                <th className="px-4 py-3">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {roles.map((role) => (
                <tr key={role.id} className="align-top">
                  <td className="px-4 py-4 font-semibold text-zinc-950">
                    {role.name}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-600">
                    {role.slug}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-zinc-600">
                    {role.description || "No description"}
                  </td>
                  <td className="px-4 py-4">
                    <CountBadge count={role._count.rolePermissions} />
                  </td>
                  <td className="px-4 py-4">
                    <CountBadge count={role._count.adminUsers} />
                  </td>
                  <td className="min-w-[40rem] px-4 py-4">
                    <RoleEditForm
                      permissionGroups={permissionGroups}
                      role={role}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <DeleteRoleForm role={role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 xl:hidden">
          {roles.map((role) => (
            <article
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              key={role.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-base font-black text-zinc-950">
                    {role.name}
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-zinc-500">
                    {role.slug}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    {role.description || "No description"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CountBadge
                    count={role._count.rolePermissions}
                    label="permissions"
                  />
                  <CountBadge count={role._count.adminUsers} label="users" />
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <RoleEditForm permissionGroups={permissionGroups} role={role} />
                <DeleteRoleForm role={role} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

async function getRoles() {
  return db.role.findMany({
    orderBy: [{ slug: "asc" }],
    select: {
      _count: {
        select: {
          adminUsers: true,
          rolePermissions: true,
        },
      },
      description: true,
      id: true,
      name: true,
      rolePermissions: {
        select: {
          permissionId: true,
        },
      },
      slug: true,
    },
  });
}

async function getPermissions() {
  return db.permission.findMany({
    orderBy: [{ module: "asc" }, { name: "asc" }],
    select: {
      description: true,
      id: true,
      module: true,
      name: true,
      slug: true,
    },
  });
}

function RoleEditForm({
  permissionGroups,
  role,
}: {
  permissionGroups: PermissionGroups;
  role: Awaited<ReturnType<typeof getRoles>>[number];
}) {
  const selectedPermissionIds = new Set(
    role.rolePermissions.map((item) => item.permissionId),
  );
  const isSuperAdmin = role.slug === "SUPER_ADMIN";

  return (
    <form action={updateRoleAction} className="grid gap-3">
      <input name="roleId" type="hidden" value={role.id} />
      <div className="grid gap-2 md:grid-cols-3">
        <input
          className={inputClassName}
          defaultValue={role.name}
          name="name"
          placeholder="Role name"
          required
        />
        <input
          className={inputClassName}
          defaultValue={role.slug}
          disabled={isSuperAdmin}
          name="slug"
          placeholder="Slug"
        />
        <input
          className={inputClassName}
          defaultValue={role.description ?? ""}
          name="description"
          placeholder="Description"
        />
      </div>
      {isSuperAdmin ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
          SUPER_ADMIN keeps all permissions automatically.
        </div>
      ) : null}
      <PermissionCheckboxGroups
        disabled={isSuperAdmin}
        permissionGroups={permissionGroups}
        selectedPermissionIds={selectedPermissionIds}
      />
      <button className={secondaryButtonClassName} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save role
      </button>
    </form>
  );
}

function DeleteRoleForm({
  role,
}: {
  role: Awaited<ReturnType<typeof getRoles>>[number];
}) {
  const disabled = role.slug === "SUPER_ADMIN" || role._count.adminUsers > 0;

  return (
    <form action={deleteRoleAction}>
      <input name="roleId" type="hidden" value={role.id} />
      <button
        className={cn(
          secondaryButtonClassName,
          "border-red-200 text-red-700 hover:border-red-300",
          disabled && "cursor-not-allowed opacity-50",
        )}
        disabled={disabled}
        title={
          role.slug === "SUPER_ADMIN"
            ? "SUPER_ADMIN cannot be deleted"
            : role._count.adminUsers > 0
              ? "Remove assigned admin users before deleting"
              : "Delete role"
        }
        type="submit"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>
    </form>
  );
}

type Permission = Awaited<ReturnType<typeof getPermissions>>[number];
type PermissionGroups = Map<string, Permission[]>;

function PermissionCheckboxGroups({
  disabled = false,
  permissionGroups,
  selectedPermissionIds,
}: {
  disabled?: boolean;
  permissionGroups: PermissionGroups;
  selectedPermissionIds: Set<string>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {permissionModuleOrder.map((module) => {
        const permissions = permissionGroups.get(module) ?? [];

        return (
          <fieldset
            className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
            key={module}
          >
            <legend className="px-1 text-xs font-semibold uppercase text-zinc-500">
              {formatFreeText(module)}
            </legend>
            {permissions.length ? (
              <div className="mt-2 grid gap-2">
                {permissions.map((permission) => (
                  <label
                    className="flex items-start gap-2 text-sm font-semibold text-zinc-700"
                    key={permission.id}
                  >
                    <input
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-950"
                      defaultChecked={selectedPermissionIds.has(permission.id)}
                      disabled={disabled}
                      name="permissionIds"
                      type="checkbox"
                      value={permission.id}
                    />
                    <span className="min-w-0">
                      <span className="block break-words">{permission.name}</span>
                      <span className="block break-words font-mono text-xs font-medium text-zinc-500">
                        {permission.slug}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-semibold text-zinc-400">
                No permissions seeded.
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

function groupPermissionsByModule(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();

  for (const moduleName of permissionModuleOrder) {
    groups.set(moduleName, []);
  }

  for (const permission of permissions) {
    const items = groups.get(permission.module) ?? [];
    items.push(permission);
    groups.set(permission.module, items);
  }

  return groups;
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function AlertMessage({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  const success = tone === "success";

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-semibold",
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={success ? "status" : "alert"}
    >
      {message}
    </div>
  );
}

function CountBadge({
  count,
  label,
}: {
  count: number;
  label?: string;
}) {
  return (
    <span className="inline-flex h-7 w-fit items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-600">
      {count}
      {label ? ` ${label}` : null}
    </span>
  );
}

function formatFreeText(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500";

const primaryButtonClassName =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 sm:w-fit";

const secondaryButtonClassName =
  "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 disabled:hover:border-zinc-200 disabled:hover:bg-white sm:w-fit";
