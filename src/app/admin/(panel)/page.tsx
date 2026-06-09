import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  ClipboardList,
  CreditCard,
  MailWarning,
  PackageX,
  PhoneOff,
  ShoppingBag,
  Ticket,
  UserCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import { LatestCustomersTable } from "@/components/admin/dashboard/latest-customers-table";
import { LatestOrdersTable } from "@/components/admin/dashboard/latest-orders-table";
import { SalesReportCard } from "@/components/admin/dashboard/sales-report-card";
import { StatRow } from "@/components/admin/dashboard/stat-row";
import { StatTile } from "@/components/admin/dashboard/stat-tile";
import { TopSellingProductsCard } from "@/components/admin/dashboard/top-selling-products-card";
import {
  getDashboardDateRange,
  getDashboardStats,
  getLatestCustomers,
  getLatestOrders,
  getSalesReport,
  getTopSellingProducts,
} from "@/app/admin/(panel)/dashboard-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
};

type AdminDashboardPageProps = {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const params = await searchParams;
  const range = getDashboardDateRange(params);
  const [stats, salesReport, topProducts, latestCustomers, latestOrders] =
    await Promise.all([
      getDashboardStats(),
      getSalesReport(range),
      getTopSellingProducts(),
      getLatestCustomers(),
      getLatestOrders(),
    ]);

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Dashboard</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Business Overview
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Monitor orders, customers, stock pressure, and recent sales activity
            from the StyleVerse operations desk.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 sm:w-fit"
          href="/admin/orders"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          View Orders
        </Link>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(24rem,1.1fr)] xl:grid-cols-[minmax(19rem,0.92fr)_minmax(25rem,1.35fr)_minmax(18rem,0.9fr)]">
        <DashboardCard title="Attention Required">
          <div className="grid gap-3">
            <StatRow
              count={stats.attention.pendingPayment}
              href="/admin/orders?paymentStatus=PENDING"
              icon={CreditCard}
              label="Pending Payment"
              tone="amber"
            />
            <StatRow
              count={stats.attention.pendingTickets}
              disabled
              icon={Ticket}
              label="Pending Tickets"
              tone="violet"
            />
            <StatRow
              count={stats.attention.lowStockProduct}
              href="/admin/inventory?lowStock=1"
              icon={AlertTriangle}
              label="Low Stock Product"
              tone="red"
            />
            <StatRow
              count={stats.attention.outOfStockProduct}
              href="/admin/inventory?status=OUT_OF_STOCK"
              icon={PackageX}
              label="Out Of Stock Product"
              tone="zinc"
            />
          </div>
        </DashboardCard>

        <DashboardCard title="Customers">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile
              count={stats.customers.totalRegistered}
              href="/admin/customers"
              icon={Users}
              label="Total Registered"
              tone="blue"
            />
            <StatTile
              count={stats.customers.profileCompleted}
              href="/admin/customers"
              icon={UserRoundCheck}
              label="Profile Completed"
              tone="emerald"
            />
            <StatTile
              count={stats.customers.active}
              href="/admin/customers"
              icon={UserCheck}
              label="Active"
              tone="sky"
            />
            <StatTile
              count={stats.customers.banned}
              href="/admin/customers"
              icon={Ban}
              label="Banned"
              tone="red"
            />
            <StatTile
              count={stats.customers.emailUnverified}
              icon={MailWarning}
              label="Email Unverified"
              tone="amber"
            />
            <StatTile
              count={stats.customers.mobileUnverified}
              icon={PhoneOff}
              label="Mobile Unverified"
              tone="violet"
            />
          </div>
        </DashboardCard>

        <DashboardCard className="lg:col-span-2 xl:col-span-1" title="Orders">
          <div className="grid gap-2">
            <OrderCountRow
              count={stats.orders.totalOrders}
              href="/admin/orders"
              label="Total orders"
              tone="zinc"
            />
            <OrderCountRow
              count={stats.orders.pendingOrders}
              href="/admin/orders?orderStatus=PENDING"
              label="Pending orders"
              tone="amber"
            />
            <OrderCountRow
              count={stats.orders.processingOrders}
              href="/admin/orders?orderStatus=PROCESSING"
              label="Processing orders"
              tone="sky"
            />
            <OrderCountRow
              count={stats.orders.dispatchedOrders}
              href="/admin/orders?orderStatus=SHIPPED"
              label="Dispatched orders"
              tone="blue"
            />
            <OrderCountRow
              count={stats.orders.deliveredOrders}
              href="/admin/orders?orderStatus=DELIVERED"
              label="Delivered orders"
              tone="emerald"
            />
            <OrderCountRow
              count={stats.orders.canceledOrders}
              href="/admin/orders?orderStatus=CANCELLED"
              label="Canceled orders"
              tone="red"
            />
          </div>
        </DashboardCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(24rem,0.85fr)]">
        <SalesReportCard points={salesReport} range={range} />
        <TopSellingProductsCard products={topProducts} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LatestCustomersTable customers={latestCustomers} />
        <LatestOrdersTable orders={latestOrders} />
      </section>
    </div>
  );
}

function OrderCountRow({
  count,
  href,
  label,
  tone,
}: {
  count: number;
  href: string;
  label: string;
  tone: "amber" | "blue" | "emerald" | "red" | "sky" | "zinc";
}) {
  return (
    <Link
      className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
      href={href}
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <ShoppingBag className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "inline-flex h-7 min-w-9 shrink-0 items-center justify-center rounded-md border px-2 text-xs font-black",
          orderToneClasses[tone],
        )}
      >
        {count}
      </span>
    </Link>
  );
}

const orderToneClasses = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  zinc: "border-zinc-200 bg-zinc-100 text-zinc-700",
} satisfies Record<string, string>;
