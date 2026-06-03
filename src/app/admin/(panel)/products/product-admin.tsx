"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Archive,
  CheckCircle2,
  CircleDashed,
  ImageOff,
  Loader2,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
} from "lucide-react";
import {
  archiveProductAction,
  updateProductStatusAction,
  type ProductActionState,
} from "@/app/admin/(panel)/products/actions";
import { cn } from "@/lib/utils";

export type ProductAdminStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ProductAdminItem = {
  compareAtPrice: string | null;
  createdAt: string;
  hasPreorder: boolean;
  id: string;
  imageAlt: string;
  imageUrl: string | null;
  name: string;
  orderItemCount: number;
  price: string;
  primaryCategoryLabel: string | null;
  primaryCategoryPathKey: string | null;
  slug: string;
  status: ProductAdminStatus;
  totalStock: number;
  updatedAt: string;
  variantCount: number;
};

export type ProductCategoryFilterOption = {
  id: string;
  label: string;
  pathKey: string;
  productCount: number;
};

export type ProductAdminFilters = {
  category: string;
  search: string;
  status: string;
};

type ProductAdminPageProps = {
  categories: ProductCategoryFilterOption[];
  filters: ProductAdminFilters;
  products: ProductAdminItem[];
  summary: {
    archived: number;
    draft: number;
    published: number;
    total: number;
  };
};

const initialActionState: ProductActionState = {};
const productStatuses: ProductAdminStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function ProductAdminPage({
  categories,
  filters,
  products,
  summary,
}: ProductAdminPageProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">Products</p>
            <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
              Product Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Review catalog records, publishing state, inventory rollups, and
              category assignments from the database.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800"
            href="/admin/products/new"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total" value={String(summary.total)} />
          <StatTile label="Published" value={String(summary.published)} />
          <StatTile label="Draft" value={String(summary.draft)} />
          <StatTile label="Archived" value={String(summary.archived)} />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_15rem_18rem_auto] lg:items-end">
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
                placeholder="Name or slug"
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
              {productStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Category">
            <select
              className={inputClassName}
              defaultValue={filters.category}
              name="category"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.pathKey} ({category.productCount})
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800"
              type="submit"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              href="/admin/products"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Products</h2>
            <p className="text-sm text-zinc-500">
              {products.length
                ? `${products.length} products match the current view`
                : "No products match the current view"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <Package className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {products.length ? (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Inventory</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {products.map((product) => (
                    <ProductTableRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 xl:hidden">
              {products.map((product) => (
                <ProductMobileCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <EmptyProducts />
        )}
      </section>
    </div>
  );
}

function ProductTableRow({ product }: { product: ProductAdminItem }) {
  return (
    <tr className="align-top">
      <td className="px-4 py-4">
        <ProductIdentity product={product} />
      </td>
      <td className="px-4 py-4">
        <PriceBlock product={product} />
      </td>
      <td className="px-4 py-4">
        <StatusPill status={product.status} />
      </td>
      <td className="max-w-[14rem] px-4 py-4">
        <CategoryBlock product={product} />
      </td>
      <td className="px-4 py-4">
        <InventoryBlock product={product} />
      </td>
      <td className="px-4 py-4">
        <DateBlock product={product} />
      </td>
      <td className="px-4 py-4">
        <ProductActions product={product} />
      </td>
    </tr>
  );
}

function ProductMobileCard({ product }: { product: ProductAdminItem }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <div className="flex items-start gap-3">
        <ProductThumb product={product} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-black text-zinc-950">
            {product.name}
          </p>
          <p className="mt-1 break-words font-mono text-xs text-zinc-500">
            {product.slug}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill status={product.status} />
            {product.hasPreorder ? <PreorderPill /> : null}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <InfoPair label="Price">
          <PriceBlock product={product} />
        </InfoPair>
        <InfoPair label="Category">
          <CategoryBlock product={product} />
        </InfoPair>
        <InfoPair label="Inventory">
          <InventoryBlock product={product} />
        </InfoPair>
        <InfoPair label="Dates">
          <DateBlock product={product} />
        </InfoPair>
      </dl>

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <ProductActions product={product} />
      </div>
    </article>
  );
}

function ProductIdentity({ product }: { product: ProductAdminItem }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="break-words font-black text-zinc-950">{product.name}</p>
        <p className="mt-1 break-words font-mono text-xs text-zinc-500">
          {product.slug}
        </p>
      </div>
    </div>
  );
}

function ProductThumb({ product }: { product: ProductAdminItem }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-zinc-400">
      {product.imageUrl ? (
        <Image
          alt={product.imageAlt}
          className="h-full w-full object-cover"
          height={64}
          src={product.imageUrl}
          unoptimized
          width={64}
        />
      ) : (
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function PriceBlock({ product }: { product: ProductAdminItem }) {
  return (
    <div className="grid gap-1">
      <p className="font-black text-zinc-950">{product.price}</p>
      {product.compareAtPrice ? (
        <p className="text-xs font-semibold text-zinc-500 line-through">
          {product.compareAtPrice}
        </p>
      ) : (
        <p className="text-xs font-semibold text-zinc-400">No compare price</p>
      )}
    </div>
  );
}

function CategoryBlock({ product }: { product: ProductAdminItem }) {
  return (
    <div className="grid gap-1">
      <p className="break-words font-semibold text-zinc-950">
        {product.primaryCategoryLabel ?? "Unassigned"}
      </p>
      <p className="break-words font-mono text-xs text-zinc-500">
        {product.primaryCategoryPathKey ?? "No category"}
      </p>
    </div>
  );
}

function InventoryBlock({ product }: { product: ProductAdminItem }) {
  return (
    <div className="grid gap-1">
      <p className="font-semibold text-zinc-950">
        {product.totalStock} stock across {product.variantCount} variants
      </p>
      {product.hasPreorder ? (
        <PreorderPill />
      ) : (
        <p className="text-xs font-semibold text-zinc-400">No preorder</p>
      )}
    </div>
  );
}

function DateBlock({ product }: { product: ProductAdminItem }) {
  return (
    <div className="grid gap-1 text-xs font-semibold text-zinc-500">
      <p>Created {product.createdAt}</p>
      <p>Updated {product.updatedAt}</p>
    </div>
  );
}

function ProductActions({ product }: { product: ProductAdminItem }) {
  return (
    <div className="grid gap-2">
      <Link
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
        href={`/admin/products/${product.id}/edit`}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit
      </Link>
      <ProductStatusForm product={product} />
      <ProductArchiveForm product={product} />
    </div>
  );
}

function ProductStatusForm({ product }: { product: ProductAdminItem }) {
  const [state, formAction] = useActionState(
    updateProductStatusAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={product.id} />
      <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
        <select
          className={inputClassName}
          defaultValue={product.status}
          name="status"
        >
          {productStatuses.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
        <SubmitButton icon={Save} label="Save" />
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function ProductArchiveForm({ product }: { product: ProductAdminItem }) {
  const [state, formAction] = useActionState(
    archiveProductAction,
    initialActionState,
  );
  const archived = product.status === "ARCHIVED";

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={product.id} />
      <button
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
          archived
            ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
            : "border-amber-200 bg-white text-amber-800 hover:border-amber-300 hover:bg-amber-50",
        )}
        disabled={archived}
        type="submit"
      >
        <Archive className="h-4 w-4" aria-hidden="true" />
        {archived ? "Archived" : "Archive"}
      </button>
      {product.orderItemCount > 0 ? (
        <p className="inline-flex items-start gap-1.5 text-xs font-semibold text-amber-700">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Order history retained
        </p>
      ) : null}
      <ActionMessage state={state} />
    </form>
  );
}

function StatusPill({ status }: { status: ProductAdminStatus }) {
  const Icon = status === "PUBLISHED" ? CheckCircle2 : CircleDashed;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold",
        status === "PUBLISHED" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "DRAFT" && "border-sky-200 bg-sky-50 text-sky-700",
        status === "ARCHIVED" && "border-zinc-200 bg-zinc-100 text-zinc-600",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {formatStatus(status)}
    </span>
  );
}

function PreorderPill() {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 text-xs font-semibold text-violet-700">
      <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
      Preorder
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

function SubmitButton({
  icon: Icon,
  label,
}: {
  icon: typeof Save;
  label: string;
}) {
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
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: ProductActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-xs font-semibold",
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

function EmptyProducts() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
        <Package className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-base font-black text-zinc-950">
        No products found
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Adjust search or filters to widen the product list.
      </p>
    </div>
  );
}

function formatStatus(status: ProductAdminStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";
