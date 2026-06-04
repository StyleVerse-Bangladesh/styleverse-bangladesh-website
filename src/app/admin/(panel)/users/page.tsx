import {
  KeyRound,
  Plus,
  Save,
  ShieldCheck,
  UserCog,
  UserX,
} from "lucide-react";
import {
  createAdminUserAction,
  resetAdminPasswordAction,
  setAdminActiveAction,
  updateAdminUserAction,
} from "@/app/admin/(panel)/users/actions";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Users",
};

type AdminUsersPageProps = {
  searchParams?: Promise<{
    usersError?: string;
    usersUpdated?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireSuperAdmin();
  const resolvedSearchParams = await searchParams;
  const [users, roles] = await Promise.all([getAdminUsers(), getRoles()]);

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Access Control</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Admin Users
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-500">
            Manage BMS admin accounts, roles, passwords, and active status.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5">
          <ShieldCheck className="h-4 w-4 text-sky-600" aria-hidden="true" />
          SUPER_ADMIN only
        </div>
      </header>

      {resolvedSearchParams?.usersUpdated ? (
        <AlertMessage message={resolvedSearchParams.usersUpdated} tone="success" />
      ) : null}
      {resolvedSearchParams?.usersError ? (
        <AlertMessage message={resolvedSearchParams.usersError} tone="error" />
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">
              Create Admin User
            </h2>
            <p className="text-sm text-zinc-500">
              Password is required for new admin accounts.
            </p>
          </div>
        </div>
        <form action={createAdminUserAction} className="grid gap-4 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Name">
              <input className={inputClassName} name="name" required />
            </FormField>
            <FormField label="Email">
              <input
                className={inputClassName}
                name="email"
                required
                type="email"
              />
            </FormField>
            <FormField label="Role">
              <RoleSelect roles={roles} />
            </FormField>
            <FormField label="Password">
              <input
                className={inputClassName}
                minLength={8}
                name="password"
                required
                type="password"
              />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <input
              className="h-4 w-4 rounded border-zinc-300 text-zinc-950"
              defaultChecked
              name="isActive"
              type="checkbox"
              value="true"
            />
            Active account
          </label>
          <button className={primaryButtonClassName} type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create admin user
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <UserCog className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Admin Accounts</h2>
            <p className="text-sm text-zinc-500">
              Password hashes are never selected or displayed.
            </p>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Edit</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-4 py-4 font-semibold text-zinc-950">
                    {user.name}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <RoleBadge slug={user.role.slug} label={user.role.name} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge active={user.isActive} />
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="min-w-80 px-4 py-4">
                    <AdminUserEditForm roles={roles} user={user} />
                  </td>
                  <td className="min-w-56 px-4 py-4">
                    <PasswordResetForm userId={user.id} />
                  </td>
                  <td className="px-4 py-4">
                    <ActiveToggleForm
                      active={user.isActive}
                      userId={user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 xl:hidden">
          {users.map((user) => (
            <article
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              key={user.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-base font-black text-zinc-950">
                    {user.name}
                  </p>
                  <p className="mt-1 break-words text-sm text-zinc-600">
                    {user.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RoleBadge slug={user.role.slug} label={user.role.name} />
                    <StatusBadge active={user.isActive} />
                  </div>
                </div>
                <dl className="grid gap-2 text-xs text-zinc-600 sm:text-right">
                  <InfoPair label="Last Login">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                  </InfoPair>
                  <InfoPair label="Created">
                    {formatDateTime(user.createdAt)}
                  </InfoPair>
                </dl>
              </div>
              <div className="mt-4 grid gap-3">
                <AdminUserEditForm roles={roles} user={user} />
                <PasswordResetForm userId={user.id} />
                <ActiveToggleForm active={user.isActive} userId={user.id} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

async function getAdminUsers() {
  return db.adminUser.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      createdAt: true,
      email: true,
      id: true,
      isActive: true,
      lastLoginAt: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      roleId: true,
    },
  });
}

async function getRoles() {
  return db.role.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

function AdminUserEditForm({
  roles,
  user,
}: {
  roles: Awaited<ReturnType<typeof getRoles>>;
  user: Awaited<ReturnType<typeof getAdminUsers>>[number];
}) {
  return (
    <form action={updateAdminUserAction} className="grid gap-2">
      <input name="userId" type="hidden" value={user.id} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className={inputClassName}
          defaultValue={user.name}
          name="name"
          placeholder="Name"
          required
        />
        <input
          className={inputClassName}
          defaultValue={user.email}
          name="email"
          placeholder="Email"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <RoleSelect defaultValue={user.roleId} roles={roles} />
        <select
          className={inputClassName}
          defaultValue={user.isActive ? "true" : "false"}
          name="isActive"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <input
          className={inputClassName}
          minLength={8}
          name="password"
          placeholder="Optional password"
          type="password"
        />
      </div>
      <button className={secondaryButtonClassName} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save
      </button>
    </form>
  );
}

function PasswordResetForm({ userId }: { userId: string }) {
  return (
    <form action={resetAdminPasswordAction} className="grid gap-2">
      <input name="userId" type="hidden" value={userId} />
      <input
        className={inputClassName}
        minLength={8}
        name="password"
        placeholder="New password"
        type="password"
      />
      <button className={secondaryButtonClassName} type="submit">
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        Reset
      </button>
    </form>
  );
}

function ActiveToggleForm({
  active,
  userId,
}: {
  active: boolean;
  userId: string;
}) {
  return (
    <form action={setAdminActiveAction}>
      <input name="userId" type="hidden" value={userId} />
      <input name="isActive" type="hidden" value={active ? "false" : "true"} />
      <button
        className={cn(
          secondaryButtonClassName,
          !active && "border-emerald-200 text-emerald-700 hover:border-emerald-300",
          active && "border-red-200 text-red-700 hover:border-red-300",
        )}
        type="submit"
      >
        <UserX className="h-4 w-4" aria-hidden="true" />
        {active ? "Deactivate" : "Activate"}
      </button>
    </form>
  );
}

function RoleSelect({
  defaultValue,
  roles,
}: {
  defaultValue?: string;
  roles: Awaited<ReturnType<typeof getRoles>>;
}) {
  return (
    <select
      className={inputClassName}
      defaultValue={defaultValue ?? roles[0]?.id}
      name="roleId"
      required
    >
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
}

function FormField({
  children,
  label,
}: {
  children: React.ReactNode;
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

function InfoPair({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-zinc-700">{children}</dd>
    </div>
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

function RoleBadge({ label, slug }: { label: string; slug: string }) {
  return (
    <span className="inline-flex h-7 w-fit items-center rounded-md border border-sky-200 bg-sky-50 px-2 text-xs font-semibold text-sky-700">
      {label || formatFreeText(slug)}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
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
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 sm:w-fit";

const secondaryButtonClassName =
  "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 sm:w-fit";
