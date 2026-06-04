import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  CustomerNotesForm,
  CustomerStatusForm,
} from "@/app/admin/(panel)/customers/customer-controls";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Customer Details",
};

type AdminCustomerDetailsPageProps = {
  params?: Promise<{
    id?: string;
  }>;
};

export default async function AdminCustomerDetailsPage({
  params,
}: AdminCustomerDetailsPageProps) {
  const resolvedParams = await params;
  const customerId = resolvedParams?.id;

  if (!customerId) {
    notFound();
  }

  const customer = await getCustomer(customerId);

  if (!customer) {
    notFound();
  }

  const totalOrders = customer.orders.length;
  const totalSpend = customer.orders.reduce(
    (total, order) => total + Number(order.grandTotal),
    0,
  );
  const lastOrder = customer.orders[0] ?? null;

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <Link
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
          href="/admin/customers"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Customers
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">
              Customer Details
            </p>
            <h1 className="break-words text-2xl font-black text-zinc-950 sm:text-3xl">
              {customer.fullName ||
                customer.email ||
                customer.phone ||
                "Unnamed customer"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Created {formatDate(customer.createdAt)}
            </p>
          </div>
          <StatusBadge active={customer.isActive} />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Total Orders" value={String(totalOrders)} />
        <StatTile label="Total Spend" value={formatMoney(totalSpend)} />
        <StatTile
          label="Last Order"
          value={lastOrder ? formatDate(lastOrder.createdAt) : "No orders"}
        />
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          <InfoCard icon={UserRound} title="Customer Profile">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoPair label="Name">
                {customer.fullName || <MutedText>Not stored</MutedText>}
              </InfoPair>
              <InfoPair label="Email">
                {customer.email ? (
                  <ContactLink href={`mailto:${customer.email}`} icon={Mail}>
                    {customer.email}
                  </ContactLink>
                ) : (
                  <MutedText>Not stored</MutedText>
                )}
              </InfoPair>
              <InfoPair label="Phone">
                {customer.phone ? (
                  <ContactLink href={`tel:${customer.phone}`} icon={Phone}>
                    {customer.phone}
                  </ContactLink>
                ) : (
                  <MutedText>Not stored</MutedText>
                )}
              </InfoPair>
              <InfoPair label="Last Login">
                {customer.lastLoginAt ? (
                  formatDateTime(customer.lastLoginAt)
                ) : (
                  <MutedText>Never</MutedText>
                )}
              </InfoPair>
              <InfoPair label="Customer ID">{customer.id}</InfoPair>
              <InfoPair label="Status">
                <StatusBadge active={customer.isActive} />
              </InfoPair>
            </dl>
          </InfoCard>

          <InfoCard icon={MapPin} title="Addresses">
            {customer.addresses.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {customer.addresses.map((address) => (
                  <article
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                    key={address.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-zinc-950">
                          {address.label || "Customer address"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                          {address.address}
                          {address.apartment ? `, ${address.apartment}` : ""}
                        </p>
                        <p className="text-sm text-zinc-600">
                          {address.city}
                          {address.postalCode ? ` ${address.postalCode}` : ""}
                        </p>
                      </div>
                      {address.isDefault ? (
                        <span className="inline-flex h-7 shrink-0 items-center rounded-md border border-sky-200 bg-sky-50 px-2 text-xs font-semibold text-sky-700">
                          Default
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyInline message="No saved addresses for this customer." />
            )}
          </InfoCard>

          <InfoCard icon={ReceiptText} title="Order History">
            {customer.orders.length ? (
              <OrderHistory orders={customer.orders} />
            ) : (
              <EmptyInline message="No orders linked to this customer." />
            )}
          </InfoCard>
        </div>

        <aside className="grid gap-4 xl:content-start">
          <InfoCard icon={UserRound} title="Status">
            <CustomerStatusForm
              customerId={customer.id}
              isActive={customer.isActive}
            />
            {!customer.isActive ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">
                Blocked customers are marked for future checkout enforcement.
              </p>
            ) : null}
          </InfoCard>

          <InfoCard icon={ReceiptText} title="Internal Notes">
            <CustomerNotesForm
              adminNotes={customer.adminNotes}
              customerId={customer.id}
            />
          </InfoCard>
        </aside>
      </section>
    </div>
  );
}

async function getCustomer(customerId: string) {
  return db.customer.findUnique({
    select: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
          address: true,
          apartment: true,
          city: true,
          createdAt: true,
          id: true,
          isDefault: true,
          label: true,
          postalCode: true,
        },
      },
      adminNotes: true,
      createdAt: true,
      email: true,
      fullName: true,
      id: true,
      isActive: true,
      lastLoginAt: true,
      orders: {
        orderBy: [{ createdAt: "desc" }],
        select: {
          _count: {
            select: {
              items: true,
            },
          },
          couponDiscount: true,
          createdAt: true,
          deliveryStatus: true,
          grandTotal: true,
          id: true,
          orderNumber: true,
          orderStatus: true,
          paymentStatus: true,
        },
      },
      phone: true,
      updatedAt: true,
    },
    where: { id: customerId },
  });
}

function OrderHistory({
  orders,
}: {
  orders: NonNullable<Awaited<ReturnType<typeof getCustomer>>>["orders"];
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {orders.map((order) => (
              <tr className="align-top" key={order.id}>
                <td className="px-4 py-4">
                  <p className="font-black text-zinc-950">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    Discount {formatMoney(Number(order.couponDiscount))}
                  </p>
                </td>
                <td className="px-4 py-4 font-black text-zinc-950">
                  {formatMoney(Number(order.grandTotal))}
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge status={order.orderStatus} />
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge status={order.deliveryStatus} />
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-700">
                  {order._count.items}
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <ViewOrderLink orderId={order.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {orders.map((order) => (
          <article
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            key={order.id}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-black text-zinc-950">{order.orderNumber}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <p className="text-lg font-black text-zinc-950">
                {formatMoney(Number(order.grandTotal))}
              </p>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <InfoPair label="Order Status">
                <OrderStatusBadge status={order.orderStatus} />
              </InfoPair>
              <InfoPair label="Payment">
                <OrderStatusBadge status={order.paymentStatus} />
              </InfoPair>
              <InfoPair label="Delivery">
                <OrderStatusBadge status={order.deliveryStatus} />
              </InfoPair>
              <InfoPair label="Items">{order._count.items}</InfoPair>
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

function ViewOrderLink({ orderId }: { orderId: string }) {
  return (
    <Link className={secondaryButtonClassName} href={`/admin/orders/${orderId}`}>
      View order
    </Link>
  );
}

function ContactLink({
  children,
  href,
  icon: Icon,
}: {
  children: ReactNode;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <a
      className="inline-flex items-center gap-2 font-semibold text-zinc-950 hover:text-sky-700"
      href={href}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="break-all">{children}</span>
    </a>
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
    </div>
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

function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        getOrderStatusClassName(status),
      )}
    >
      {formatStatus(status)}
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

function MutedText({ children }: { children: ReactNode }) {
  return <span className="text-zinc-400">{children}</span>;
}

function getOrderStatusClassName(status: string) {
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
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";
