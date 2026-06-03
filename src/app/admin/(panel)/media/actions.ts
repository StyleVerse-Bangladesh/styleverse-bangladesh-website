"use server";

import { revalidatePath } from "next/cache";
import {
  destroyCloudinaryImage,
  getCloudinaryConfig,
  uploadProductImageToCloudinary,
} from "@/lib/cloudinary";
import { db } from "@/lib/db";

export type MediaActionState = {
  error?: string;
  message?: string;
  ok?: boolean;
};

const maxUploadBytes = 10 * 1024 * 1024;

const allowedMediaTypes = [
  { extensions: ["jpg", "jpeg"], extension: "jpg", mimeType: "image/jpeg" },
  { extensions: ["png"], extension: "png", mimeType: "image/png" },
  { extensions: ["webp"], extension: "webp", mimeType: "image/webp" },
] as const;

type AllowedMediaType = (typeof allowedMediaTypes)[number];

export async function uploadMediaAction(
  _state: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  try {
    const file = formData.get("file");

    if (!isUploadFile(file)) {
      return errorState("Choose an image to upload.");
    }

    if (!file.size) {
      return errorState("The selected file is empty.");
    }

    if (file.size > maxUploadBytes) {
      return errorState("Images must be 10 MB or smaller.");
    }

    const originalFilename = getOriginalFilename(file.name);
    const mediaType = resolveAllowedMediaType(originalFilename, file.type);

    if (!mediaType) {
      return errorState("Upload JPG, PNG, or WEBP images only.");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const signatureError = validateFileSignature(bytes, mediaType);

    if (signatureError) {
      return errorState(signatureError);
    }

    if (!getCloudinaryConfig()) {
      return errorState("Cloudinary is not configured. Check the media upload environment variables.");
    }

    const upload = await uploadProductImageToCloudinary({ buffer: bytes });

    try {
      await db.mediaFile.create({
        data: {
          bytes: upload.bytes,
          folder: upload.folder,
          format: upload.format,
          filename: originalFilename,
          height: upload.height,
          mimeType: "image/webp",
          originalBytes: bytes.length,
          originalFilename,
          originalFormat: mediaType.extension,
          originalHeight: upload.height,
          originalWidth: upload.width,
          publicId: upload.publicId,
          secureUrl: upload.secureUrl,
          sizeBytes: upload.bytes,
          storagePath: upload.publicId,
          storageProvider: "cloudinary",
          storedFilename: `${upload.publicId.split("/").pop() ?? upload.publicId}.webp`,
          url: upload.deliveryUrl,
          width: upload.width,
        },
      });
    } catch (error) {
      await destroyCloudinaryImage(upload.publicId).catch(() => undefined);
      console.error("Media upload database insert failed:", error);

      return errorState("Upload failed while saving media metadata.");
    }

    revalidateMediaLibrary();

    return successState(`${originalFilename} uploaded.`);
  } catch (error) {
    console.error("Media upload failed:", error);

    return errorState("Upload failed. Try another image or try again.");
  }
}

export async function deleteMediaAction(
  _state: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  try {
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return errorState("Media id is required.");
    }

    const media = await db.mediaFile.findUnique({
      where: { id },
      select: {
        deletedAt: true,
        filename: true,
        id: true,
        publicId: true,
        storageProvider: true,
        url: true,
      },
    });

    if (!media || media.deletedAt) {
      return errorState("Media file no longer exists.");
    }

    const productUsageCount = await db.productImage.count({
      where: { url: media.url },
    });

    if (productUsageCount > 0) {
      return errorState(
        `${media.filename} is used by ${productUsageCount} product image${productUsageCount === 1 ? "" : "s"}.`,
      );
    }

    await db.mediaFile.update({
      where: { id: media.id },
      data: { deletedAt: new Date() },
    });

    let cloudinaryDeleteFailed = false;

    if (media.storageProvider === "cloudinary" && media.publicId) {
      try {
        await destroyCloudinaryImage(media.publicId);
      } catch (error) {
        cloudinaryDeleteFailed = true;
        console.error("Cloudinary media delete failed:", error);
      }
    }

    revalidateMediaLibrary();

    return successState(
      cloudinaryDeleteFailed
        ? `${media.filename} deleted. Cloudinary cleanup could not be confirmed.`
        : `${media.filename} deleted.`,
    );
  } catch (error) {
    console.error("Media delete failed:", error);

    return errorState("Delete failed. Try again.");
  }
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "name" in value &&
    typeof value.name === "string" &&
    "size" in value &&
    typeof value.size === "number" &&
    "type" in value &&
    typeof value.type === "string"
  );
}

function getOriginalFilename(value: string) {
  const filename = value.replace(/^.*[\\/]/, "").trim();

  return filename || "media-upload";
}

function resolveAllowedMediaType(
  filename: string,
  submittedMimeType: string,
): AllowedMediaType | null {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = submittedMimeType.trim().toLowerCase();

  return (
    allowedMediaTypes.find(
      (type) =>
        type.extensions.some((allowedExtension) => allowedExtension === extension) ||
        (mimeType && type.mimeType === mimeType),
    ) ?? null
  );
}

function validateFileSignature(bytes: Buffer, mediaType: AllowedMediaType) {
  if (mediaType.mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      ? null
      : "The JPG file signature is invalid.";
  }

  if (mediaType.mimeType === "image/png") {
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    return pngSignature.every((byte, index) => bytes[index] === byte)
      ? null
      : "The PNG file signature is invalid.";
  }

  if (mediaType.mimeType === "image/webp") {
    return bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
      ? null
      : "The WEBP file signature is invalid.";
  }

  return null;
}

function revalidateMediaLibrary() {
  try {
    revalidatePath("/admin/media");
  } catch {
    // The mutation has already succeeded; keep the Server Action response valid.
  }
}

function successState(message: string): MediaActionState {
  return {
    message,
    ok: true,
  };
}

function errorState(error: string): MediaActionState {
  return {
    error,
    ok: false,
  };
}
