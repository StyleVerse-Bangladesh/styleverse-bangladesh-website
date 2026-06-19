import { randomBytes } from "node:crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export type CloudinaryUploadResult = {
  bytes: number;
  deliveryUrl: string;
  folder: string;
  format: string;
  height: number;
  publicId: string;
  secureUrl: string;
  width: number;
};

type CloudinaryDeliveryOptions = {
  crop?: string;
  gravity?: string;
  height?: number;
  quality?: string;
  width?: number;
};

type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
  folder: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
    folder: getMediaUploadFolder(),
  };
}

export function assertCloudinaryConfigured() {
  const config = getCloudinaryConfig();

  if (!config) {
    return null;
  }

  cloudinary.config({
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    cloud_name: config.cloudName,
    secure: true,
  });

  return config;
}

export function generateProductPublicId() {
  return `prd_${randomBytes(6).toString("hex")}`;
}

export async function uploadProductImageToCloudinary({
  buffer,
}: {
  buffer: Buffer;
}): Promise<CloudinaryUploadResult> {
  const config = assertCloudinaryConfigured();

  if (!config) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  const response = await uploadBuffer(buffer, {
    folder: config.folder,
    public_id: generateProductPublicId(),
  });
  const publicId = response.public_id?.trim();
  const secureUrl = response.secure_url?.trim();

  if (!publicId) {
    throw new Error("Cloudinary upload returned no public id.");
  }

  if (!secureUrl) {
    throw new Error("Cloudinary upload returned no secure URL.");
  }

  const deliveryUrl = buildCloudinaryDeliveryUrl(publicId);

  return {
    bytes: response.bytes,
    deliveryUrl,
    folder: config.folder,
    format: response.format,
    height: response.height,
    publicId,
    secureUrl,
    width: response.width,
  };
}

export async function destroyCloudinaryImage(publicId: string) {
  const config = assertCloudinaryConfigured();

  if (!config) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  return cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
}

export function buildCloudinaryDeliveryUrl(
  publicId: string,
  options: CloudinaryDeliveryOptions = {},
) {
  const config = assertCloudinaryConfigured();
  const trimmedPublicId = publicId.trim();

  if (!config) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  if (!trimmedPublicId) {
    throw new Error("Cloudinary public id is required.");
  }

  return cloudinary.url(trimmedPublicId, {
    secure: true,
    resource_type: "image",
    transformation: [
      withoutUndefinedValues({
        crop: options.crop,
        fetch_format: "auto",
        gravity: options.gravity,
        height: options.height,
        quality: options.quality ?? "auto:good",
        width: options.width,
      }),
    ],
  });
}

export function buildCloudinaryThumbnailUrl(
  publicId: string,
  options: CloudinaryDeliveryOptions = {},
) {
  return buildCloudinaryDeliveryUrl(publicId, {
    crop: options.crop ?? "fill",
    gravity: options.gravity ?? "auto",
    height: options.height ?? 160,
    quality: options.quality ?? "auto:eco",
    width: options.width ?? 160,
  });
}

export function buildHighQualityDeliveryUrl(publicId: string) {
  return buildCloudinaryDeliveryUrl(publicId, {
    quality: "auto:best",
  });
}

function getMediaUploadFolder() {
  const configuredFolder = normalizeFolder(
    process.env.CLOUDINARY_FOLDER || "styleverse",
  );

  if (configuredFolder.endsWith("/products")) {
    return configuredFolder;
  }

  return `${configuredFolder}/products`;
}

function normalizeFolder(value: string) {
  return (
    value
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\/+/g, "/") || "styleverse"
  );
}

function withoutUndefinedValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter((entry) => entry[1] !== undefined),
  );
}

function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    public_id: string;
  },
) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options,
        discard_original_filename: true,
        format: "webp",
        overwrite: false,
        quality: "auto:best",
        resource_type: "image",
        type: "upload",
        unique_filename: false,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload returned no result."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}
