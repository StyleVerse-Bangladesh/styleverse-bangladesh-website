-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "stored_filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_provider" TEXT NOT NULL DEFAULT 'local',
    "storage_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_stored_filename_key" ON "media_files"("stored_filename");

-- CreateIndex
CREATE UNIQUE INDEX "media_files_url_key" ON "media_files"("url");

-- CreateIndex
CREATE INDEX "media_files_filename_idx" ON "media_files"("filename");

-- CreateIndex
CREATE INDEX "media_files_uploaded_at_idx" ON "media_files"("uploaded_at");

-- CreateIndex
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");
