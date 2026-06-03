import { access } from "node:fs/promises";
import path from "node:path";
import { buildHighQualityDeliveryUrl } from "@/lib/cloudinary";

export type MediaPreviewInput = {
  publicId: string | null;
  secureUrl: string | null;
  storageProvider: string;
  url: string;
};

export type MediaPreviewInfo = {
  isCloudinary: boolean;
  isLegacyLocal: boolean;
  isLegacyLocalMissing: boolean;
  mediaUrl: string | null;
  previewUrl: string | null;
  sourceLabel: string;
  warning: string | null;
};

export async function getMediaPreviewUrl(
  file: MediaPreviewInput,
): Promise<MediaPreviewInfo> {
  if (isCloudinaryMedia(file)) {
    const previewUrl = getCloudinaryPreviewUrl(file);

    return {
      isCloudinary: true,
      isLegacyLocal: false,
      isLegacyLocalMissing: false,
      mediaUrl: previewUrl,
      previewUrl,
      sourceLabel: "Cloudinary",
      warning: previewUrl ? null : "Cloudinary URL is missing.",
    };
  }

  if (isLocalUploadUrl(file.url)) {
    const localExists = await localPublicFileExists(file.url);

    return {
      isCloudinary: false,
      isLegacyLocal: true,
      isLegacyLocalMissing: !localExists,
      mediaUrl: localExists ? file.url : null,
      previewUrl: localExists ? file.url : null,
      sourceLabel: "Legacy local file",
      warning: localExists ? "Re-upload to Cloudinary" : "Re-upload to Cloudinary",
    };
  }

  return {
    isCloudinary: false,
    isLegacyLocal: false,
    isLegacyLocalMissing: false,
    mediaUrl: file.url || file.secureUrl,
    previewUrl: file.url || file.secureUrl,
    sourceLabel: "External URL",
    warning: null,
  };
}

function getCloudinaryPreviewUrl(file: MediaPreviewInput) {
  if (isCloudinaryUrl(file.url)) {
    return file.url;
  }

  if (file.publicId) {
    try {
      return buildHighQualityDeliveryUrl(file.publicId);
    } catch {
      // Fall back to the persisted secure URL when env is not available.
    }
  }

  return file.secureUrl || null;
}

function isCloudinaryMedia(file: MediaPreviewInput) {
  return (
    file.storageProvider === "cloudinary" ||
    Boolean(file.publicId) ||
    isCloudinaryUrl(file.url) ||
    isCloudinaryUrl(file.secureUrl)
  );
}

function isCloudinaryUrl(value: string | null) {
  return Boolean(value && /^https:\/\/res\.cloudinary\.com\//i.test(value));
}

function isLocalUploadUrl(value: string) {
  return /^\/uploads\/media\//i.test(value);
}

async function localPublicFileExists(url: string) {
  const pathname = url.split("?")[0].split("#")[0];
  const relativePath = pathname.replace(/^\/+/, "");
  const absolutePath = path.resolve(process.cwd(), "public", relativePath);
  const publicDirectory = path.resolve(process.cwd(), "public");

  if (
    absolutePath !== publicDirectory &&
    !absolutePath.startsWith(`${publicDirectory}${path.sep}`)
  ) {
    return false;
  }

  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}
