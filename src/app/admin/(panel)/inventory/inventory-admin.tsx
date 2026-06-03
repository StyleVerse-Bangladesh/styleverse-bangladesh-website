"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ImageOff,
  Loader2,
  PackageSearch,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  updatePreorderAction,
  updateVariantStatusAction,
  updateVariantStockAction,
  type InventoryActionState,
} from "@/app/admin/(panel)/inventory/actions";
import { cn } from "@/lib/utils";

export type InventoryStatusValue =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "PRE_ORDER";

export type InventoryFilters = {
  lowStockOnly: boolean;
  preorderOnly: boolean;
  search: string;
  status: InventoryStatusValue | "";
};

export type InventoryItem = {
  colorName: string;
  colorValue: string;
  id: string;
  imageAlt: string;
  imageUrl: string | null;
  isLowStock: boolean;
  lowStockThreshold: string;
  preorderEnabled: boolean;
  preorderLimit: string;
  preorderShipsAt: string;
  preorderShipsAtLabel: string;
  productName: string;
  productSlug: string;
  size: string;
  sku: string;
  status: InventoryStatusValue;
  stock: number;
};

type InventoryAdminPageProps = {
  filters: InventoryFilters;
  items: InventoryItem[];
  summary: {
    lowStock: number;
    outOfStock: number;
    preorder: number;
    total: number;
  };
};

const inventoryStatuses: InventoryStatusValue[] = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "PRE_ORDER",
];
const initialActionState: InventoryActionState = {};

export function InventoryAdminPage({
  filters,
  items,
  summary,
}: InventoryAdminPageProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">Inventory</p>
            <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
              Inventory Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Manage variant stock, availability states, low-stock controls,
              and preorder settings from one operational view.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Variants" value={String(summary.total)} />
          <StatTile label="Low Stock" value={String(summary.lowStock)} />
          <StatTile label="Out Of Stock" value={String(summary.outOfStock)} />
          <StatTile label="Preorder" value={String(summary.preorder)} />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_auto_auto_auto] lg:items-end">
          <FormField label="Search">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                className={cn(inputClassName, "pl-9")}
                defaultValue={filters.search}
                name="search"
                placeholder="Product name or SKU"
                type="search"
              />
            </div>
          </FormField>
          <FormField label="Status">
            <select
              className={inputClassName}
              defaultValue={filters.status}
              name="status"
            >
              <option value="">All statuses</option>
              {inventoryStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </FormField>
          <FilterToggle
            checked={filters.lowStockOnly}
            label="Low stock only"
            name="lowStock"
          />
          <FilterToggle
            checked={filters.preorderOnly}
            label="Preorder only"
            name="preorder"
          />
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <button className={primaryButtonClassName} type="submit">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
            <Link className={secondaryButtonClassName} href="/admin/inventory">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Variants</h2>
            <p className="text-sm text-zinc-500">
              {items.length
                ? `${items.length} variants match the current view`
                : "No variants match the current view"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <PackageSearch className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {items.length ? <InventoryList items={items} /> : <EmptyInventory />}
      </section>
    </div>
  );
}

function InventoryList({ items }: { items: InventoryItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto 2xl:block">
        <table className="w-full min-w-[1420px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Preorder</th>
              <th className="px-4 py-3">Quick Stock</th>
              <th className="px-4 py-3">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map((item) => (
              <tr className="align-top" key={item.id}>
                <td className="px-4 py-4">
                  <ProductIdentity item={item} />
                </td>
                <td className="px-4 py-4">
                  <VariantIdentity item={item} />
                </td>
                <td className="px-4 py-4">
                  <StockBlock item={item} />
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={item.status} />
                </td>
                <td className="px-4 py-4">
                  <PreorderBlock item={item} />
                </td>
                <td className="w-[22rem] px-4 py-4">
                  <StockUpdateForm item={item} />
                </td>
                <td className="w-[32rem] px-4 py-4">
                  <div className="grid gap-3">
                    <VariantStatusForm item={item} />
                    <PreorderForm item={item} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 2xl:hidden">
        {items.map((item) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5"
            key={item.id}
          >
            <div className="flex items-start gap-3">
              <ProductThumb item={item} />
              <div className="min-w-0 flex-1">
                <p className="break-words text-base font-black text-zinc-950">
                  {item.productName}
                </p>
                <p className="mt-1 break-words font-mono text-xs text-zinc-500">
                  {item.productSlug}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill status={item.status} />
                  {item.isLowStock ? <LowStockPill /> : null}
                  {item.preorderEnabled ? <PreorderPill /> : null}
                </div>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <InfoPair label="Variant">
                <VariantIdentity item={item} />
              </InfoPair>
              <InfoPair label="Stock">
                <StockBlock item={item} />
              </InfoPair>
              <InfoPair label="Preorder">
                <PreorderBlock item={item} />
              </InfoPair>
            </dl>

            <div className="mt-4 grid gap-4 border-t border-zinc-200 pt-4">
              <StockUpdateForm item={item} />
              <VariantStatusForm item={item} />
              <PreorderForm item={item} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ProductIdentity({ item }: { item: InventoryItem }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <ProductThumb item={item} />
      <div className="min-w-0">
        <p className="break-words font-black text-zinc-950">
          {item.productName}
        </p>
        <p className="mt-1 break-words font-mono text-xs text-zinc-500">
          {item.productSlug}
        </p>
      </div>
    </div>
  );
}

function ProductThumb({ item }: { item: InventoryItem }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-zinc-400">
      {item.imageUrl ? (
        <Image
          alt={item.imageAlt}
          className="h-full w-full object-cover"
          height={64}
          src={item.imageUrl}
          unoptimized
          width={64}
        />
      ) : (
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function VariantIdentity({ item }: { item: InventoryItem }) {
  return (
    <div className="grid gap-2">
      <p className="break-words font-mono text-xs font-semibold text-zinc-500">
        {item.sku || "No SKU"}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className={metaPillClassName}>Size {item.size}</span>
        <span className={cn(metaPillClassName, "gap-1.5")}>
          <span
            className="h-3 w-3 rounded-full border border-black/10"
            style={{ backgroundColor: item.colorValue }}
            aria-hidden="true"
          />
          {item.colorName}
        </span>
      </div>
    </div>
  );
}

function StockBlock({ item }: { item: InventoryItem }) {
  return (
    <div className="grid gap-1">
      <p className="text-xl font-black text-zinc-950">{item.stock}</p>
      <p className="text-xs font-semibold text-zinc-500">
        Threshold {item.lowStockThreshold || "not set"}
      </p>
      {item.isLowStock ? <LowStockPill /> : null}
    </div>
  );
}

function PreorderBlock({ item }: { item: InventoryItem }) {
  return (
    <div className="grid gap-1">
      {item.preorderEnabled ? <PreorderPill /> : <MutedPill label="Disabled" />}
      <p className="text-xs font-semibold text-zinc-500">
        Ships {item.preorderShipsAtLabel}
      </p>
      <p className="text-xs font-semibold text-zinc-500">
        Limit {item.preorderLimit || "not set"}
      </p>
    </div>
  );
}

function StockUpdateForm({ item }: { item: InventoryItem }) {
  const [state, formAction] = useActionState(
    updateVariantStockAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <input name="variantId" type="hidden" value={item.id} />
      <div className="grid gap-2 sm:grid-cols-[8rem_6rem_minmax(0,1fr)_auto]">
        <select className={inputClassName} defaultValue="increase" name="operation">
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
          <option value="set">Set exact</option>
        </select>
        <input
          className={inputClassName}
          min="0"
          name="quantity"
          placeholder="Qty"
          required
          step="1"
          type="number"
        />
        <input
          className={inputClassName}
          name="reason"
          placeholder="Reason"
          type="text"
        />
        <SubmitButton label="Apply" />
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function VariantStatusForm({ item }: { item: InventoryItem }) {
  const [state, formAction] = useActionState(
    updateVariantStatusAction,
    initialActionState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3"
    >
      <input name="variantId" type="hidden" value={item.id} />
      <p className="text-xs font-semibold uppercase text-zinc-500">
        Status Settings
      </p>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
        <select className={inputClassName} defaultValue={item.status} name="status">
          {inventoryStatuses.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
        <input
          className={inputClassName}
          defaultValue={item.lowStockThreshold}
          min="0"
          name="lowStockThreshold"
          placeholder="Threshold"
          step="1"
          type="number"
        />
        <SubmitButton label="Save" />
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function PreorderForm({ item }: { item: InventoryItem }) {
  const [state, formAction] = useActionState(
    updatePreorderAction,
    initialActionState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3"
    >
      <input name="variantId" type="hidden" value={item.id} />
      <p className="text-xs font-semibold uppercase text-zinc-500">
        Preorder Settings
      </p>
      <div className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_8rem_auto]">
        <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5">
          <input
            className="h-4 w-4 accent-zinc-950"
            defaultChecked={item.preorderEnabled}
            name="preorderEnabled"
            type="checkbox"
          />
          Enabled
        </label>
        <input
          className={inputClassName}
          defaultValue={item.preorderShipsAt}
          name="shipsAt"
          type="date"
        />
        <input
          className={inputClassName}
          defaultValue={item.preorderLimit}
          min="0"
          name="limitQuantity"
          placeholder="Limit"
          step="1"
          type="number"
        />
        <SubmitButton label="Save" />
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: InventoryActionState }) {
  const message = state.ok ? state.message : state.error;

  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-xs font-semibold",
        state.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={state.ok ? "status" : "alert"}
    >
      {message}
    </p>
  );
}

function StatusPill({ status }: { status: InventoryStatusValue }) {
  const statusClasses = {
    IN_STOCK: "border-emerald-200 bg-emerald-50 text-emerald-700",
    LOW_STOCK: "border-amber-200 bg-amber-50 text-amber-700",
    OUT_OF_STOCK: "border-red-200 bg-red-50 text-red-700",
    PRE_ORDER: "border-violet-200 bg-violet-50 text-violet-700",
  } satisfies Record<InventoryStatusValue, string>;
  const Icon = status === "OUT_OF_STOCK" ? AlertTriangle : CheckCircle2;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold",
        statusClasses[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {formatStatus(status)}
    </span>
  );
}

function LowStockPill() {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      Low stock
    </span>
  );
}

function PreorderPill() {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 text-xs font-semibold text-violet-700">
      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
      Preorder
    </span>
  );
}

function MutedPill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-zinc-100 px-2 text-xs font-semibold text-zinc-600">
      {label}
    </span>
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

function FilterToggle({
  checked,
  label,
  name,
}: {
  checked: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5">
      <input
        className="h-4 w-4 accent-zinc-950"
        defaultChecked={checked}
        name={name}
        type="checkbox"
        value="1"
      />
      {label}
    </label>
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
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function EmptyInventory() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
        <PackageSearch className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-base font-black text-zinc-950">
        No variants found
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Adjust search or filters to widen the inventory list.
      </p>
    </div>
  );
}

function formatStatus(status: InventoryStatusValue) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800";

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";

const metaPillClassName =
  "inline-flex h-7 items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-600";
