ALTER TABLE "media_files"
ADD COLUMN "public_id" TEXT,
ADD COLUMN "secure_url" TEXT,
ADD COLUMN "format" TEXT,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "bytes" INTEGER,
ADD COLUMN "original_filename" TEXT,
ADD COLUMN "original_format" TEXT,
ADD COLUMN "original_width" INTEGER,
ADD COLUMN "original_height" INTEGER,
ADD COLUMN "original_bytes" INTEGER,
ADD COLUMN "folder" TEXT,
ADD COLUMN "alt_text" TEXT;

CREATE UNIQUE INDEX "media_files_public_id_key" ON "media_files"("public_id");
CREATE INDEX "media_files_folder_idx" ON "media_files"("folder");
CREATE INDEX "media_files_public_id_idx" ON "media_files"("public_id");
