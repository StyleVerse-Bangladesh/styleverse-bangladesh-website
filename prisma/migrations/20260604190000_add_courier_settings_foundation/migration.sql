-- CreateTable
CREATE TABLE "courier_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_test_mode" BOOLEAN NOT NULL DEFAULT true,
    "client_id_placeholder" TEXT,
    "client_secret_placeholder" TEXT,
    "username_placeholder" TEXT,
    "password_placeholder" TEXT,
    "store_id_placeholder" TEXT,
    "access_token_placeholder" TEXT,
    "refresh_token_placeholder" TEXT,
    "token_expires_at" TIMESTAMPTZ(6),
    "public_config" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courier_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_shipments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "courier_account_id" UUID,
    "provider" TEXT NOT NULL,
    "consignment_id" TEXT,
    "tracking_number" TEXT,
    "merchant_order_id" TEXT,
    "recipient_name_snapshot" TEXT,
    "recipient_phone_snapshot" TEXT,
    "recipient_address_snapshot" TEXT,
    "city_snapshot" TEXT,
    "zone_snapshot" TEXT,
    "area_snapshot" TEXT,
    "delivery_fee_snapshot" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider_status" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courier_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipment_id" UUID NOT NULL,
    "courier_account_id" UUID,
    "event_type" TEXT NOT NULL,
    "status" TEXT,
    "provider_status" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_area_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "area_name" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courier_area_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courier_accounts_provider_idx" ON "courier_accounts"("provider");

-- CreateIndex
CREATE INDEX "courier_accounts_is_active_idx" ON "courier_accounts"("is_active");

-- CreateIndex
CREATE INDEX "courier_accounts_sort_order_idx" ON "courier_accounts"("sort_order");

-- CreateIndex
CREATE INDEX "courier_shipments_order_id_idx" ON "courier_shipments"("order_id");

-- CreateIndex
CREATE INDEX "courier_shipments_courier_account_id_idx" ON "courier_shipments"("courier_account_id");

-- CreateIndex
CREATE INDEX "courier_shipments_provider_idx" ON "courier_shipments"("provider");

-- CreateIndex
CREATE INDEX "courier_shipments_consignment_id_idx" ON "courier_shipments"("consignment_id");

-- CreateIndex
CREATE INDEX "courier_shipments_tracking_number_idx" ON "courier_shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "courier_shipments_status_idx" ON "courier_shipments"("status");

-- CreateIndex
CREATE INDEX "courier_shipments_created_at_idx" ON "courier_shipments"("created_at");

-- CreateIndex
CREATE INDEX "courier_events_shipment_id_idx" ON "courier_events"("shipment_id");

-- CreateIndex
CREATE INDEX "courier_events_courier_account_id_idx" ON "courier_events"("courier_account_id");

-- CreateIndex
CREATE INDEX "courier_events_event_type_idx" ON "courier_events"("event_type");

-- CreateIndex
CREATE INDEX "courier_events_status_idx" ON "courier_events"("status");

-- CreateIndex
CREATE INDEX "courier_events_created_at_idx" ON "courier_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "courier_area_mappings_provider_city_id_zone_id_area_id_key" ON "courier_area_mappings"("provider", "city_id", "zone_id", "area_id");

-- CreateIndex
CREATE INDEX "courier_area_mappings_provider_idx" ON "courier_area_mappings"("provider");

-- CreateIndex
CREATE INDEX "courier_area_mappings_city_name_idx" ON "courier_area_mappings"("city_name");

-- CreateIndex
CREATE INDEX "courier_area_mappings_zone_name_idx" ON "courier_area_mappings"("zone_name");

-- CreateIndex
CREATE INDEX "courier_area_mappings_area_name_idx" ON "courier_area_mappings"("area_name");

-- CreateIndex
CREATE INDEX "courier_area_mappings_is_active_idx" ON "courier_area_mappings"("is_active");

-- AddForeignKey
ALTER TABLE "courier_shipments" ADD CONSTRAINT "courier_shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_shipments" ADD CONSTRAINT "courier_shipments_courier_account_id_fkey" FOREIGN KEY ("courier_account_id") REFERENCES "courier_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_events" ADD CONSTRAINT "courier_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "courier_shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_events" ADD CONSTRAINT "courier_events_courier_account_id_fkey" FOREIGN KEY ("courier_account_id") REFERENCES "courier_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
