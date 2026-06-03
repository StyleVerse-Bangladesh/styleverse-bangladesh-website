import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  LayoutPanelTop,
  Package,
  Settings,
  TicketPercent,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
};

const overviewCards = [
  {
    href: "/admin/products",
    icon: Package,
    label: "Products",
    value: "Catalog shell",
  },
  {
    href: "/admin/inventory",
    icon: Boxes,
    label: "Inventory",
    value: "Stock shell",
  },
  {
    href: "/admin/orders",
    icon: ClipboardList,
    label: "Orders",
    value: "Order shell",
  },
  {
    href: "/admin/coupons",
    icon: TicketPercent,
    label: "Coupons",
    value: "Promo shell",
  },
];

const upcomingModules = [
  { href: "/admin/homepage", icon: LayoutPanelTop, label: "Homepage CMS" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/settings", icon: Settings, label: "Store Settings" },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-semibold text-sky-700">Dashboard</p>
        <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
          Overview
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600">
          A protected command surface for StyleVerse operations. Live metrics,
          approvals, and management workflows will be added in later phases.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              href={card.href}
              key={card.href}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-xl font-black text-zinc-950">
                    {card.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-black/5 sm:p-6">
          <h2 className="text-lg font-black text-zinc-950">
            Dashboard overview placeholder
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            This area is reserved for sales snapshots, low-stock alerts, order
            queues, and content tasks once the admin data workflows are built.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Revenue", "Pending orders", "Low stock"].map((label) => (
              <div
                className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
                key={label}
              >
                <p className="text-sm font-semibold text-zinc-500">{label}</p>
                <p className="mt-2 text-lg font-black text-zinc-950">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-black/5 sm:p-6">
          <h2 className="text-lg font-black text-zinc-950">Next modules</h2>
          <div className="mt-4 grid gap-2">
            {upcomingModules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
                  href={module.href}
                  key={module.href}
                >
                  <Icon className="h-4 w-4 text-sky-700" aria-hidden="true" />
                  <span className="min-w-0 truncate">{module.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
