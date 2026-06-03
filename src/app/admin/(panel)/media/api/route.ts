import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMediaPreviewUrl } from "@/lib/media-preview";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ files: [] }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
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
    take: 60,
    where: {
      deletedAt: null,
      filename: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,
    },
  });

  const normalizedFiles = await Promise.all(
    files.map(async (file) => {
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
        selectable: Boolean(preview.mediaUrl),
        sizeLabel: formatFileSize(file.sizeBytes),
        sourceLabel: preview.sourceLabel,
        uploadedAt: file.uploadedAt.toISOString(),
        url: preview.mediaUrl ?? file.url,
        warning: preview.warning,
      };
    }),
  );

  return NextResponse.json({
    files: normalizedFiles,
  });
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
