import Link from "next/link";
import { ArrowLeft, CreditCard, Plus, Save, ShieldCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";
import {
  createPaymentGatewayAction,
  updatePaymentGatewayAction,
} from "@/app/admin/(panel)/settings/payments/actions";
import { requireSuperAdmin } from "@/lib/auth/admin-access";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Payment Gateway Settings",
};

type PaymentGatewaySettingsPageProps = {
  searchParams?: Promise<{
    paymentsError?: string;
    paymentsUpdated?: string;
  }>;
};

export default async function PaymentGatewaySettingsPage({
  searchParams,
}: PaymentGatewaySettingsPageProps) {
  await requireSuperAdmin();
  const resolvedSearchParams = await searchParams;
  const gateways = await getPaymentGateways();

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
            Payment Gateway Settings
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Configure future online payment gateways. This does not connect a
            real provider, start redirects, add webhooks, or change checkout
            payment behavior.
          </p>
        </div>
      </header>

      {resolvedSearchParams?.paymentsUpdated ? (
        <AlertMessage
          message={resolvedSearchParams.paymentsUpdated}
          tone="success"
        />
      ) : null}
      {resolvedSearchParams?.paymentsError ? (
        <AlertMessage message={resolvedSearchParams.paymentsError} tone="error" />
      ) : null}

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
        Secret values are never displayed. Until encryption is implemented,
        secret and webhook fields store only replacement placeholders.
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <SectionHeader
          description="Add a future online payment gateway configuration record."
          icon={Plus}
          title="Create Gateway"
        />
        <form action={createPaymentGatewayAction} className="grid gap-4 p-4 sm:p-5">
          <GatewayFields />
          <button className={primaryButtonClassName} type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create payment gateway
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <SectionHeader
          description="Gateway config table for future transaction creation, status sync, and webhook handling."
          icon={CreditCard}
          title="Payment Gateways"
        />

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Provider / Code</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Secrets</th>
                <th className="px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {gateways.map((gateway) => (
                <tr className="align-top" key={gateway.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">
                      {gateway.provider}
                    </p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {gateway.code}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{gateway.label}</td>
                  <td className="px-4 py-4">
                    <StatusBadge active={gateway.isActive} />
                  </td>
                  <td className="px-4 py-4">
                    <ModeBadge testMode={gateway.isTestMode} />
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {gateway.sortOrder}
                  </td>
                  <td className="px-4 py-4">
                    <SecretSummary gateway={gateway} />
                  </td>
                  <td className="min-w-[42rem] px-4 py-4">
                    <GatewayEditForm gateway={gateway} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 xl:hidden">
          {gateways.map((gateway) => (
            <article
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              key={gateway.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-base font-black text-zinc-950">
                    {gateway.label}
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-zinc-500">
                    {gateway.provider} / {gateway.code}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge active={gateway.isActive} />
                  <ModeBadge testMode={gateway.isTestMode} />
                </div>
              </div>
              <div className="mt-3">
                <SecretSummary gateway={gateway} />
              </div>
              <div className="mt-4">
                <GatewayEditForm gateway={gateway} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

type PaymentGatewayView = {
  code: string;
  hasSecretConfig: boolean;
  hasWebhookSecret: boolean;
  id: string;
  isActive: boolean;
  isTestMode: boolean;
  label: string;
  provider: string;
  publicConfigText: string;
  sortOrder: number;
};

async function getPaymentGateways(): Promise<PaymentGatewayView[]> {
  const gateways = await db.paymentGateway.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      code: true,
      id: true,
      isActive: true,
      isTestMode: true,
      label: true,
      provider: true,
      publicConfig: true,
      secretConfigPlaceholder: true,
      sortOrder: true,
      webhookSecretPlaceholder: true,
    },
  });

  return gateways.map((gateway) => ({
    code: gateway.code,
    hasSecretConfig: Boolean(gateway.secretConfigPlaceholder),
    hasWebhookSecret: Boolean(gateway.webhookSecretPlaceholder),
    id: gateway.id,
    isActive: gateway.isActive,
    isTestMode: gateway.isTestMode,
    label: gateway.label,
    provider: gateway.provider,
    publicConfigText: formatPublicConfig(gateway.publicConfig),
    sortOrder: gateway.sortOrder,
  }));
}

function GatewayEditForm({ gateway }: { gateway: PaymentGatewayView }) {
  return (
    <form action={updatePaymentGatewayAction} className="grid gap-3">
      <input name="gatewayId" type="hidden" value={gateway.id} />
      <GatewayFields gateway={gateway} />
      <button className={secondaryButtonClassName} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save gateway
      </button>
    </form>
  );
}

function GatewayFields({ gateway }: { gateway?: PaymentGatewayView }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Label">
          <input
            className={inputClassName}
            defaultValue={gateway?.label ?? ""}
            name="label"
            required
          />
        </FormField>
        <FormField label="Provider">
          <input
            className={inputClassName}
            defaultValue={gateway?.provider ?? "SSL_COMMERZ_PLACEHOLDER"}
            name="provider"
            required
          />
        </FormField>
        <FormField label="Code">
          <input
            className={inputClassName}
            defaultValue={gateway?.code ?? "ONLINE_PAYMENT"}
            name="code"
            required
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={String(gateway?.sortOrder ?? 0)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleField
          defaultChecked={gateway?.isActive ?? false}
          label="Active"
          name="isActive"
        />
        <ToggleField
          defaultChecked={gateway?.isTestMode ?? true}
          label="Test mode"
          name="isTestMode"
        />
      </div>

      <FormField label="Public Config JSON">
        <textarea
          className={textareaClassName}
          defaultValue={gateway?.publicConfigText ?? "{\n  \"note\": \"Placeholder only\"\n}"}
          name="publicConfig"
          rows={5}
        />
      </FormField>

      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Secret Config Replacement">
          <input
            autoComplete="off"
            className={inputClassName}
            name="secretConfigInput"
            placeholder={
              gateway?.hasSecretConfig
                ? "Configured. Enter new value to replace."
                : "Enter placeholder secret to mark configured."
            }
            type="password"
          />
        </FormField>
        <FormField label="Webhook Secret Replacement">
          <input
            autoComplete="off"
            className={inputClassName}
            name="webhookSecretInput"
            placeholder={
              gateway?.hasWebhookSecret
                ? "Configured. Enter new value to replace."
                : "Enter placeholder secret to mark configured."
            }
            type="password"
          />
        </FormField>
      </div>
    </div>
  );
}

function SecretSummary({ gateway }: { gateway: PaymentGatewayView }) {
  return (
    <div className="flex flex-wrap gap-2">
      <SecretBadge configured={gateway.hasSecretConfig} label="Secret config" />
      <SecretBadge configured={gateway.hasWebhookSecret} label="Webhook" />
    </div>
  );
}

function SectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof CreditCard;
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

function SecretBadge({
  configured,
  label,
}: {
  configured: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        configured
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      {label}: {configured ? "Configured" : "Not configured"}
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
