ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'DELIVERED';

ALTER TYPE "DeliveryStatus" ADD VALUE IF NOT EXISTS 'PACKING';

ALTER TABLE "order_status_history"
ADD COLUMN "status_type" TEXT NOT NULL DEFAULT 'ORDER';

ALTER TABLE "order_status_history"
ALTER COLUMN "from_status" TYPE TEXT USING "from_status"::TEXT;

ALTER TABLE "order_status_history"
ALTER COLUMN "to_status" TYPE TEXT USING "to_status"::TEXT;

CREATE INDEX "order_status_history_status_type_idx"
ON "order_status_history"("status_type");
