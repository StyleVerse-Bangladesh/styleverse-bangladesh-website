"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Power,
  Save,
  TicketPercent,
  Trash2,
  XCircle,
} from "lucide-react";
import { CouponType } from "@prisma/client";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponStatusAction,
  updateCouponAction,
  type CouponActionState,
} from "@/app/admin/(panel)/coupons/actions";
import { cn } from "@/lib/utils";

export type CouponAdminItem = {
  code: string;
  createdAt: string;
  currentUsageCount: number;
  deletable: boolean;
  id: string;
  isActive: boolean;
  maxUses: number | null;
  maxUsesPerCustomer: number | null;
  minimumOrder: number | null;
  remainingUses: number | null;
  totalRedemptions: number;
  type: CouponType;
  validUntil: string | null;
  validUntilInput: string;
  value: number;
};

type CouponAdminPageProps = {
  coupons: CouponAdminItem[];
};

const initialActionState: CouponActionState = {};
const couponTypes = [
  CouponType.PERCENTAGE,
  CouponType.FIXED,
  CouponType.FREE_SHIPPING,
] as const;

export function CouponAdminPage({ coupons }: CouponAdminPageProps) {
  const activeCount = coupons.filter((coupon) => coupon.isActive).length;
  const totalRedemptions = coupons.reduce(
    (total, coupon) => total + coupon.totalRedemptions,
    0,
  );
  const usageCount = coupons.reduce(
    (total, coupon) => total + coupon.currentUsageCount,
    0,
  );

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Coupons</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Coupon Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Manage database-backed coupon codes, usage limits, validity windows,
            and activation state for storefront validation.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Coupons" value={String(coupons.length)} />
          <StatTile label="Active" value={String(activeCount)} />
          <StatTile label="Usage Count" value={String(usageCount)} />
          <StatTile label="Redemptions" value={String(totalRedemptions)} />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Create Coupon</h2>
            <p className="text-sm text-zinc-500">
              Codes are normalized to uppercase before saving.
            </p>
          </div>
        </div>
        <CouponForm
          action={createCouponAction}
          submitLabel="Create coupon"
          variant="create"
        />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Coupons</h2>
            <p className="text-sm text-zinc-500">
              {coupons.length
                ? `${coupons.length} coupons in the database`
                : "No coupons in the database"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <TicketPercent className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {coupons.length ? (
          <CouponList coupons={coupons} />
        ) : (
          <EmptyCoupons />
        )}
      </section>
    </div>
  );
}

function CouponList({ coupons }: { coupons: CouponAdminItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto 2xl:block">
        <table className="w-full min-w-[1320px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Minimum Order</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Valid Until</th>
              <th className="px-4 py-3">Max Uses</th>
              <th className="px-4 py-3">Per Customer</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {coupons.map((coupon) => (
              <tr className="align-top" key={coupon.id}>
                <td className="px-4 py-4">
                  <CouponIdentity coupon={coupon} />
                </td>
                <td className="px-4 py-4">
                  <TypePill type={coupon.type} />
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-800">
                  {formatCouponValue(coupon)}
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {formatNullableMoney(coupon.minimumOrder)}
                </td>
                <td className="px-4 py-4">
                  <StatusPill active={coupon.isActive} />
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {coupon.validUntil ?? "No expiry"}
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {coupon.maxUses ?? "Unlimited"}
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {coupon.maxUsesPerCustomer ?? "Unlimited"}
                </td>
                <td className="px-4 py-4">
                  <UsageBlock coupon={coupon} />
                </td>
                <td className="px-4 py-4 text-zinc-600">{coupon.createdAt}</td>
                <td className="px-4 py-4">
                  <CouponActions coupon={coupon} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 2xl:hidden">
        {coupons.map((coupon) => (
          <CouponMobileCard coupon={coupon} key={coupon.id} />
        ))}
      </div>
    </>
  );
}

function CouponMobileCard({ coupon }: { coupon: CouponAdminItem }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CouponIdentity coupon={coupon} />
        <StatusPill active={coupon.isActive} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <InfoPair label="Type">
          <TypePill type={coupon.type} />
        </InfoPair>
        <InfoPair label="Value">{formatCouponValue(coupon)}</InfoPair>
        <InfoPair label="Minimum Order">
          {formatNullableMoney(coupon.minimumOrder)}
        </InfoPair>
        <InfoPair label="Valid Until">
          {coupon.validUntil ?? "No expiry"}
        </InfoPair>
        <InfoPair label="Max Uses">{coupon.maxUses ?? "Unlimited"}</InfoPair>
        <InfoPair label="Per Customer">
          {coupon.maxUsesPerCustomer ?? "Unlimited"}
        </InfoPair>
        <InfoPair label="Usage">
          <UsageBlock coupon={coupon} />
        </InfoPair>
        <InfoPair label="Created">{coupon.createdAt}</InfoPair>
      </dl>
      <div className="mt-4 border-t border-zinc-200 pt-4">
        <CouponActions coupon={coupon} />
      </div>
    </article>
  );
}

function CouponActions({ coupon }: { coupon: CouponAdminItem }) {
  return (
    <div className="grid gap-2">
      <ToggleCouponForm coupon={coupon} />
      <details className="group rounded-md border border-zinc-200 bg-zinc-50">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-semibold text-zinc-800">
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Edit
          </span>
          <ChevronDown
            className="h-4 w-4 text-zinc-500 transition group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-zinc-200 p-3">
          <CouponForm
            action={updateCouponAction}
            coupon={coupon}
            submitLabel="Save changes"
            variant="edit"
          />
        </div>
      </details>
      <DeleteCouponForm coupon={coupon} />
    </div>
  );
}

function CouponForm({
  action,
  coupon,
  submitLabel,
  variant,
}: {
  action: (
    state: CouponActionState,
    formData: FormData,
  ) => Promise<CouponActionState>;
  coupon?: CouponAdminItem;
  submitLabel: string;
  variant: "create" | "edit";
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values;

  useEffect(() => {
    if (variant === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, variant]);

  return (
    <form action={formAction} className="grid gap-4" noValidate ref={formRef}>
      {coupon ? <input name="id" type="hidden" value={coupon.id} /> : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_13rem_10rem]">
        <FormField label="Coupon Code">
          <input
            className={inputClassName}
            defaultValue={values?.code ?? coupon?.code ?? ""}
            name="code"
            required
            type="text"
          />
        </FormField>
        <FormField label="Coupon Type">
          <select
            className={inputClassName}
            defaultValue={values?.type ?? coupon?.type ?? CouponType.PERCENTAGE}
            name="type"
          >
            {couponTypes.map((type) => (
              <option key={type} value={type}>
                {formatType(type)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Value">
          <input
            className={inputClassName}
            defaultValue={values?.value ?? String(coupon?.value ?? 0)}
            min="0"
            name="value"
            step="0.01"
            type="number"
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <FormField label="Minimum Order">
          <input
            className={inputClassName}
            defaultValue={
              values?.minimumOrder ?? String(coupon?.minimumOrder ?? 0)
            }
            min="0"
            name="minimumOrder"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField label="Valid Until">
          <input
            className={inputClassName}
            defaultValue={values?.validUntil ?? coupon?.validUntilInput ?? ""}
            name="validUntil"
            type="date"
          />
        </FormField>
        <FormField label="Max Uses">
          <input
            className={inputClassName}
            defaultValue={values?.maxUses ?? String(coupon?.maxUses ?? "")}
            min="0"
            name="maxUses"
            type="number"
          />
        </FormField>
        <FormField label="Max Uses Per Customer">
          <input
            className={inputClassName}
            defaultValue={
              values?.maxUsesPerCustomer ??
              String(coupon?.maxUsesPerCustomer ?? "")
            }
            min="0"
            name="maxUsesPerCustomer"
            type="number"
          />
        </FormField>
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm shadow-black/5">
        <input
          className="h-4 w-4 accent-zinc-950"
          defaultChecked={values?.isActive ?? coupon?.isActive ?? true}
          name="isActive"
          type="checkbox"
        />
        Active
      </label>

      <ActionMessage state={state} />
      <SubmitButton icon={variant === "create" ? Plus : Save} label={submitLabel} />
    </form>
  );
}

function ToggleCouponForm({ coupon }: { coupon: CouponAdminItem }) {
  const [state, formAction] = useActionState(
    toggleCouponStatusAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={coupon.id} />
      <button className={secondaryButtonClassName} type="submit">
        <Power className="h-4 w-4" aria-hidden="true" />
        {coupon.isActive ? "Deactivate" : "Activate"}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

function DeleteCouponForm({ coupon }: { coupon: CouponAdminItem }) {
  const [state, formAction] = useActionState(
    deleteCouponAction,
    initialActionState,
  );
  const Icon = coupon.deletable ? Trash2 : Archive;

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={coupon.id} />
      <button
        className={coupon.deletable ? dangerButtonClassName : secondaryButtonClassName}
        type="submit"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {coupon.deletable ? "Delete" : "Archive"}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

function CouponIdentity({ coupon }: { coupon: CouponAdminItem }) {
  return (
    <div className="min-w-0">
      <p className="break-words font-black text-zinc-950">{coupon.code}</p>
      <p className="mt-1 text-xs font-semibold text-zinc-500">
        Created {coupon.createdAt}
      </p>
    </div>
  );
}

function UsageBlock({ coupon }: { coupon: CouponAdminItem }) {
  return (
    <div className="grid gap-1 text-xs font-semibold text-zinc-600">
      <span>Current: {coupon.currentUsageCount}</span>
      <span>Total redemptions: {coupon.totalRedemptions}</span>
      <span>
        Remaining: {coupon.remainingUses === null ? "Unlimited" : coupon.remainingUses}
      </span>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center gap-1.5 rounded-md border px-2 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function TypePill({ type }: { type: CouponType }) {
  return (
    <span className="inline-flex h-7 w-fit items-center rounded-md border border-sky-200 bg-sky-50 px-2 text-xs font-semibold text-sky-700">
      {formatType(type)}
    </span>
  );
}

function EmptyCoupons() {
  return (
    <div className="px-4 py-12 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm shadow-black/10">
        <TicketPercent className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-5 text-lg font-black text-zinc-950">No coupons yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Create the first coupon above to start validating discounts from the
        database.
      </p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
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

function InfoPair({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 font-semibold text-zinc-800">{children}</dd>
    </div>
  );
}

function SubmitButton({
  icon: Icon,
  label,
}: {
  icon: typeof Save;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={primaryButtonClassName} disabled={pending} type="submit">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: CouponActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-semibold",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

function formatType(type: CouponType) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCouponValue(coupon: CouponAdminItem) {
  if (coupon.type === CouponType.PERCENTAGE) {
    return `${coupon.value}%`;
  }

  if (coupon.type === CouponType.FREE_SHIPPING) {
    return "Free shipping";
  }

  return formatMoney(coupon.value);
}

function formatNullableMoney(value: number | null) {
  return value === null ? "None" : formatMoney(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    currency: "BDT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";

const dangerButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 sm:w-fit";
