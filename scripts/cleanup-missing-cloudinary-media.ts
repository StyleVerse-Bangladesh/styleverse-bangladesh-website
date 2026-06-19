import { buildCloudinaryDeliveryUrl } from "../src/lib/cloudinary";
import { db } from "../src/lib/db";

type ProbeResult = {
  error: string | null;
  label: string;
  status: number | null;
  url: string | null;
};

type BrokenMedia = {
  filename: string;
  generatedUrl: string | null;
  id: string;
  probes: ProbeResult[];
  publicId: string | null;
  secureUrl: string | null;
  storagePath: string;
  uploadedAt: Date;
  url: string;
};

type Reference = {
  field: string;
  id: string;
  model: ReferenceModel;
  safeToClear: boolean;
  value: string;
};

type ReferenceModel =
  | "category"
  | "homepageSectionItem"
  | "orderItem"
  | "productImage"
  | "seoSetting"
  | "storeSettings";

const execute = process.argv.includes("--execute");

async function main() {
  const brokenMedia = await findBrokenCloudinaryMedia();
  const cleanupResults = [];

  for (const media of brokenMedia) {
    const references = await findReferences(media);
    const unsafeReferences = references.filter((reference) => !reference.safeToClear);
    const safeReferences = references.filter((reference) => reference.safeToClear);

    if (execute && unsafeReferences.length === 0) {
      await clearReferences(safeReferences);
      await db.mediaFile.delete({ where: { id: media.id } });
    }

    cleanupResults.push({
      action:
        unsafeReferences.length > 0
          ? "skipped-unsafe-references"
          : execute
            ? "deleted"
            : "would-delete",
      clearedReferences: execute && unsafeReferences.length === 0 ? safeReferences : [],
      media,
      safeReferences,
      unsafeReferences,
      used: references.length > 0,
    });
  }

  printSummary(cleanupResults);
}

async function findBrokenCloudinaryMedia(): Promise<BrokenMedia[]> {
  const candidates = await db.mediaFile.findMany({
    orderBy: [{ uploadedAt: "desc" }],
    select: {
      filename: true,
      id: true,
      publicId: true,
      secureUrl: true,
      storagePath: true,
      storageProvider: true,
      uploadedAt: true,
      url: true,
    },
    where: {
      OR: [
        { storageProvider: "cloudinary" },
        { publicId: { not: null } },
        { secureUrl: { contains: "res.cloudinary.com" } },
        { url: { contains: "res.cloudinary.com" } },
      ],
    },
  });
  const brokenMedia: BrokenMedia[] = [];

  for (const candidate of candidates) {
    const generatedUrl = getGeneratedUrl(candidate.publicId);
    const probes = await Promise.all([
      probeUrl("url", candidate.url),
      probeUrl("secureUrl", candidate.secureUrl),
      probeUrl("generatedUrl", generatedUrl),
    ]);

    if (!isMissingCloudinaryMedia(probes)) {
      continue;
    }

    brokenMedia.push({
      filename: candidate.filename,
      generatedUrl,
      id: candidate.id,
      probes,
      publicId: candidate.publicId,
      secureUrl: candidate.secureUrl,
      storagePath: candidate.storagePath,
      uploadedAt: candidate.uploadedAt,
      url: candidate.url,
    });
  }

  return brokenMedia;
}

function getGeneratedUrl(publicId: string | null) {
  if (!publicId) {
    return null;
  }

  try {
    return buildCloudinaryDeliveryUrl(publicId);
  } catch {
    return null;
  }
}

async function probeUrl(label: string, url: string | null): Promise<ProbeResult> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return {
      error: null,
      label,
      status: null,
      url,
    };
  }

  try {
    const response = await fetch(url);
    const cloudinaryError = response.headers.get("x-cld-error");

    await response.body?.cancel?.();

    return {
      error: cloudinaryError,
      label,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      label,
      status: null,
      url,
    };
  }
}

function isMissingCloudinaryMedia(probes: ProbeResult[]) {
  const cloudinaryProbes = probes.filter((probe) =>
    probe.url ? isCloudinaryUrl(probe.url) : false,
  );

  return (
    cloudinaryProbes.length > 0 &&
    cloudinaryProbes.every(
      (probe) =>
        probe.status === 404 ||
        probe.error?.toLowerCase().includes("resource not found"),
    )
  );
}

async function findReferences(media: BrokenMedia): Promise<Reference[]> {
  const values = uniqueStrings([
    media.url,
    media.secureUrl,
    media.generatedUrl,
    media.publicId,
    media.storagePath,
  ]);
  const references = await Promise.all([
    findCategoryReferences(values),
    findHomepageSectionItemReferences(values),
    findProductImageReferences(values),
    findStoreSettingsReferences(values),
    findSeoSettingReferences(values),
    findOrderItemReferences(values),
  ]);

  return references.flat();
}

async function findCategoryReferences(values: string[]): Promise<Reference[]> {
  const records = await db.category.findMany({
    select: {
      icon: true,
      id: true,
      image: true,
    },
    where: {
      OR: [{ image: { in: values } }, { icon: { in: values } }],
    },
  });

  return records.flatMap((record) => [
    ...referenceIfMatched("category", record.id, "image", record.image, values, true),
    ...referenceIfMatched("category", record.id, "icon", record.icon, values, true),
  ]);
}

async function findHomepageSectionItemReferences(
  values: string[],
): Promise<Reference[]> {
  const records = await db.homepageSectionItem.findMany({
    select: {
      id: true,
      image: true,
    },
    where: {
      image: { in: values },
    },
  });

  return records.flatMap((record) =>
    referenceIfMatched(
      "homepageSectionItem",
      record.id,
      "image",
      record.image,
      values,
      true,
    ),
  );
}

async function findProductImageReferences(values: string[]): Promise<Reference[]> {
  const records = await db.productImage.findMany({
    select: {
      id: true,
      url: true,
    },
    where: {
      url: { in: values },
    },
  });

  return records.flatMap((record) =>
    referenceIfMatched("productImage", record.id, "url", record.url, values, false),
  );
}

async function findStoreSettingsReferences(values: string[]): Promise<Reference[]> {
  const records = await db.storeSettings.findMany({
    select: {
      footerLogo: true,
      headerLogo: true,
      id: true,
    },
    where: {
      OR: [{ headerLogo: { in: values } }, { footerLogo: { in: values } }],
    },
  });

  return records.flatMap((record) => [
    ...referenceIfMatched(
      "storeSettings",
      record.id,
      "headerLogo",
      record.headerLogo,
      values,
      true,
    ),
    ...referenceIfMatched(
      "storeSettings",
      record.id,
      "footerLogo",
      record.footerLogo,
      values,
      true,
    ),
  ]);
}

async function findSeoSettingReferences(values: string[]): Promise<Reference[]> {
  const records = await db.seoSetting.findMany({
    select: {
      id: true,
      ogImage: true,
    },
    where: {
      ogImage: { in: values },
    },
  });

  return records.flatMap((record) =>
    referenceIfMatched("seoSetting", record.id, "ogImage", record.ogImage, values, true),
  );
}

async function findOrderItemReferences(values: string[]): Promise<Reference[]> {
  const records = await db.orderItem.findMany({
    select: {
      id: true,
      productImageSnapshot: true,
    },
    where: {
      productImageSnapshot: { in: values },
    },
  });

  return records.flatMap((record) =>
    referenceIfMatched(
      "orderItem",
      record.id,
      "productImageSnapshot",
      record.productImageSnapshot,
      values,
      false,
    ),
  );
}

function referenceIfMatched(
  model: ReferenceModel,
  id: string,
  field: string,
  value: string | null,
  values: string[],
  safeToClear: boolean,
): Reference[] {
  return value && values.includes(value)
    ? [
        {
          field,
          id,
          model,
          safeToClear,
          value,
        },
      ]
    : [];
}

async function clearReferences(references: Reference[]) {
  for (const reference of references) {
    if (reference.model === "category") {
      await db.category.update({
        data: { [reference.field]: null },
        where: { id: reference.id },
      });
      continue;
    }

    if (reference.model === "homepageSectionItem") {
      await db.homepageSectionItem.update({
        data: { image: null },
        where: { id: reference.id },
      });
      continue;
    }

    if (reference.model === "storeSettings") {
      await db.storeSettings.update({
        data: { [reference.field]: null },
        where: { id: reference.id },
      });
      continue;
    }

    if (reference.model === "seoSetting") {
      await db.seoSetting.update({
        data: { ogImage: null },
        where: { id: reference.id },
      });
    }
  }
}

function printSummary(
  results: Array<{
    action: string;
    clearedReferences: Reference[];
    media: BrokenMedia;
    safeReferences: Reference[];
    unsafeReferences: Reference[];
    used: boolean;
  }>,
) {
  console.log(execute ? "Mode: execute" : "Mode: dry-run");
  console.log(`Broken Cloudinary media rows found: ${results.length}`);

  for (const result of results) {
    console.log("");
    console.log(`Media ${result.media.id}`);
    console.log(`  filename: ${result.media.filename}`);
    console.log(`  uploadedAt: ${result.media.uploadedAt.toISOString()}`);
    console.log(`  publicId: ${result.media.publicId ?? "<null>"}`);
    console.log(`  storagePath: ${result.media.storagePath}`);
    console.log(`  url: ${result.media.url}`);
    console.log(`  secureUrl: ${result.media.secureUrl ?? "<null>"}`);
    console.log(`  generatedUrl: ${result.media.generatedUrl ?? "<null>"}`);

    for (const probe of result.media.probes) {
      console.log(
        `  ${probe.label} status: ${probe.status ?? "<not-http>"}${probe.error ? ` (${probe.error})` : ""}`,
      );
    }

    console.log(`  used: ${result.used ? "yes" : "no"}`);
    printReferences("safe references", result.safeReferences);
    printReferences("unsafe references", result.unsafeReferences);
    printReferences("cleared references", result.clearedReferences);
    console.log(`  action: ${result.action}`);
  }
}

function printReferences(label: string, references: Reference[]) {
  if (!references.length) {
    console.log(`  ${label}: none`);
    return;
  }

  console.log(`  ${label}:`);

  for (const reference of references) {
    console.log(
      `    ${reference.model}.${reference.field} id=${reference.id} value=${reference.value}`,
    );
  }
}

function uniqueStrings(values: Array<string | null>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  );
}

function isCloudinaryUrl(value: string) {
  return /^https:\/\/res\.cloudinary\.com\//i.test(value);
}

main()
  .catch((error) => {
    console.error("Missing Cloudinary media cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
