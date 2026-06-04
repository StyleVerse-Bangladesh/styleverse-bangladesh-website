-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN');

-- CreateTable
CREATE TABLE "customer_risk_checks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone" TEXT NOT NULL,
    "customer_id" UUID,
    "order_id" UUID,
    "provider" TEXT NOT NULL,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "delivered_orders" INTEGER NOT NULL DEFAULT 0,
    "cancelled_orders" INTEGER NOT NULL DEFAULT 0,
    "returned_orders" INTEGER NOT NULL DEFAULT 0,
    "success_rate" DECIMAL(5,2),
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'UNKNOWN',
    "risk_score" INTEGER,
    "provider_payload" JSONB,
    "checked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_risk_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_risk_checks_phone_idx" ON "customer_risk_checks"("phone");

-- CreateIndex
CREATE INDEX "customer_risk_checks_customer_id_idx" ON "customer_risk_checks"("customer_id");

-- CreateIndex
CREATE INDEX "customer_risk_checks_order_id_idx" ON "customer_risk_checks"("order_id");

-- CreateIndex
CREATE INDEX "customer_risk_checks_provider_idx" ON "customer_risk_checks"("provider");

-- CreateIndex
CREATE INDEX "customer_risk_checks_risk_level_idx" ON "customer_risk_checks"("risk_level");

-- CreateIndex
CREATE INDEX "customer_risk_checks_checked_at_idx" ON "customer_risk_checks"("checked_at");

-- AddForeignKey
ALTER TABLE "customer_risk_checks" ADD CONSTRAINT "customer_risk_checks_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_risk_checks" ADD CONSTRAINT "customer_risk_checks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
