"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  ImageOff,
  Pencil,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  updateProductStatusAction,
  type ProductActionState,
} from "@/app/admin/(panel)/products/actions";
import { cn } from "@/lib/utils";

export type ProductAdminStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProductAdminStatusFilter = ProductAdminStatus | "ALL";

export type ProductAdminItem = {
  categories: {
    label: string;
    pathKey: string;
  }[];
  compareAtPrice: string | null;
  createdAt: string;
  hasPreorder: boolean;
  id: string;
  imageAlt: string;
  imageUrl: string | null;
  inventoryBreakdown: {
    label: string;
    stock: number;
  }[];
  inventoryState: "IN_STOCK" | "PREORDER" | "OUT_OF_STOCK";
  name: string;
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
  status: ProductAdminStatusFilter;
};

type ProductAdminPagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ProductAdminPageProps = {
  categories: ProductCategoryFilterOption[];
  filters: ProductAdminFilters;
  pagination: ProductAdminPagination;
  products: ProductAdminItem[];
  summary: {
    archived: number;
    published: number;
    total: number;
  };
};

const initialActionState: ProductActionState = {};
const productStatusFilters: {
  label: string;
  value: "" | ProductAdminStatus;
}[] = [
  { label: "All", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];
const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";
const actionButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55";

export function ProductAdminPage({
  categories,
  filters,
  pagination,
  products,
  summary,
}: ProductAdminPageProps) {
  const showingStart = products.length
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const showingEnd = products.length
    ? showingStart + products.length - 1
    : 0;

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            All Products
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Manage product publishing, stock visibility, and safe catalog
            actions from the current database records.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
            <SummaryPill label="Total" value={summary.total} />
            <SummaryPill label="Published" value={summary.published} />
            <SummaryPill label="Archived" value={summary.archived} />
          </div>
        </div>

        <ProductToolbar categories={categories} filters={filters} />
      </header>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex flex-col gap-1 border-b border-zinc-100 px-4 py-3 sm:px-5">
          <p className="text-sm font-black text-zinc-950">
            {pagination.totalItems} matching products
          </p>
          <p className="text-xs font-medium text-zinc-500">
            Showing {showingStart}-{showingEnd} of {pagination.totalItems}
          </p>
        </div>

        {products.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="border-b border-zinc-100 bg-white text-xs font-black text-zinc-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4 text-center">Downloadable</th>
                    <th className="px-5 py-4 text-center">Is Published</th>
                    <th className="px-5 py-4 text-center">In Stock</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map((product) => (
                    <ProductTableRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {products.map((product) => (
                <ProductMobileCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <EmptyProducts />
        )}

        <ProductPagination filters={filters} pagination={pagination} />
      </section>
    </div>
  );
}

function ProductToolbar({
  categories,
  filters,
}: {
  categories: ProductCategoryFilterOption[];
  filters: ProductAdminFilters;
}) {
  return (
    <form className="w-full max-w-3xl xl:max-w-none">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start xl:justify-end">
        <input
          className={cn(inputClassName, "sm:w-72")}
          defaultValue={filters.search}
          name="search"
          placeholder="Search..."
          type="search"
        />
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f23518] px-4 text-sm font-black text-white shadow-sm shadow-black/10 transition hover:bg-[#d92f15]"
          type="submit"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sm:sr-only">Search</span>
        </button>
        <details className="group relative">
          <summary className="inline-flex min-h-11 w-full cursor-pointer list-none items-center justify-center gap-2 rounded-md bg-[#f23518] px-4 text-sm font-black text-white shadow-sm shadow-black/10 transition hover:bg-[#d92f15] sm:w-auto [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filter
          </summary>
          <div className="z-20 mt-2 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg shadow-black/10 sm:absolute sm:right-0 sm:w-80">
            <FormField label="Status">
              <select
                className={inputClassName}
                defaultValue={getStatusFilterValue(filters.status)}
                name="status"
              >
                {productStatusFilters.map((status) => (
                  <option key={status.label} value={status.value}>
                    {status.label}
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                type="submit"
              >
                Apply filters
              </button>
              <Link
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                href="/admin/products"
              >
                Reset
              </Link>
            </div>
          </div>
        </details>
      </div>
    </form>
  );
}

function ProductTableRow({ product }: { product: ProductAdminItem }) {
  return (
    <tr
      className={cn(
        "align-middle",
        product.status === "ARCHIVED" && "bg-zinc-50/80",
      )}
    >
      <td className="px-5 py-4">
        <ProductIdentity product={product} />
      </td>
      <td className="px-5 py-4">
        <PriceBlock product={product} />
      </td>
      <td className="px-5 py-4 text-center">
        <span className="font-semibold text-slate-700">No</span>
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-center">
          <ProductPublishForm product={product} />
        </div>
      </td>
      <td className="px-5 py-4">
        <InventoryBlock product={product} />
      </td>
      <td className="px-5 py-4">
        <ProductActions product={product} />
      </td>
    </tr>
  );
}

function ProductMobileCard({ product }: { product: ProductAdminItem }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <ProductIdentity product={product} />
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <InfoPair label="Price">
          <PriceBlock product={product} />
        </InfoPair>
        <InfoPair label="Downloadable">
          <span className="font-semibold text-slate-700">No</span>
        </InfoPair>
        <InfoPair label="Is Published">
          <ProductPublishForm product={product} />
        </InfoPair>
        <InfoPair label="In Stock">
          <InventoryBlock product={product} />
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
        <p className="line-clamp-2 break-words font-black text-[#18365f]">
          {product.name}
        </p>
        {product.status === "ARCHIVED" ? <ArchivedBadge /> : null}
        <p className="mt-1 break-words text-xs font-semibold text-zinc-500">
          Categories: {formatCategories(product)}
        </p>
        {product.status === "PUBLISHED" && product.slug ? (
          <Link
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#18365f] underline-offset-2 hover:underline"
            href={`/products/${product.slug}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            View in shop
          </Link>
        ) : null}
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
    <div className="grid gap-1 text-slate-700">
      <p className="font-semibold">{product.price}</p>
      {product.compareAtPrice ? (
        <p className="text-xs font-semibold text-zinc-500 line-through">
          {product.compareAtPrice}
        </p>
      ) : null}
    </div>
  );
}

function InventoryBlock({ product }: { product: ProductAdminItem }) {
  return (
    <div className="mx-auto grid max-w-56 gap-1 text-center text-xs font-semibold text-slate-700">
      <p>{getInventorySummary(product)}</p>
      {product.inventoryBreakdown.length ? (
        <div className="max-h-16 overflow-y-auto pr-1 text-zinc-600">
          {product.inventoryBreakdown.slice(0, 8).map((variant, index) => (
            <p key={`${variant.label}-${index}`}>
              {variant.label}: {variant.stock}
            </p>
          ))}
          {product.inventoryBreakdown.length > 8 ? (
            <p>+{product.inventoryBreakdown.length - 8} more</p>
          ) : null}
        </div>
      ) : (
        <p className="text-zinc-400">No variants</p>
      )}
    </div>
  );
}

function ProductPublishForm({ product }: { product: ProductAdminItem }) {
  const [state, formAction] = useActionState(
    updateProductStatusAction,
    initialActionState,
  );
  const archived = product.status === "ARCHIVED";
  const published = product.status === "PUBLISHED";
  const targetStatus: ProductAdminStatus = published
    ? "ARCHIVED"
    : "PUBLISHED";

  return (
    <form action={formAction} className="grid justify-items-center gap-1">
      <input name="id" type="hidden" value={product.id} />
      <input name="status" type="hidden" value={targetStatus} />
      <PublishSwitchButton archived={archived} published={published} />
      {archived ? (
        <span className="text-xs font-semibold text-zinc-500">Archived</span>
      ) : null}
      <ActionMessage state={state} />
    </form>
  );
}

function PublishSwitchButton({
  archived,
  published,
}: {
  archived: boolean;
  published: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label={
        published
          ? "Unpublish product"
          : archived
            ? "Publish archived product"
            : "Publish product"
      }
      aria-pressed={published}
      className={cn(
        "inline-flex h-5 w-9 items-center rounded-full p-0.5 transition focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-55",
        published ? "bg-violet-500" : "bg-zinc-300",
      )}
      disabled={pending}
      type="submit"
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full bg-white shadow-sm transition",
          published && "translate-x-4",
        )}
      />
      <span className="sr-only">
        {pending
          ? "Saving"
          : published
            ? "Published"
            : archived
              ? "Archived"
              : "Unpublished"}
      </span>
    </button>
  );
}

function ProductActions({ product }: { product: ProductAdminItem }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
      <Link
        className={cn(
          actionButtonClassName,
          "border-[#f23518] bg-white text-[#f23518] hover:bg-red-50",
        )}
        href={`/admin/products/${product.id}/edit`}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit
      </Link>
      <button
        className={cn(
          actionButtonClassName,
          "border-[#18365f] bg-white text-[#18365f]",
        )}
        disabled
        title="Duplicate product is not implemented yet."
        type="button"
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        Duplicate
      </button>
    </div>
  );
}

function ProductPagination({
  filters,
  pagination,
}: {
  filters: ProductAdminFilters;
  pagination: ProductAdminPagination;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(
    pagination.currentPage,
    pagination.totalPages,
  );
  const previousPage = Math.max(1, pagination.currentPage - 1);
  const nextPage = Math.min(pagination.totalPages, pagination.currentPage + 1);

  return (
    <nav
      aria-label="Products pagination"
      className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <p className="text-sm font-semibold text-zinc-500">
        Page {pagination.currentPage} of {pagination.totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink
          disabled={pagination.currentPage === 1}
          href={buildPageHref(filters, previousPage)}
          label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </PaginationLink>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-md px-2 text-sm font-bold text-zinc-400"
              key={`ellipsis-${index}`}
            >
              ...
            </span>
          ) : (
            <PaginationLink
              active={item === pagination.currentPage}
              href={buildPageHref(filters, item)}
              key={item}
              label={`Page ${item}`}
            >
              {item}
            </PaginationLink>
          ),
        )}
        <PaginationLink
          disabled={pagination.currentPage === pagination.totalPages}
          href={buildPageHref(filters, nextPage)}
          label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  active = false,
  children,
  disabled = false,
  href,
  label,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  href: string;
  label: string;
}) {
  const className = cn(
    "inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-md border px-3 text-sm font-bold transition",
    active
      ? "border-zinc-950 bg-zinc-950 text-white"
      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
    disabled && "pointer-events-none opacity-50",
  );

  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={className}>
        {children}
      </span>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={className}
      href={href}
    >
      {children}
    </Link>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm shadow-black/5">
      {label}: <span className="text-zinc-950">{value}</span>
    </span>
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

function ActionMessage({ state }: { state: ProductActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "max-w-48 rounded-md border px-2 py-1 text-xs font-semibold",
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
        <ImageOff className="h-6 w-6" aria-hidden="true" />
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

function formatCategories(product: ProductAdminItem) {
  if (!product.categories.length) {
    return "Unassigned";
  }

  return product.categories.map((category) => category.label).join(", ");
}

function getInventorySummary(product: ProductAdminItem) {
  if (product.inventoryState === "IN_STOCK") {
    return `Yes · ${product.totalStock} units`;
  }

  if (product.inventoryState === "PREORDER") {
    return "Preorder";
  }

  return "No";
}

function buildPageHref(filters: ProductAdminFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin/products?${query}` : "/admin/products";
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);
  const validPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const items: Array<number | "ellipsis"> = [];

  validPages.forEach((page, index) => {
    const previous = validPages[index - 1];

    if (previous && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

function ArchivedBadge() {
  return (
    <span className="mt-1 inline-flex h-6 w-fit items-center rounded-md border border-zinc-200 bg-zinc-100 px-2 text-[0.68rem] font-black uppercase text-zinc-600">
      Archived
    </span>
  );
}

function getStatusFilterValue(status: ProductAdminStatusFilter) {
  return status === "ALL" ? "" : status;
}
