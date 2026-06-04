import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type InvoiceNumberSequenceRow = {
  value: string;
};

export async function getOrCreateInvoiceForOrder(orderId: string) {
  const existingInvoice = await db.invoice.findUnique({
    where: { orderId },
  });

  if (existingInvoice) {
    return existingInvoice;
  }

  try {
    return await db.$transaction(async (tx) => {
      const existingInvoiceInTransaction = await tx.invoice.findUnique({
        where: { orderId },
      });

      if (existingInvoiceInTransaction) {
        return existingInvoiceInTransaction;
      }

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          addressSnapshot: true,
          couponCodeSnapshot: true,
          couponDiscount: true,
          couponTypeSnapshot: true,
          couponValueSnapshot: true,
          createdAt: true,
          customerEmail: true,
          customerFullName: true,
          customerId: true,
          customerPhone: true,
          deliveryFee: true,
          grandTotal: true,
          id: true,
          items: {
            orderBy: [{ id: "asc" }],
            select: {
              id: true,
              isPreorder: true,
              lineTotal: true,
              productId: true,
              productImageSnapshot: true,
              productSlugSnapshot: true,
              productTitleSnapshot: true,
              quantity: true,
              shipsAtSnapshot: true,
              skuSnapshot: true,
              unitPriceSnapshot: true,
              variantColorSnapshot: true,
              variantId: true,
              variantSizeSnapshot: true,
            },
          },
          orderNumber: true,
          paymentMethod: true,
          paymentStatus: true,
          shippingDiscount: true,
          subtotal: true,
        },
      });

      if (!order) {
        return null;
      }

      const invoiceNumber = await createInvoiceNumber(tx);

      return tx.invoice.create({
        data: {
          addressSnapshot: toInputJsonValue(order.addressSnapshot),
          couponDiscountSnapshot: order.couponDiscount,
          customerId: order.customerId,
          customerSnapshot: buildCustomerSnapshot(order),
          deliveryFeeSnapshot: order.deliveryFee,
          grandTotalSnapshot: order.grandTotal,
          invoiceNumber,
          itemsSnapshot: buildItemsSnapshot(order.items),
          orderId: order.id,
          shippingDiscountSnapshot: order.shippingDiscount,
          subtotalSnapshot: order.subtotal,
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return db.invoice.findUnique({
        where: { orderId },
      });
    }

    throw error;
  }
}

export async function getInvoiceForCustomerOrder({
  customerId,
  orderId,
}: {
  customerId: string;
  orderId: string;
}) {
  return db.invoice.findFirst({
    where: {
      customerId,
      orderId,
    },
  });
}

export async function getCustomerInvoices(customerId: string) {
  return db.invoice.findMany({
    orderBy: [{ generatedAt: "desc" }],
    where: {
      customerId,
    },
  });
}

export function formatInvoiceNumber(sequenceValue: number, date = new Date()) {
  const year = date.getFullYear();
  const sequence = String(sequenceValue).padStart(6, "0");

  return `SV-${year}-${sequence}`;
}

async function createInvoiceNumber(tx: Prisma.TransactionClient) {
  const rows = await tx.$queryRaw<InvoiceNumberSequenceRow[]>`
    SELECT nextval('invoice_number_sequence')::text AS value
  `;
  const sequenceValue = Number(rows[0]?.value ?? 0);

  if (!Number.isSafeInteger(sequenceValue) || sequenceValue < 1) {
    throw new Error("Invoice number sequence returned an invalid value.");
  }

  return formatInvoiceNumber(sequenceValue);
}

function buildCustomerSnapshot(order: {
  couponCodeSnapshot: string | null;
  couponTypeSnapshot: string | null;
  couponValueSnapshot: Prisma.Decimal | null;
  createdAt: Date;
  customerEmail: string;
  customerFullName: string;
  customerPhone: string;
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: string;
}): Prisma.JsonObject {
  return {
    couponCode: order.couponCodeSnapshot,
    couponType: order.couponTypeSnapshot,
    couponValue: order.couponValueSnapshot?.toString() ?? null,
    email: order.customerEmail,
    fullName: order.customerFullName,
    orderDate: order.createdAt.toISOString(),
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    phone: order.customerPhone,
  };
}

function toInputJsonValue(value: Prisma.JsonValue): Prisma.InputJsonValue {
  if (value === null) {
    return {};
  }

  return value as Prisma.InputJsonValue;
}

function buildItemsSnapshot(
  items: Array<{
    id: string;
    isPreorder: boolean;
    lineTotal: Prisma.Decimal;
    productId: string | null;
    productImageSnapshot: string | null;
    productSlugSnapshot: string | null;
    productTitleSnapshot: string;
    quantity: number;
    shipsAtSnapshot: Date | null;
    skuSnapshot: string | null;
    unitPriceSnapshot: Prisma.Decimal;
    variantColorSnapshot: string | null;
    variantId: string | null;
    variantSizeSnapshot: string | null;
  }>,
): Prisma.JsonArray {
  return items.map((item) => ({
    id: item.id,
    isPreorder: item.isPreorder,
    lineTotal: item.lineTotal.toString(),
    productId: item.productId,
    productImage: item.productImageSnapshot,
    productSlug: item.productSlugSnapshot,
    productTitle: item.productTitleSnapshot,
    quantity: item.quantity,
    shipsAt: item.shipsAtSnapshot?.toISOString() ?? null,
    sku: item.skuSnapshot,
    unitPrice: item.unitPriceSnapshot.toString(),
    variantColor: item.variantColorSnapshot,
    variantId: item.variantId,
    variantSize: item.variantSizeSnapshot,
  }));
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
