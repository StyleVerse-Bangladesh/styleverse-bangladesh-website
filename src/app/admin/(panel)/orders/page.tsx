import Link from "next/link";
import type { ReactNode } from "react";
import {
  ClipboardList,
  Eye,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
  type Prisma,
} from "@prisma/client";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Orders",
};

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    deliveryStatus?: string;
    orderStatus?: string;
    paymentStatus?: string;
    search?: string;
  }>;
};

type OrderFilters = {
  deliveryStatus: DeliveryStatus | "";
  orderStatus: OrderStatus | "";
  paymentStatus: PaymentStatus | "";
  search: string;
};

type OrderListItem = {
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryStatus: DeliveryStatus;
  id: string;
  itemCount: number;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  total: string;
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

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const filters = getFilters(params);
  const [orders, summary, paymentMethodLabels, totalOrderCount] =
    await Promise.all([
      getOrders(filters),
      getOrderSummary(),
      getPaymentMethodLabels(),
      db.order.count(),
    ]);
  const orderItems = orders.map<OrderListItem>((order) => ({
    createdAt: formatDateTime(order.createdAt),
    customerName: order.customerFullName,
    customerPhone: order.customerPhone,
    deliveryStatus: order.deliveryStatus,
    id: order.id,
    itemCount: order._count.items,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentMethod:
      paymentMethodLabels.get(order.paymentMethod) ??
      formatFreeText(order.paymentMethod),
    paymentStatus: order.paymentStatus,
    total: formatMoney(Number(order.grandTotal)),
  }));
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.orderStatus ||
      filters.paymentStatus ||
      filters.deliveryStatus,
  );

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">Orders</p>
            <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
              Orders Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Review historical orders, search customers, and move payment,
              delivery, and fulfillment statuses forward without changing order
              items or totals.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Orders" value={String(summary.total)} />
          <StatTile label="Pending" value={String(summary.pending)} />
          <StatTile label="Paid" value={String(summary.paid)} />
          <StatTile label="Delivered" value={String(summary.delivered)} />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_13rem_auto] xl:items-end">
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
                placeholder="Order number, customer, or phone"
                type="search"
              />
            </div>
          </FormField>
          <FormField label="Order Status">
            <StatusSelect
              name="orderStatus"
              options={orderStatusOptions}
              value={filters.orderStatus}
            />
          </FormField>
          <FormField label="Payment Status">
            <StatusSelect
              name="paymentStatus"
              options={paymentStatusOptions}
              value={filters.paymentStatus}
            />
          </FormField>
          <FormField label="Delivery Status">
            <StatusSelect
              name="deliveryStatus"
              options={deliveryStatusOptions}
              value={filters.deliveryStatus}
            />
          </FormField>
          <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
            <button className={primaryButtonClassName} type="submit">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
            <Link className={secondaryButtonClassName} href="/admin/orders">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Order Queue</h2>
            <p className="text-sm text-zinc-500">
              {orderItems.length
                ? `${orderItems.length} orders match the current view`
                : "No orders match the current view"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {orderItems.length ? (
          <OrdersList orders={orderItems} />
        ) : (
          <EmptyOrders
            hasActiveFilters={hasActiveFilters}
            totalOrderCount={totalOrderCount}
          />
        )}
      </section>
    </div>
  );
}

async function getOrders(filters: OrderFilters) {
  return db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      _count: {
        select: {
          items: true,
        },
      },
      createdAt: true,
      customerFullName: true,
      customerPhone: true,
      deliveryStatus: true,
      grandTotal: true,
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentMethod: true,
      paymentStatus: true,
    },
    where: buildOrderWhere(filters),
  });
}

async function getOrderSummary() {
  const [total, pending, paid, delivered] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
    db.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
    db.order.count({ where: { deliveryStatus: DeliveryStatus.DELIVERED } }),
  ]);

  return {
    delivered,
    paid,
    pending,
    total,
  };
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

function buildOrderWhere(filters: OrderFilters): Prisma.OrderWhereInput {
  return {
    OR: filters.search
      ? [
          {
            orderNumber: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            customerFullName: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            customerPhone: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
    deliveryStatus: filters.deliveryStatus || undefined,
    orderStatus: filters.orderStatus || undefined,
    paymentStatus: filters.paymentStatus || undefined,
  };
}

function getFilters(
  params: Awaited<AdminOrdersPageProps["searchParams"]>,
): OrderFilters {
  return {
    deliveryStatus: parseDeliveryStatus(params?.deliveryStatus) ?? "",
    orderStatus: parseOrderStatus(params?.orderStatus) ?? "",
    paymentStatus: parsePaymentStatus(params?.paymentStatus) ?? "",
    search: String(params?.search ?? "").trim(),
  };
}

function parseOrderStatus(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return orderStatusOptions.find((status) => status === value) ?? null;
}

function parsePaymentStatus(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return paymentStatusOptions.find((status) => status === value) ?? null;
}

function parseDeliveryStatus(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return deliveryStatusOptions.find((status) => status === value) ?? null;
}

function OrdersList({ orders }: { orders: OrderListItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto 2xl:block">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {orders.map((order) => (
              <tr className="align-top" key={order.id}>
                <td className="px-4 py-4">
                  <OrderIdentity order={order} />
                </td>
                <td className="px-4 py-4">
                  <CustomerBlock order={order} />
                </td>
                <td className="px-4 py-4 font-black text-zinc-950">
                  {order.total}
                </td>
                <td className="px-4 py-4">
                  <div className="grid gap-2">
                    <span className="font-semibold text-zinc-950">
                      {order.paymentMethod}
                    </span>
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={order.deliveryStatus} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={order.orderStatus} />
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-700">
                  {order.itemCount}
                </td>
                <td className="px-4 py-4 text-zinc-600">{order.createdAt}</td>
                <td className="px-4 py-4">
                  <ViewOrderLink orderId={order.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 2xl:hidden">
        {orders.map((order) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5"
            key={order.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <OrderIdentity order={order} />
              <p className="text-xl font-black text-zinc-950">{order.total}</p>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <InfoPair label="Customer">
                <CustomerBlock order={order} />
              </InfoPair>
              <InfoPair label="Payment">
                <div className="grid gap-2">
                  <span className="font-semibold text-zinc-950">
                    {order.paymentMethod}
                  </span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </InfoPair>
              <InfoPair label="Delivery">
                <StatusBadge status={order.deliveryStatus} />
              </InfoPair>
              <InfoPair label="Order Status">
                <StatusBadge status={order.orderStatus} />
              </InfoPair>
              <InfoPair label="Items">{order.itemCount}</InfoPair>
              <InfoPair label="Created">{order.createdAt}</InfoPair>
            </dl>
            <div className="mt-4 border-t border-zinc-200 pt-4">
              <ViewOrderLink orderId={order.id} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function OrderIdentity({ order }: { order: OrderListItem }) {
  return (
    <div className="min-w-0">
      <p className="break-words font-black text-zinc-950">
        {order.orderNumber}
      </p>
      <p className="mt-1 text-xs font-semibold text-zinc-500">
        Created {order.createdAt}
      </p>
    </div>
  );
}

function CustomerBlock({ order }: { order: OrderListItem }) {
  return (
    <div className="min-w-0">
      <p className="break-words font-semibold text-zinc-950">
        {order.customerName}
      </p>
      <p className="mt-1 break-words font-mono text-xs text-zinc-500">
        {order.customerPhone}
      </p>
    </div>
  );
}

function ViewOrderLink({ orderId }: { orderId: string }) {
  return (
    <Link className={secondaryButtonClassName} href={`/admin/orders/${orderId}`}>
      <Eye className="h-4 w-4" aria-hidden="true" />
      View
    </Link>
  );
}

function EmptyOrders({
  hasActiveFilters,
  totalOrderCount,
}: {
  hasActiveFilters: boolean;
  totalOrderCount: number;
}) {
  const noOrdersExist = totalOrderCount === 0;

  return (
    <div className="px-4 py-12 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm shadow-black/10">
        <ShoppingBag className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-5 text-lg font-black text-zinc-950">
        {noOrdersExist ? "No orders yet" : "No matching orders"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {noOrdersExist
          ? "Orders will appear here after checkout integration creates historical order records."
          : "Adjust the search or status filters to widen the operational view."}
      </p>
      {hasActiveFilters ? (
        <Link
          className={cn(secondaryButtonClassName, "mt-5")}
          href="/admin/orders"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset filters
        </Link>
      ) : null}
    </div>
  );
}

function StatusSelect({
  name,
  options,
  value,
}: {
  name: string;
  options: readonly string[];
  value: string;
}) {
  return (
    <select className={inputClassName} defaultValue={value} name={name}>
      <option value="">All statuses</option>
      {options.map((status) => (
        <option key={status} value={status}>
          {formatStatus(status)}
        </option>
      ))}
    </select>
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

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";
