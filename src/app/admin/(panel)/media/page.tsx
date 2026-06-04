import { type Prisma } from "@prisma/client";
import {
  MediaAdminPage,
  type MediaAdminFilters,
  type MediaAdminItem,
} from "@/app/admin/(panel)/media/media-admin";
import { db } from "@/lib/db";
import { getMediaPreviewUrl } from "@/lib/media-preview";

export const metadata = {
  title: "Admin Media",
};

type AdminMediaPageProps = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function AdminMediaPage({
  searchParams,
}: AdminMediaPageProps) {
  const params = await searchParams;
  const filters = getFilters(params);
  const [files, summary] = await Promise.all([
    getMediaFiles(filters),
    getMediaSummary(),
  ]);

  return <MediaAdminPage files={files} filters={filters} summary={summary} />;
}

async function getMediaFiles(filters: MediaAdminFilters) {
  const where = buildMediaWhere(filters);
  const files = await db.mediaFile.findMany({
    orderBy: [{ uploadedAt: "desc" }],
    select: {
      filename: true,
      id: true,
      mimeType: true,
      publicId: true,
      secureUrl: true,
      sizeBytes: true,
      storageProvider: true,
      uploadedAt: true,
      url: true,
    },
    where,
  });
  const usageCounts = files.length
    ? await db.productImage.groupBy({
        by: ["url"],
        where: {
          url: { in: files.map((file) => file.url) },
        },
        _count: {
          _all: true,
        },
      })
    : [];
  const usageCountByUrl = new Map(
    usageCounts.map((item) => [item.url, item._count._all]),
  );

  return Promise.all(
    files.map<Promise<MediaAdminItem>>(async (file) => {
      const preview = await getMediaPreviewUrl(file);

      return {
        filename: file.filename,
        id: file.id,
        isCloudinary: preview.isCloudinary,
        isLegacyLocal: preview.isLegacyLocal,
        isLegacyLocalMissing: preview.isLegacyLocalMissing,
        mediaUrl: preview.mediaUrl,
        mimeType: file.mimeType,
        previewUrl: preview.previewUrl,
        productUsageCount: usageCountByUrl.get(file.url) ?? 0,
        sizeLabel: formatFileSize(file.sizeBytes),
        sourceLabel: preview.sourceLabel,
        uploadedAt: formatDate(file.uploadedAt),
        url: file.url,
        warning: preview.warning,
      };
    }),
  );
}

async function getMediaSummary() {
  const [total, storage] = await Promise.all([
    db.mediaFile.count({ where: { deletedAt: null } }),
    db.mediaFile.aggregate({
      where: { deletedAt: null },
      _sum: { sizeBytes: true },
    }),
  ]);

  return {
    storageLabel: formatFileSize(storage._sum.sizeBytes ?? 0),
    total,
  };
}

function buildMediaWhere(filters: MediaAdminFilters): Prisma.MediaFileWhereInput {
  return {
    deletedAt: null,
    filename: filters.search
      ? {
          contains: filters.search,
          mode: "insensitive",
        }
      : undefined,
  };
}

function getFilters(
  params: Awaited<AdminMediaPageProps["searchParams"]>,
): MediaAdminFilters {
  return {
    search: String(params?.search ?? "").trim(),
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}
