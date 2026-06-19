CREATE TABLE "homepage_category_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "root_category_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "homepage_category_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "homepage_category_slot_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slot_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "label_override" TEXT,
    "image_override" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "homepage_category_slot_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "homepage_category_slots_position_key" ON "homepage_category_slots"("position");

CREATE INDEX "homepage_category_slots_root_category_id_idx" ON "homepage_category_slots"("root_category_id");

CREATE INDEX "homepage_category_slots_is_active_idx" ON "homepage_category_slots"("is_active");

CREATE UNIQUE INDEX "homepage_category_slot_items_slot_id_position_key" ON "homepage_category_slot_items"("slot_id", "position");

CREATE INDEX "homepage_category_slot_items_category_id_idx" ON "homepage_category_slot_items"("category_id");

CREATE INDEX "homepage_category_slot_items_position_idx" ON "homepage_category_slot_items"("position");

ALTER TABLE "homepage_category_slots" ADD CONSTRAINT "homepage_category_slots_root_category_id_fkey" FOREIGN KEY ("root_category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "homepage_category_slot_items" ADD CONSTRAINT "homepage_category_slot_items_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "homepage_category_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "homepage_category_slot_items" ADD CONSTRAINT "homepage_category_slot_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
