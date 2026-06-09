-- Add a dedicated storefront banner flag for category cards.
ALTER TABLE "categories"
ADD COLUMN "feature_in_banner" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "categories_feature_in_banner_idx" ON "categories"("feature_in_banner");
