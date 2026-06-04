-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'VOID');

-- CreateSequence
CREATE SEQUENCE "invoice_number_sequence" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "customer_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "invoice_status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "subtotal_snapshot" DECIMAL(12,2) NOT NULL,
    "delivery_fee_snapshot" DECIMAL(12,2) NOT NULL,
    "coupon_discount_snapshot" DECIMAL(12,2) NOT NULL,
    "shipping_discount_snapshot" DECIMAL(12,2) NOT NULL,
    "grand_total_snapshot" DECIMAL(12,2) NOT NULL,
    "customer_snapshot" JSONB NOT NULL,
    "address_snapshot" JSONB NOT NULL,
    "items_snapshot" JSONB NOT NULL,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_order_id_key" ON "invoices"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

-- CreateIndex
CREATE INDEX "invoices_invoice_status_idx" ON "invoices"("invoice_status");

-- CreateIndex
CREATE INDEX "invoices_generated_at_idx" ON "invoices"("generated_at");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
