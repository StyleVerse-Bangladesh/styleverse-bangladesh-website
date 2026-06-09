import Link from "next/link";
import { Eye, Users } from "lucide-react";
import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import type { LatestCustomer } from "@/app/admin/(panel)/dashboard-data";

export function LatestCustomersTable({
  customers,
}: {
  customers: LatestCustomer[];
}) {
  return (
    <DashboardCard actionHref="/admin/customers" actionLabel="View All" title="Latest Customer">
      {customers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3">Username</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Orders</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-zinc-600">
                    {customer.username}
                  </td>
                  <td className="px-3 py-3 font-semibold text-zinc-950">
                    {customer.name || "Unnamed customer"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex h-7 items-center rounded-md border border-sky-200 bg-sky-50 px-2 text-xs font-black text-sky-700">
                      {customer.orderCount}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <DetailsLink href={`/admin/customers/${customer.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          message="Customers will appear here after account or checkout records are created."
          title="No customers yet"
        />
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

function EmptyState({
  icon: Icon,
  message,
  title,
}: {
  icon: typeof Users;
  message: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-zinc-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-black text-zinc-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{message}</p>
    </div>
  );
}
