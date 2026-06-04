import Link from "next/link";
import type { ReactNode } from "react";
import {
  Eye,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Customers",
};

type AdminCustomersPageProps = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

type CustomerListItem = {
  createdAt: string;
  email: string | null;
  id: string;
  isActive: boolean;
  lastOrderAt: string | null;
  name: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpend: string;
};

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const params = await searchParams;
  const search = String(params?.search ?? "").trim();
  const customers = await getCustomers(search);
  const customerItems = customers.map<CustomerListItem>((customer) => ({
    createdAt: formatDate(customer.createdAt),
    email: customer.email,
    id: customer.id,
    isActive: customer.isActive,
    lastOrderAt: customer.lastOrderAt ? formatDate(customer.lastOrderAt) : null,
    name: customer.fullName,
    phone: customer.phone,
    totalOrders: customer.totalOrders,
    totalSpend: formatMoney(customer.totalSpend),
  }));
  const hasSearch = Boolean(search);
  const [totalCustomers, activeCustomers] = await Promise.all([
    db.customer.count(),
    db.customer.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Customers</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Customer Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Search customer records, review order history, and manage support
            status without changing historical orders.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Customers" value={String(totalCustomers)} />
          <StatTile label="Active" value={String(activeCustomers)} />
          <StatTile
            label="Blocked"
            value={String(totalCustomers - activeCustomers)}
          />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <FormField label="Search">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                className={cn(inputClassName, "pl-9")}
                defaultValue={search}
                name="search"
                placeholder="Name, email, or phone"
                type="search"
              />
            </div>
          </FormField>
          <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
            <button className={primaryButtonClassName} type="submit">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
            <Link className={secondaryButtonClassName} href="/admin/customers">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Customers</h2>
            <p className="text-sm text-zinc-500">
              {customerItems.length
                ? `${customerItems.length} customers match the current view`
                : "No customers match the current view"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {customerItems.length ? (
          <CustomerList customers={customerItems} />
        ) : (
          <EmptyCustomers hasSearch={hasSearch} totalCustomers={totalCustomers} />
        )}
      </section>
    </div>
  );
}

async function getCustomers(search: string) {
  const customers = await db.customer.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      createdAt: true,
      email: true,
      fullName: true,
      id: true,
      isActive: true,
      phone: true,
    },
    where: buildCustomerWhere(search),
  });
  const customerIds = customers.map((customer) => customer.id);
  const orderStats = customerIds.length
    ? await db.order.groupBy({
        _count: {
          _all: true,
        },
        _max: {
          createdAt: true,
        },
        _sum: {
          grandTotal: true,
        },
        by: ["customerId"],
        where: {
          customerId: {
            in: customerIds,
          },
        },
      })
    : [];
  const statsByCustomerId = new Map(
    orderStats.flatMap((stats) =>
      stats.customerId
        ? [
            [
              stats.customerId,
              {
                lastOrderAt: stats._max.createdAt,
                totalOrders: stats._count._all,
                totalSpend: Number(stats._sum.grandTotal ?? 0),
              },
            ],
          ]
        : [],
    ),
  );

  return customers.map((customer) => {
    const stats = statsByCustomerId.get(customer.id);

    return {
      ...customer,
      lastOrderAt: stats?.lastOrderAt ?? null,
      totalOrders: stats?.totalOrders ?? 0,
      totalSpend: stats?.totalSpend ?? 0,
    };
  });
}

function buildCustomerWhere(search: string): Prisma.CustomerWhereInput {
  if (!search) {
    return {};
  }

  return {
    OR: [
      {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: search,
          mode: "insensitive",
        },
      },
    ],
  };
}

function CustomerList({ customers }: { customers: CustomerListItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Total Spend</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {customers.map((customer) => (
              <tr className="align-top" key={customer.id}>
                <td className="px-4 py-4">
                  <CustomerIdentity customer={customer} />
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {customer.email ?? <MutedText>Not stored</MutedText>}
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {customer.phone ?? <MutedText>Not stored</MutedText>}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge active={customer.isActive} />
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-700">
                  {customer.totalOrders}
                </td>
                <td className="px-4 py-4 font-black text-zinc-950">
                  {customer.totalSpend}
                </td>
                <td className="px-4 py-4 text-zinc-600">{customer.createdAt}</td>
                <td className="px-4 py-4 text-zinc-600">
                  {customer.lastOrderAt ?? <MutedText>No orders</MutedText>}
                </td>
                <td className="px-4 py-4">
                  <ViewCustomerLink customerId={customer.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 xl:hidden">
        {customers.map((customer) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5"
            key={customer.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <CustomerIdentity customer={customer} />
              <StatusBadge active={customer.isActive} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <InfoPair label="Email">
                {customer.email ?? <MutedText>Not stored</MutedText>}
              </InfoPair>
              <InfoPair label="Phone">
                {customer.phone ?? <MutedText>Not stored</MutedText>}
              </InfoPair>
              <InfoPair label="Total Orders">{customer.totalOrders}</InfoPair>
              <InfoPair label="Total Spend">{customer.totalSpend}</InfoPair>
              <InfoPair label="Created">{customer.createdAt}</InfoPair>
              <InfoPair label="Last Order">
                {customer.lastOrderAt ?? <MutedText>No orders</MutedText>}
              </InfoPair>
            </dl>
            <div className="mt-4 border-t border-zinc-200 pt-4">
              <ViewCustomerLink customerId={customer.id} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function CustomerIdentity({ customer }: { customer: CustomerListItem }) {
  return (
    <div className="min-w-0">
      <p className="break-words font-black text-zinc-950">
        {customer.name || customer.email || customer.phone || "Unnamed customer"}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-500">{customer.id}</p>
    </div>
  );
}

function ViewCustomerLink({ customerId }: { customerId: string }) {
  return (
    <Link
      className={secondaryButtonClassName}
      href={`/admin/customers/${customerId}`}
    >
      <Eye className="h-4 w-4" aria-hidden="true" />
      View
    </Link>
  );
}

function EmptyCustomers({
  hasSearch,
  totalCustomers,
}: {
  hasSearch: boolean;
  totalCustomers: number;
}) {
  return (
    <div className="px-4 py-12 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm shadow-black/10">
        <UserRound className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-5 text-lg font-black text-zinc-950">
        {totalCustomers === 0 ? "No customers yet" : "No matching customers"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {totalCustomers === 0
          ? "Customer records will appear here once checkout or account flows create them."
          : "Adjust the search term to find a customer by name, email, or phone."}
      </p>
      {hasSearch ? (
        <Link
          className={cn(secondaryButtonClassName, "mt-5")}
          href="/admin/customers"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset search
        </Link>
      ) : null}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {active ? "Active" : "Blocked"}
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
      <dd className="mt-1 break-words font-semibold text-zinc-800">
        {children}
      </dd>
    </div>
  );
}

function MutedText({ children }: { children: ReactNode }) {
  return <span className="text-zinc-400">{children}</span>;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    currency: "BDT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";
