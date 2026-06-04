import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  FileText,
  Hash,
  MapPin,
  Package,
  ReceiptText,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { InvoiceDownloadControl } from "@/app/admin/(panel)/orders/[id]/invoice/invoice-download-control";
import { cn } from "@/lib/utils";
import { getOrCreateInvoiceForOrder } from "@/lib/invoices";

export const metadata = {
  title: "Admin Invoice",
};

type AdminInvoicePageProps = {
  params?: Promise<{
    id?: string;
  }>;
};

export default async function AdminInvoicePage({
  params,
}: AdminInvoicePageProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams?.id;

  if (!orderId) {
    notFound();
  }

  const invoice = await getOrCreateInvoiceForOrder(orderId);

  if (!invoice) {
    notFound();
  }

  const invoiceItems = getInvoiceItems(invoice.itemsSnapshot);

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Link className={secondaryButtonClassName} href="/admin/orders">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Orders
          </Link>
          <Link
            className={secondaryButtonClassName}
            href={`/admin/orders/${invoice.orderId}`}
          >
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            Order Details
          </Link>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">Invoice</p>
            <h1 className="break-words text-2xl font-black text-zinc-950 sm:text-3xl">
              {invoice.invoiceNumber}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Generated {formatDateTime(invoice.generatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={invoice.invoiceStatus} />
            <InvoiceDownloadControl orderId={invoice.orderId} />
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          <InfoCard icon={UserRound} title="Customer Snapshot">
            <JsonSnapshot value={invoice.customerSnapshot} />
          </InfoCard>

          <InfoCard icon={MapPin} title="Address Snapshot">
            <JsonSnapshot value={invoice.addressSnapshot} />
          </InfoCard>

          <InfoCard icon={Package} title="Item Snapshot">
            {invoiceItems.length ? (
              <div className="grid gap-3">
                {invoiceItems.map((item, index) => (
                  <article
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                    key={`${item.id ?? "invoice-item"}-${index}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black text-zinc-950">
                          {item.productTitle ?? "Invoice item"}
                        </p>
                        <p className="mt-1 break-words font-mono text-xs text-zinc-500">
                          {item.sku ?? item.productSlug ?? "No SKU"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.variantSize ? (
                            <MetaPill>Size {item.variantSize}</MetaPill>
                          ) : null}
                          {item.variantColor ? (
                            <MetaPill>{item.variantColor}</MetaPill>
                          ) : null}
                          {item.isPreorder ? <MetaPill>Preorder</MetaPill> : null}
                        </div>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-sm font-black text-zinc-950">
                          {formatMoney(Number(item.lineTotal ?? 0))}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-zinc-500">
                          {item.quantity ?? 0} x{" "}
                          {formatMoney(Number(item.unitPrice ?? 0))}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyInline message="No invoice item snapshot stored." />
            )}
          </InfoCard>
        </div>

        <aside className="grid gap-4 xl:content-start">
          <InfoCard icon={Hash} title="Invoice Details">
            <dl className="grid gap-3 text-sm">
              <InfoPair label="Invoice Number">{invoice.invoiceNumber}</InfoPair>
              <InfoPair label="Status">
                <StatusBadge status={invoice.invoiceStatus} />
              </InfoPair>
              <InfoPair label="Generated At">
                {formatDateTime(invoice.generatedAt)}
              </InfoPair>
              <InfoPair label="Order">
                <Link
                  className="font-semibold text-sky-700 underline-offset-2 hover:underline"
                  href={`/admin/orders/${invoice.orderId}`}
                >
                  View order details
                </Link>
              </InfoPair>
            </dl>
          </InfoCard>

          <InfoCard icon={FileText} title="Download">
            <InvoiceDownloadControl orderId={invoice.orderId} />
            <p className="mt-3 text-xs font-semibold text-zinc-500">
              PDF generation is planned for a later phase.
            </p>
          </InfoCard>

          <InfoCard icon={ReceiptText} title="Totals Snapshot">
            <dl className="grid gap-3 text-sm">
              <PricePair
                label="Subtotal"
                value={Number(invoice.subtotalSnapshot)}
              />
              <PricePair
                label="Delivery Fee"
                value={Number(invoice.deliveryFeeSnapshot)}
              />
              <PricePair
                label="Coupon Discount"
                value={Number(invoice.couponDiscountSnapshot) * -1}
              />
              <PricePair
                label="Shipping Discount"
                value={Number(invoice.shippingDiscountSnapshot) * -1}
              />
              <div className="border-t border-zinc-200 pt-3">
                <PricePair
                  emphasized
                  label="Grand Total"
                  value={Number(invoice.grandTotalSnapshot)}
                />
              </div>
            </dl>
          </InfoCard>
        </aside>
      </section>
    </div>
  );
}

type InvoiceItemSnapshot = {
  id: string | null;
  isPreorder?: boolean;
  lineTotal: string | null;
  productSlug?: string | null;
  productTitle: string | null;
  quantity?: number;
  sku?: string | null;
  unitPrice: string | null;
  variantColor?: string | null;
  variantSize?: string | null;
};

function getInvoiceItems(value: Prisma.JsonValue): InvoiceItemSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item) => ({
    id: readOptionalString(item.id),
    isPreorder: typeof item.isPreorder === "boolean" ? item.isPreorder : false,
    lineTotal: readOptionalString(item.lineTotal),
    productSlug: readOptionalString(item.productSlug),
    productTitle: readOptionalString(item.productTitle),
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    sku: readOptionalString(item.sku),
    unitPrice: readOptionalString(item.unitPrice),
    variantColor: readOptionalString(item.variantColor),
    variantSize: readOptionalString(item.variantSize),
  }));
}

function InfoCard({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
      <div className="flex items-center gap-3 border-b border-zinc-200 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="min-w-0 text-lg font-black text-zinc-950">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function JsonSnapshot({ value }: { value: Prisma.JsonValue }) {
  if (!isRecord(value)) {
    return <p className="text-sm text-zinc-600">{formatJsonValue(value)}</p>;
  }

  const entries = Object.entries(value);

  if (!entries.length) {
    return <EmptyInline message="No snapshot stored." />;
  }

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {entries.map(([key, entryValue]) => (
        <InfoPair key={key} label={formatFreeText(key)}>
          {formatJsonValue(entryValue)}
        </InfoPair>
      ))}
    </dl>
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
      <dd className="mt-1 break-words text-zinc-700">{children}</dd>
    </div>
  );
}

function PricePair({
  emphasized = false,
  label,
  value,
}: {
  emphasized?: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={cn("text-zinc-500", emphasized && "font-black text-zinc-950")}>
        {label}
      </dt>
      <dd className={cn("font-semibold text-zinc-950", emphasized && "text-lg")}>
        {formatMoney(value)}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex h-7 w-fit items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700">
      {formatStatus(status)}
    </span>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-600">
      {children}
    </span>
  );
}

function EmptyInline({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center text-sm font-semibold text-zinc-500">
      {message}
    </div>
  );
}

function isRecord(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readOptionalString(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" && value ? value : null;
}

function formatJsonValue(value: Prisma.JsonValue | undefined): string {
  if (value === null || value === undefined) {
    return "Not stored";
  }

  if (Array.isArray(value)) {
    return value.map((entry) => formatJsonValue(entry)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    currency: "BDT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
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

const secondaryButtonClassName =
  "inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";
