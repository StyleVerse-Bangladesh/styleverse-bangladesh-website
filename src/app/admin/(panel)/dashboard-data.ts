import { OrderStatus, PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";

export type DashboardDateRange = {
  from: string;
  to: string;
};

export type SalesReportPoint = {
  amount: number;
  date: string;
  label: string;
};

export type TopSellingProduct = {
  compareAtPrice: number | null;
  currency: string;
  description: string | null;
  id: string;
  imageAlt: string;
  imageUrl: string | null;
  name: string;
  price: number;
  salesCount: number;
};

export type LatestCustomer = {
  id: string;
  name: string | null;
  orderCount: number;
  username: string;
};

export type LatestOrder = {
  amount: number;
  customer: string;
  id: string;
  orderNumber: string;
  status: OrderStatus;
};

const defaultReportDays = 15;
const maxReportDays = 90;
const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/;

export function getDashboardDateRange(params?: {
  from?: string;
  to?: string;
}): DashboardDateRange {
  const today = startOfUtcDay(new Date());
  const submittedTo = parseDateInput(params?.to);
  const submittedFrom = parseDateInput(params?.from);
  const toDate = submittedTo ? minDate(submittedTo, today) : today;
  let fromDate = submittedFrom ?? addDays(toDate, -(defaultReportDays - 1));

  if (fromDate.getTime() > toDate.getTime()) {
    fromDate = addDays(toDate, -(defaultReportDays - 1));
  }

  if (countDaysInclusive(fromDate, toDate) > maxReportDays) {
    fromDate = addDays(toDate, -(maxReportDays - 1));
  }

  return {
    from: formatDateInput(fromDate),
    to: formatDateInput(toDate),
  };
}

export async function getDashboardStats() {
  const [
    pendingPayment,
    lowStockProduct,
    outOfStockProduct,
    totalRegistered,
    profileCompleted,
    active,
    banned,
    totalOrders,
    pendingOrders,
    processingOrders,
    dispatchedOrders,
    deliveredOrders,
    canceledOrders,
  ] = await Promise.all([
    db.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
    db.productVariant.count({
      where: {
        isActive: true,
        lowStockThreshold: { not: null },
        stock: { gt: 0 },
        AND: [{ stock: { lte: db.productVariant.fields.lowStockThreshold } }],
      },
    }),
    db.productVariant.count({
      where: {
        isActive: true,
        stock: { lte: 0 },
      },
    }),
    db.customer.count(),
    db.customer.count({
      // Current profile completion business definition: name, email, and phone.
      where: {
        email: { not: null },
        fullName: { not: null },
        phone: { not: null },
      },
    }),
    db.customer.count({ where: { isActive: true } }),
    db.customer.count({ where: { isActive: false } }),
    db.order.count(),
    db.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
    db.order.count({ where: { orderStatus: OrderStatus.PROCESSING } }),
    db.order.count({ where: { orderStatus: OrderStatus.SHIPPED } }),
    db.order.count({
      where: {
        orderStatus: {
          in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
        },
      },
    }),
    db.order.count({ where: { orderStatus: OrderStatus.CANCELLED } }),
  ]);

  return {
    attention: {
      lowStockProduct,
      outOfStockProduct,
      pendingPayment,
      pendingTickets: 0,
    },
    customers: {
      active,
      banned,
      emailUnverified: 0,
      mobileUnverified: 0,
      profileCompleted,
      totalRegistered,
    },
    orders: {
      canceledOrders,
      deliveredOrders,
      dispatchedOrders,
      pendingOrders,
      processingOrders,
      totalOrders,
    },
  };
}

export async function getSalesReport(
  range: DashboardDateRange,
): Promise<SalesReportPoint[]> {
  const normalizedRange = getDashboardDateRange(range);
  const fromDate = parseDateInputStrict(normalizedRange.from);
  const toDate = endOfUtcDay(parseDateInputStrict(normalizedRange.to));
  const orders = await db.order.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: {
      createdAt: true,
      grandTotal: true,
    },
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      // Until a stricter revenue policy exists, sales reporting excludes canceled orders.
      orderStatus: {
        not: OrderStatus.CANCELLED,
      },
    },
  });
  const totalsByDate = new Map<string, number>();

  for (const order of orders) {
    const key = formatDateInput(order.createdAt);

    totalsByDate.set(key, (totalsByDate.get(key) ?? 0) + Number(order.grandTotal));
  }

  return eachDateInRange(fromDate, toDate).map((date) => {
    const key = formatDateInput(date);

    return {
      amount: totalsByDate.get(key) ?? 0,
      date: key,
      label: formatChartLabel(date),
    };
  });
}

export async function getTopSellingProducts(): Promise<TopSellingProduct[]> {
  const salesGroups = await db.orderItem.groupBy({
    _sum: {
      quantity: true,
    },
    by: ["productId"],
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
    where: {
      productId: {
        not: null,
      },
    },
  });
  const productIds = salesGroups
    .map((group) => group.productId)
    .filter((id): id is string => Boolean(id));

  if (!productIds.length) {
    return [];
  }

  const products = await db.product.findMany({
    select: {
      compareAtPrice: true,
      currency: true,
      description: true,
      id: true,
      images: {
        orderBy: [{ sortOrder: "asc" }],
        select: {
          alt: true,
          isPrimary: true,
          url: true,
        },
      },
      name: true,
      price: true,
    },
    where: {
      id: {
        in: productIds,
      },
    },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return salesGroups.flatMap((group) => {
    if (!group.productId) {
      return [];
    }

    const product = productById.get(group.productId);

    if (!product) {
      return [];
    }

    const primaryImage =
      product.images.find((image) => image.isPrimary) ?? product.images[0];

    return [
      {
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        currency: product.currency,
        description: product.description,
        id: product.id,
        imageAlt: primaryImage?.alt ?? product.name,
        imageUrl: primaryImage?.url ?? null,
        name: product.name,
        price: Number(product.price),
        salesCount: group._sum.quantity ?? 0,
      },
    ];
  });
}

export async function getLatestCustomers(): Promise<LatestCustomer[]> {
  const customers = await db.customer.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      _count: {
        select: {
          orders: true,
        },
      },
      email: true,
      fullName: true,
      id: true,
      phone: true,
    },
    take: 5,
  });

  return customers.map((customer) => ({
    id: customer.id,
    name: customer.fullName,
    orderCount: customer._count.orders,
    username: getCustomerUsername(customer),
  }));
}

export async function getLatestOrders(): Promise<LatestOrder[]> {
  const orders = await db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      customerFullName: true,
      grandTotal: true,
      id: true,
      orderNumber: true,
      orderStatus: true,
    },
    take: 5,
  });

  return orders.map((order) => ({
    amount: Number(order.grandTotal),
    customer: order.customerFullName,
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.orderStatus,
  }));
}

function getCustomerUsername(customer: {
  email: string | null;
  id: string;
  phone: string | null;
}) {
  if (customer.email) {
    return customer.email.split("@")[0] || customer.email;
  }

  return customer.phone || customer.id;
}

function parseDateInput(value: string | undefined) {
  if (!value || !dateInputPattern.test(value)) {
    return null;
  }

  const parsed = parseDateInputStrict(value);
  const [year, month, day] = value.split("-").map(Number);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function parseDateInputStrict(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function minDate(left: Date, right: Date) {
  return left.getTime() < right.getTime() ? left : right;
}

function countDaysInclusive(from: Date, to: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return (
    Math.floor((startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) / millisecondsPerDay) +
    1
  );
}

function startOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function endOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function addDays(value: Date, days: number) {
  const next = new Date(value);

  next.setUTCDate(next.getUTCDate() + days);

  return next;
}

function eachDateInRange(from: Date, to: Date) {
  const dates: Date[] = [];
  let cursor = startOfUtcDay(from);
  const end = startOfUtcDay(to);

  while (cursor.getTime() <= end.getTime()) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatChartLabel(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(value);
}
