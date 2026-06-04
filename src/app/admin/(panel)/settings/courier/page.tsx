import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  MapPinned,
  Plus,
  Save,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import {
  createCourierAccountAction,
  createCourierAreaMappingAction,
  updateCourierAccountAction,
  updateCourierAreaMappingAction,
} from "@/app/admin/(panel)/settings/courier/actions";
import { PathaoConnectionTest } from "@/app/admin/(panel)/settings/courier/pathao-connection-test";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Courier Settings",
};

type CourierSettingsPageProps = {
  searchParams?: Promise<{
    courierError?: string;
    courierUpdated?: string;
  }>;
};

export default async function CourierSettingsPage({
  searchParams,
}: CourierSettingsPageProps) {
  await requireSuperAdmin();
  const resolvedSearchParams = await searchParams;
  const [accounts, areaMappings] = await Promise.all([
    getCourierAccounts(),
    getCourierAreaMappings(),
  ]);

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Link className={secondaryButtonClassName} href="/admin/settings">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Store Settings
          </Link>
          <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5">
            <ShieldCheck className="h-4 w-4 text-sky-600" aria-hidden="true" />
            SUPER_ADMIN only
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Settings</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Courier Settings
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Configure the server-side foundation for future Pathao Merchant API
            courier accounts, delivery area mappings, shipment records, and
            tracking events.
          </p>
        </div>
      </header>

      {resolvedSearchParams?.courierUpdated ? (
        <AlertMessage
          message={resolvedSearchParams.courierUpdated}
          tone="success"
        />
      ) : null}
      {resolvedSearchParams?.courierError ? (
        <AlertMessage message={resolvedSearchParams.courierError} tone="error" />
      ) : null}

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
        Only the server-side Pathao authentication test is available. Shipment
        creation, tracking sync, and fraud checks are not enabled. Secret values
        are never displayed. Until encryption is implemented, secret and token
        fields store placeholders only.
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <SectionHeader
          description="Add a placeholder courier account for future Pathao Merchant API setup."
          icon={Plus}
          title="Create Courier Account"
        />
        <form action={createCourierAccountAction} className="grid gap-4 p-4 sm:p-5">
          <CourierAccountFields />
          <button className={primaryButtonClassName} type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create courier account
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <SectionHeader
          description="Courier account records for future token refresh, shipment creation, and tracking sync."
          icon={Truck}
          title="Courier Accounts"
        />

        <div className="hidden overflow-x-auto 2xl:block">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Active</th>
        <th className="px-4 py-3">Mode</th>
        <th className="px-4 py-3">Store ID placeholder</th>
        <th className="px-4 py-3">Connection</th>
        <th className="px-4 py-3">Sort order</th>
        <th className="px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {accounts.map((account) => (
                <tr className="align-top" key={account.id}>
                  <td className="px-4 py-4 font-semibold text-zinc-950">
                    {account.provider}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{account.label}</td>
                  <td className="px-4 py-4">
                    <StatusBadge active={account.isActive} />
                  </td>
                  <td className="px-4 py-4">
                    <ModeBadge testMode={account.isTestMode} />
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {account.storeIdPlaceholder || "Not configured"}
                  </td>
                  <td className="px-4 py-4">
                    <PathaoConnectionTest
                      accountId={account.id}
                      initialTokenExpiresAt={account.tokenExpiresAt}
                      provider={account.provider}
                    />
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {account.sortOrder}
                  </td>
                  <td className="min-w-[48rem] px-4 py-4">
                    <CourierAccountEditForm account={account} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 2xl:hidden">
          {accounts.map((account) => (
            <article
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              key={account.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-base font-black text-zinc-950">
                    {account.label}
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-zinc-500">
                    {account.provider}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge active={account.isActive} />
                  <ModeBadge testMode={account.isTestMode} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                <SummaryItem
                  label="Store ID"
                  value={account.storeIdPlaceholder || "Not configured"}
                />
                <SummaryItem
                  label="Token expiry"
                  value={account.tokenExpiresAtText}
                />
                <SummaryItem label="Sort" value={String(account.sortOrder)} />
              </div>
              <div className="mt-3">
                <PathaoConnectionTest
                  accountId={account.id}
                  initialTokenExpiresAt={account.tokenExpiresAt}
                  provider={account.provider}
                />
              </div>
              <div className="mt-4">
                <CourierAccountEditForm account={account} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <SectionHeader
          description="Manually map checkout city, zone, and area names to future Pathao IDs."
          icon={MapPinned}
          title="Create Area Mapping"
        />
        <form action={createCourierAreaMappingAction} className="grid gap-4 p-4 sm:p-5">
          <AreaMappingFields />
          <button className={primaryButtonClassName} type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create area mapping
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <SectionHeader
          description="Area mappings are editable now and can later be refreshed from Pathao city, zone, and area sync jobs."
          icon={MapPinned}
          title="Area Mappings"
        />
        <div className="grid gap-4 p-4 sm:p-5">
          {areaMappings.length ? (
            areaMappings.map((mapping) => (
              <form
                action={updateCourierAreaMappingAction}
                className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                key={mapping.id}
              >
                <input name="mappingId" type="hidden" value={mapping.id} />
                <AreaMappingFields mapping={mapping} />
                <button className={secondaryButtonClassName} type="submit">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save area mapping
                </button>
              </form>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm font-semibold text-zinc-500">
              No courier area mappings yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

type CourierAccountView = {
  clientIdPlaceholder: string;
  id: string;
  isActive: boolean;
  isTestMode: boolean;
  label: string;
  provider: string;
  publicConfigText: string;
  sortOrder: number;
  storeIdPlaceholder: string;
  tokenExpiresAt: string | null;
  tokenExpiresAtText: string;
  usernamePlaceholder: string;
};

type AreaMappingView = {
  areaId: string;
  areaName: string;
  cityId: string;
  cityName: string;
  id: string;
  isActive: boolean;
  provider: string;
  zoneId: string;
  zoneName: string;
};

async function getCourierAccounts(): Promise<CourierAccountView[]> {
  const accounts = await db.courierAccount.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      clientIdPlaceholder: true,
      id: true,
      isActive: true,
      isTestMode: true,
      label: true,
      provider: true,
      publicConfig: true,
      sortOrder: true,
      storeIdPlaceholder: true,
      tokenExpiresAt: true,
      usernamePlaceholder: true,
    },
  });

  return accounts.map((account) => ({
    clientIdPlaceholder: account.clientIdPlaceholder ?? "",
    id: account.id,
    isActive: account.isActive,
    isTestMode: account.isTestMode,
    label: account.label,
    provider: account.provider,
    publicConfigText: formatPublicConfig(account.publicConfig),
    sortOrder: account.sortOrder,
    storeIdPlaceholder: account.storeIdPlaceholder ?? "",
    tokenExpiresAt: account.tokenExpiresAt
      ? account.tokenExpiresAt.toISOString()
      : null,
    tokenExpiresAtText: account.tokenExpiresAt
      ? account.tokenExpiresAt.toISOString()
      : "Not configured",
    usernamePlaceholder: account.usernamePlaceholder ?? "",
  }));
}

async function getCourierAreaMappings(): Promise<AreaMappingView[]> {
  return db.courierAreaMapping.findMany({
    orderBy: [
      { cityName: "asc" },
      { zoneName: "asc" },
      { areaName: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      areaId: true,
      areaName: true,
      cityId: true,
      cityName: true,
      id: true,
      isActive: true,
      provider: true,
      zoneId: true,
      zoneName: true,
    },
  });
}

function CourierAccountEditForm({ account }: { account: CourierAccountView }) {
  return (
    <form action={updateCourierAccountAction} className="grid gap-3">
      <input name="accountId" type="hidden" value={account.id} />
      <CourierAccountFields account={account} />
      <button className={secondaryButtonClassName} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save courier account
      </button>
    </form>
  );
}

function CourierAccountFields({ account }: { account?: CourierAccountView }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Provider">
          <select
            className={inputClassName}
            defaultValue={account?.provider ?? "PATHAO"}
            name="provider"
          >
            <option value="PATHAO">PATHAO</option>
          </select>
        </FormField>
        <FormField label="Label">
          <input
            className={inputClassName}
            defaultValue={account?.label ?? ""}
            name="label"
            required
          />
        </FormField>
        <FormField label="Store ID Placeholder">
          <input
            className={inputClassName}
            defaultValue={account?.storeIdPlaceholder ?? ""}
            name="storeIdPlaceholder"
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={String(account?.sortOrder ?? 0)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Client ID Placeholder">
          <input
            className={inputClassName}
            defaultValue={account?.clientIdPlaceholder ?? ""}
            name="clientIdPlaceholder"
          />
        </FormField>
        <FormField label="Username Placeholder">
          <input
            className={inputClassName}
            defaultValue={account?.usernamePlaceholder ?? ""}
            name="usernamePlaceholder"
          />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleField
          defaultChecked={account?.isActive ?? false}
          label="Active"
          name="isActive"
        />
        <ToggleField
          defaultChecked={account?.isTestMode ?? true}
          label="Test mode"
          name="isTestMode"
        />
      </div>

      <FormField label="Public Config JSON">
        <textarea
          className={textareaClassName}
          defaultValue={
            account?.publicConfigText ??
            "{\n  \"note\": \"Placeholder only. No Pathao API calls are enabled.\"\n}"
          }
          name="publicConfig"
          rows={5}
        />
      </FormField>

      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Client Secret Replacement">
          <input
            autoComplete="off"
            className={inputClassName}
            name="clientSecretInput"
            placeholder="Enter new placeholder to replace; saved value is hidden."
            type="password"
          />
        </FormField>
        <FormField label="Password Replacement">
          <input
            autoComplete="off"
            className={inputClassName}
            name="passwordInput"
            placeholder="Enter new placeholder to replace; saved value is hidden."
            type="password"
          />
        </FormField>
      </div>
    </div>
  );
}

function AreaMappingFields({ mapping }: { mapping?: AreaMappingView }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Provider">
          <select
            className={inputClassName}
            defaultValue={mapping?.provider ?? "PATHAO"}
            name="provider"
          >
            <option value="PATHAO">PATHAO</option>
          </select>
        </FormField>
        <FormField label="City Name">
          <input
            className={inputClassName}
            defaultValue={mapping?.cityName ?? ""}
            name="cityName"
            required
          />
        </FormField>
        <FormField label="City ID">
          <input
            className={inputClassName}
            defaultValue={mapping?.cityId ?? ""}
            name="cityId"
            required
          />
        </FormField>
        <ToggleField
          defaultChecked={mapping?.isActive ?? true}
          label="Active"
          name="isActive"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Zone Name">
          <input
            className={inputClassName}
            defaultValue={mapping?.zoneName ?? ""}
            name="zoneName"
            required
          />
        </FormField>
        <FormField label="Zone ID">
          <input
            className={inputClassName}
            defaultValue={mapping?.zoneId ?? ""}
            name="zoneId"
            required
          />
        </FormField>
        <FormField label="Area Name">
          <input
            className={inputClassName}
            defaultValue={mapping?.areaName ?? ""}
            name="areaName"
            required
          />
        </FormField>
        <FormField label="Area ID">
          <input
            className={inputClassName}
            defaultValue={mapping?.areaId ?? ""}
            name="areaId"
            required
          />
        </FormField>
      </div>
    </div>
  );
}

function SectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-200 p-4 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-black text-zinc-950">{title}</h2>
        <p className="text-sm leading-6 text-zinc-500">{description}</p>
      </div>
    </div>
  );
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

function ToggleField({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800">
      <input
        className="h-4 w-4 accent-zinc-950"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-zinc-700">{value}</p>
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ModeBadge({ testMode }: { testMode: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        testMode
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-sky-200 bg-sky-50 text-sky-700",
      )}
    >
      {testMode ? "Test Mode" : "Live Mode"}
    </span>
  );
}

function formatPublicConfig(value: Prisma.JsonValue) {
  if (!value) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const textareaClassName =
  "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 sm:w-fit";

const secondaryButtonClassName =
  "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 sm:w-fit";
