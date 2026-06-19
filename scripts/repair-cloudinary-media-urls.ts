import { buildCloudinaryDeliveryUrl } from "../src/lib/cloudinary";
import { db } from "../src/lib/db";

async function main() {
  const mediaResult = await repairMediaFiles();
  const categoryResult = await repairCategoryMediaFields();

  console.log(
    [
      "Cloudinary URL repair complete.",
      `Media repaired ${mediaResult.repaired}, skipped ${mediaResult.skipped}.`,
      `Category fields repaired ${categoryResult.repaired}, skipped ${categoryResult.skipped}.`,
    ].join(" "),
  );
}

async function repairMediaFiles() {
  const mediaFiles = await db.mediaFile.findMany({
    orderBy: [{ uploadedAt: "desc" }],
    select: {
      id: true,
      publicId: true,
      secureUrl: true,
      storageProvider: true,
      url: true,
    },
    where: {
      storageProvider: "cloudinary",
      OR: [{ publicId: { not: null } }, { secureUrl: { not: null } }],
    },
  });

  let repaired = 0;
  let skipped = 0;

  for (const file of mediaFiles) {
    const nextUrl = getRepairedUrl(file.publicId, file.secureUrl);

    if (!nextUrl || nextUrl === file.url) {
      skipped += 1;
      continue;
    }

    await db.mediaFile.update({
      data: {
        url: nextUrl,
      },
      where: {
        id: file.id,
      },
    });

    repaired += 1;
  }

  return { repaired, skipped };
}

async function repairCategoryMediaFields() {
  const categories = await db.category.findMany({
    select: {
      icon: true,
      id: true,
      image: true,
    },
    where: {
      OR: [{ image: { contains: "res.cloudinary.com" } }, { icon: { contains: "res.cloudinary.com" } }],
    },
  });
  let repaired = 0;
  let skipped = 0;

  for (const category of categories) {
    const nextImage = getRepairedRenderableUrl(category.image);
    const nextIcon = getRepairedRenderableUrl(category.icon);
    const data = {
      ...(nextImage && nextImage !== category.image ? { image: nextImage } : {}),
      ...(nextIcon && nextIcon !== category.icon ? { icon: nextIcon } : {}),
    };

    if (!Object.keys(data).length) {
      skipped += 1;
      continue;
    }

    await db.category.update({
      data,
      where: {
        id: category.id,
      },
    });

    repaired += Object.keys(data).length;
  }

  return { repaired, skipped };
}

function getRepairedUrl(publicId: string | null, secureUrl: string | null) {
  if (publicId) {
    try {
      const deliveryUrl = buildCloudinaryDeliveryUrl(publicId);

      if (isUsableUrl(deliveryUrl)) {
        return deliveryUrl;
      }
    } catch {
      // Fall back to Cloudinary's persisted secure URL below.
    }
  }

  return secureUrl && isUsableUrl(secureUrl) ? secureUrl : null;
}

function isUsableUrl(value: string) {
  return Boolean(value.trim()) && !value.includes(`fl_${"strip"}`);
}

function getRepairedRenderableUrl(value: string | null) {
  if (!value || !isCloudinaryUrl(value)) {
    return null;
  }

  if (isUsableUrl(value)) {
    return value;
  }

  const publicId = getPublicIdFromCloudinaryUrl(value);

  return publicId ? getRepairedUrl(publicId, value) : null;
}

function isCloudinaryUrl(value: string) {
  return /^https:\/\/res\.cloudinary\.com\//i.test(value);
}

function getPublicIdFromCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex < 0) {
      return null;
    }

    const afterUpload = parts.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((part) => /^v\d+$/i.test(part));
    const publicPathParts =
      versionIndex >= 0
        ? afterUpload.slice(versionIndex + 1)
        : afterUpload.filter((part) => !part.includes(","));
    const publicPath = publicPathParts.join("/");

    return publicPath.replace(/\.[a-z0-9]+$/i, "") || null;
  } catch {
    return null;
  }
}

main()
  .catch((error) => {
    console.error("Cloudinary media URL repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
