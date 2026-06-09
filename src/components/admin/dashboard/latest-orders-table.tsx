import Link from "next/link";
import { ClipboardList, Eye } from "lucide-react";
import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import type { LatestOrder } from "@/app/admin/(panel)/dashboard-data";
import { cn } from "@/lib/utils";

export function LatestOrdersTable({ orders }: { orders: LatestOrder[] }) {
  return (
    <DashboardCard actionHref="/admin/orders" actionLabel="View All" title="Latest Order">
      {orders.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Order ID</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-zinc-950">
                      {order.customer}
                    </p>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-zinc-600">
                    {order.orderNumber}
                  </td>
                  <td className="px-3 py-3 font-black text-zinc-950">
                    {formatMoney(order.amount)}
                  </td>
                  <td className="px-3 py-3">
                    <DetailsLink href={`/admin/orders/${order.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-zinc-500">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-black text-zinc-950">No orders yet</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Orders will appear here after checkout records are created.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}

function DetailsLink({ href }: { href: string }) {
  return (
    <Link
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
      href={href}
    >
      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      Details
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "mt-1 inline-flex h-6 w-fit items-center rounded-md border px-2 text-[0.68rem] font-black",
        getStatusClassName(status),
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

function getStatusClassName(status: string) {
  if (status === "DELIVERED" || status === "COMPLETED" || status === "CONFIRMED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "PENDING" || status === "PROCESSING" || status === "SHIPPED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "CANCELLED") {
    return "border-red-200 bg-red-50 text-red-700";
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    currency: "BDT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
