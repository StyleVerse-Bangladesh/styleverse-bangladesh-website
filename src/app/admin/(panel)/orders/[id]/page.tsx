import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  NotebookText,
  Package,
  ReceiptText,
  Save,
  ShieldAlert,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
  type Prisma,
} from "@prisma/client";
import { updateOrderLifecycleStatusAction } from "@/app/admin/(panel)/orders/actions";
import {
  CourierActionGroup,
  FraudRiskCheckForm,
  OrderAdminNotesForm,
  PaymentSyncForm,
} from "@/app/admin/(panel)/orders/order-operational-controls";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Order Details",
};

type AdminOrderDetailsPageProps = {
  params?: Promise<{
    id?: string;
  }>;
  searchParams?: Promise<{
    statusError?: string;
    statusUpdated?: string;
  }>;
};

const orderStatusOptions = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

const paymentStatusOptions = [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
] as const;

const deliveryStatusOptions = [
  DeliveryStatus.PENDING,
  DeliveryStatus.PACKING,
  DeliveryStatus.SHIPPED,
  DeliveryStatus.DELIVERED,
  DeliveryStatus.RETURNED,
] as const;

export default async function AdminOrderDetailsPage({
  params,
  searchParams,
}: AdminOrderDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedParams?.id;

  if (!orderId) {
    notFound();
  }

  const [order, paymentMethodLabels, deliveryRuleLabels] = await Promise.all([
    getOrder(orderId),
    getPaymentMethodLabels(),
    getDeliveryRuleLabels(),
  ]);

  if (!order) {
    notFound();
  }

  const statusUpdated = resolvedSearchParams?.statusUpdated;
  const statusError = resolvedSearchParams?.statusError;
  const paymentMethod =
    paymentMethodLabels.get(order.paymentMethod) ??
    formatFreeText(order.paymentMethod);
  const deliveryMethod =
    deliveryRuleLabels.get(order.deliveryMethod) ??
    formatFreeText(order.deliveryMethod);
  const latestTransactionId =
    order.paymentEvents.find((event) => event.transactionId)?.transactionId ??
    null;
  const latestTrackingNumber =
    order.deliveryEvents.find((event) => event.trackingNumber)?.trackingNumber ??
    null;
  const latestRiskCheck = order.riskChecks[0] ?? null;

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex w-fit min-h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
            href="/admin/orders"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Orders
          </Link>
          <Link
            className="inline-flex w-fit min-h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
            href={`/admin/orders/${order.id}/invoice`}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Invoice
          </Link>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">Order Details</p>
            <h1 className="break-words text-2xl font-black text-zinc-950 sm:text-3xl">
              {order.orderNumber}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Created {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.deliveryStatus} />
          </div>
        </div>
      </header>

      {statusUpdated ? (
        <AlertMessage message={statusUpdated} tone="success" />
      ) : null}
      {statusError ? <AlertMessage message={statusError} tone="error" /> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          <InfoCard icon={UserRound} title="Customer Info">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoPair label="Name">{order.customerFullName}</InfoPair>
              <InfoPair label="Phone">{order.customerPhone}</InfoPair>
              <InfoPair label="Email">{order.customerEmail}</InfoPair>
              <InfoPair label="Customer Record">
                {order.customer ? (
                  <span>
                    {order.customer.fullName || order.customer.email || "Linked"}
                  </span>
                ) : (
                  <MutedText>Guest or deleted customer</MutedText>
                )}
              </InfoPair>
            </dl>
          </InfoCard>

          <InfoCard icon={MapPin} title="Address Snapshot">
            <JsonSnapshot value={order.addressSnapshot} />
          </InfoCard>

          <InfoCard icon={Package} title="Order Items">
            <div className="grid gap-3">
              {order.items.map((item) => (
                <article
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                  key={item.id}
                >
                  <div className="flex gap-3">
                    <ProductThumb
                      alt={item.productTitleSnapshot}
                      src={item.productImageSnapshot}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-black text-zinc-950">
                        {item.productTitleSnapshot}
                      </p>
                      <p className="mt-1 break-words font-mono text-xs text-zinc-500">
                        {item.skuSnapshot || item.productSlugSnapshot || "No SKU"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.variantSizeSnapshot ? (
                          <MetaPill>Size {item.variantSizeSnapshot}</MetaPill>
                        ) : null}
                        {item.variantColorSnapshot ? (
                          <MetaPill>{item.variantColorSnapshot}</MetaPill>
                        ) : null}
                        {item.isPreorder ? <MetaPill>Preorder</MetaPill> : null}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-zinc-950">
                        {formatMoney(Number(item.lineTotal))}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        {item.quantity} x{" "}
                        {formatMoney(Number(item.unitPriceSnapshot))}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </InfoCard>

          <InfoCard icon={ReceiptText} title="Coupon Snapshot">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoPair label="Code">
                {order.couponCodeSnapshot || <MutedText>No coupon</MutedText>}
              </InfoPair>
              <InfoPair label="Type">
                {order.couponTypeSnapshot ? (
                  formatFreeText(order.couponTypeSnapshot)
                ) : (
                  <MutedText>Not applied</MutedText>
                )}
              </InfoPair>
              <InfoPair label="Value">
                {order.couponValueSnapshot
                  ? formatMoney(Number(order.couponValueSnapshot))
                  : "BDT 0"}
              </InfoPair>
              <InfoPair label="Discount">
                {formatMoney(Number(order.couponDiscount))}
              </InfoPair>
            </dl>
          </InfoCard>
        </div>

        <aside className="grid gap-4 xl:content-start">
          <InfoCard icon={ReceiptText} title="Pricing Snapshot">
            <dl className="grid gap-3 text-sm">
              <PricePair label="Subtotal" value={Number(order.subtotal)} />
              <PricePair label="Delivery Fee" value={Number(order.deliveryFee)} />
              <PricePair
                label="Coupon Discount"
                value={Number(order.couponDiscount) * -1}
              />
              <PricePair
                label="Shipping Discount"
                value={Number(order.shippingDiscount) * -1}
              />
              <div className="border-t border-zinc-200 pt-3">
                <PricePair
                  emphasized
                  label="Grand Total"
                  value={Number(order.grandTotal)}
                />
              </div>
            </dl>
          </InfoCard>

          <InfoCard icon={ShieldAlert} title="Fraud / Risk Check">
            <div className="grid gap-4">
              <dl className="grid gap-3 text-sm">
                <InfoPair label="Customer Phone">{order.customerPhone}</InfoPair>
                <InfoPair label="Risk Status">
                  {latestRiskCheck ? (
                    <RiskLevelBadge riskLevel={latestRiskCheck.riskLevel} />
                  ) : (
                    <PlaceholderBadge>Not Checked</PlaceholderBadge>
                  )}
                </InfoPair>
                <InfoPair label="Checked At">
                  {latestRiskCheck ? (
                    formatDateTime(latestRiskCheck.checkedAt)
                  ) : (
                    <MutedText>Not checked</MutedText>
                  )}
                </InfoPair>
              </dl>
              <dl className="grid gap-2 sm:grid-cols-2">
                <RiskMetric
                  label="Total Orders"
                  value={latestRiskCheck?.totalOrders}
                />
                <RiskMetric
                  label="Delivered"
                  value={latestRiskCheck?.deliveredOrders}
                />
                <RiskMetric
                  label="Cancelled"
                  value={latestRiskCheck?.cancelledOrders}
                />
                <RiskMetric
                  label="Returned"
                  value={latestRiskCheck?.returnedOrders}
                />
                <RiskMetric
                  label="Success Rate"
                  value={
                    latestRiskCheck?.successRate
                      ? `${latestRiskCheck.successRate.toFixed(2)}%`
                      : null
                  }
                />
              </dl>
              <FraudRiskCheckForm orderId={order.id} />
            </div>
          </InfoCard>

          <InfoCard icon={CreditCard} title="Payment Panel">
            <dl className="grid gap-3 text-sm">
              <InfoPair label="Method">{paymentMethod}</InfoPair>
              <InfoPair label="Status">
                <StatusBadge status={order.paymentStatus} />
              </InfoPair>
              <InfoPair label="Transaction ID">
                {latestTransactionId || <MutedText>Not stored yet</MutedText>}
              </InfoPair>
              <InfoPair label="Future Gateway Status">
                <PlaceholderBadge>Not Connected</PlaceholderBadge>
              </InfoPair>
            </dl>
            <div className="mt-4">
              <PaymentSyncForm orderId={order.id} />
            </div>
          </InfoCard>

          <InfoCard icon={Truck} title="Courier / Pathao Panel">
            <dl className="grid gap-3 text-sm">
              <InfoPair label="Delivery Method">{deliveryMethod}</InfoPair>
              <InfoPair label="Delivery Status">
                <StatusBadge status={order.deliveryStatus} />
              </InfoPair>
              <InfoPair label="Courier Provider">
                Pathao <MutedText>placeholder</MutedText>
              </InfoPair>
              <InfoPair label="Tracking Number">
                {latestTrackingNumber || <MutedText>Not stored yet</MutedText>}
              </InfoPair>
            </dl>
            <div className="mt-4">
              <CourierActionGroup orderId={order.id} />
            </div>
          </InfoCard>

          <InfoCard icon={NotebookText} title="Internal Order Notes">
            <OrderAdminNotesForm
              adminNotes={order.adminNotes}
              orderId={order.id}
            />
          </InfoCard>

          <InfoCard icon={Save} title="Status Management">
            <div className="grid gap-3">
              <StatusUpdateForm
                currentStatus={order.orderStatus}
                label="Order"
                options={orderStatusOptions}
                orderId={order.id}
                statusType="ORDER"
              />
              <StatusUpdateForm
                currentStatus={order.paymentStatus}
                label="Payment"
                options={paymentStatusOptions}
                orderId={order.id}
                statusType="PAYMENT"
              />
              <StatusUpdateForm
                currentStatus={order.deliveryStatus}
                label="Delivery"
                options={deliveryStatusOptions}
                orderId={order.id}
                statusType="DELIVERY"
              />
            </div>
          </InfoCard>
        </aside>
      </section>

      <InfoCard icon={Clock} title="Status History">
        {order.statusHistory.length ? (
          <div className="grid gap-3">
            {order.statusHistory.map((entry) => (
              <article
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                key={entry.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-zinc-950">
                      {formatFreeText(entry.statusType)} status
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {entry.fromStatus ? formatStatus(entry.fromStatus) : "None"}{" "}
                      to {formatStatus(entry.toStatus)}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-zinc-500">
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
                  <InfoPair label="Changed By">
                    {entry.changedByAdmin
                      ? entry.changedByAdmin.name || entry.changedByAdmin.email
                      : "System"}
                  </InfoPair>
                  <InfoPair label="Note">
                    {entry.note || <MutedText>No note</MutedText>}
                  </InfoPair>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <EmptyInline message="No status history recorded yet." />
        )}
      </InfoCard>
    </div>
  );
}

async function getOrder(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    select: {
      addressSnapshot: true,
      adminNotes: true,
      coupon: {
        select: {
          code: true,
          type: true,
          value: true,
        },
      },
      couponCodeSnapshot: true,
      couponDiscount: true,
      couponTypeSnapshot: true,
      couponValueSnapshot: true,
      createdAt: true,
      customer: {
        select: {
          email: true,
          fullName: true,
          id: true,
          phone: true,
        },
      },
      customerEmail: true,
      customerFullName: true,
      customerPhone: true,
      deliveryEvents: {
        orderBy: [{ createdAt: "desc" }],
        select: {
          carrier: true,
          createdAt: true,
          eventType: true,
          id: true,
          status: true,
          trackingNumber: true,
        },
      },
      deliveryFee: true,
      deliveryMethod: true,
      deliveryStatus: true,
      grandTotal: true,
      id: true,
      items: {
        orderBy: [{ id: "asc" }],
        select: {
          id: true,
          isPreorder: true,
          lineTotal: true,
          productImageSnapshot: true,
          productSlugSnapshot: true,
          productTitleSnapshot: true,
          quantity: true,
          shipsAtSnapshot: true,
          skuSnapshot: true,
          unitPriceSnapshot: true,
          variantColorSnapshot: true,
          variantSizeSnapshot: true,
        },
      },
      orderNumber: true,
      orderStatus: true,
      paymentEvents: {
        orderBy: [{ createdAt: "desc" }],
        select: {
          amount: true,
          createdAt: true,
          eventType: true,
          id: true,
          provider: true,
          status: true,
          transactionId: true,
        },
      },
      paymentMethod: true,
      paymentStatus: true,
      riskChecks: {
        orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }],
        select: {
          cancelledOrders: true,
          checkedAt: true,
          createdAt: true,
          deliveredOrders: true,
          id: true,
          provider: true,
          returnedOrders: true,
          riskLevel: true,
          riskScore: true,
          successRate: true,
          totalOrders: true,
        },
        take: 1,
      },
      shippingDiscount: true,
      statusHistory: {
        orderBy: [{ createdAt: "desc" }],
        select: {
          changedByAdmin: {
            select: {
              email: true,
              name: true,
            },
          },
          createdAt: true,
          fromStatus: true,
          id: true,
          note: true,
          statusType: true,
          toStatus: true,
        },
      },
      subtotal: true,
      updatedAt: true,
    },
  });
}

async function getPaymentMethodLabels() {
  const methods = await db.paymentMethod.findMany({
    select: {
      code: true,
      label: true,
    },
  });

  return new Map<string, string>(
    methods.map((method) => [method.code, method.label]),
  );
}

async function getDeliveryRuleLabels() {
  const rules = await db.deliveryRule.findMany({
    select: {
      deliveryMethod: true,
      name: true,
    },
  });

  return new Map<string, string>(
    rules.map((rule) => [rule.deliveryMethod, rule.name]),
  );
}

function StatusUpdateForm({
  currentStatus,
  label,
  options,
  orderId,
  statusType,
}: {
  currentStatus: string;
  label: string;
  options: readonly string[];
  orderId: string;
  statusType: "DELIVERY" | "ORDER" | "PAYMENT";
}) {
  return (
    <form
      action={updateOrderLifecycleStatusAction}
      className="grid gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3"
    >
      <input name="orderId" type="hidden" value={orderId} />
      <input name="statusType" type="hidden" value={statusType} />
      <p className="text-xs font-semibold uppercase text-zinc-500">
        {label} Status
      </p>
      <select className={inputClassName} defaultValue={currentStatus} name="toStatus">
        {options.map((status) => (
          <option key={status} value={status}>
            {formatStatus(status)}
          </option>
        ))}
      </select>
      <textarea
        className={cn(inputClassName, "min-h-20 resize-y py-3")}
        maxLength={500}
        name="note"
        placeholder="Internal note"
      />
      <button className={primaryButtonClassName} type="submit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Save {label}
      </button>
    </form>
  );
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

function ProductThumb({ alt, src }: { alt: string; src: string | null }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-400">
      {src ? (
        <Image
          alt={alt}
          className="h-full w-full object-cover"
          height={64}
          src={src}
          unoptimized
          width={64}
        />
      ) : (
        <Package className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function JsonSnapshot({ value }: { value: Prisma.JsonValue }) {
  if (!isRecord(value)) {
    return <p className="text-sm text-zinc-600">{formatJsonValue(value)}</p>;
  }

  const entries = Object.entries(value);

  if (!entries.length) {
    return <EmptyInline message="No address snapshot stored." />;
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
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        getStatusClassName(status),
      )}
    >
      {formatStatus(status)}
    </span>
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
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold",
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={success ? "status" : "alert"}
    >
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      {message}
    </div>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-600">
      {children}
    </span>
  );
}

function PlaceholderBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 w-fit items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-600">
      {children}
    </span>
  );
}

function RiskMetric({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm font-black text-zinc-950">
        {value ?? "Not checked"}
      </dd>
    </div>
  );
}

function RiskLevelBadge({ riskLevel }: { riskLevel: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        getRiskLevelClassName(riskLevel),
      )}
    >
      {formatStatus(riskLevel)}
    </span>
  );
}

function MutedText({ children }: { children: ReactNode }) {
  return <span className="text-zinc-400">{children}</span>;
}

function EmptyInline({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center text-sm font-semibold text-zinc-500">
      {message}
    </div>
  );
}

function getStatusClassName(status: string) {
  if (status === "PAID" || status === "DELIVERED" || status === "CONFIRMED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "PENDING" || status === "PACKING" || status === "PROCESSING") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "FAILED" || status === "CANCELLED" || status === "RETURNED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "REFUNDED") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

function getRiskLevelClassName(riskLevel: string) {
  if (riskLevel === "LOW") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (riskLevel === "MEDIUM" || riskLevel === "UNKNOWN") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function isRecord(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800";
