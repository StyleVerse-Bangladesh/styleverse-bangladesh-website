import { ProductStatus } from "@prisma/client";
import {
  HomepageAdminPage,
  type HomepageAdminItem,
  type HomepageAdminSection,
  type HomepageCategoryOption,
  type HomepageMediaOption,
  type HomepageProductOption,
} from "@/app/admin/(panel)/homepage/homepage-admin";
import { db } from "@/lib/db";
import { getMediaPreviewUrl } from "@/lib/media-preview";

export const metadata = {
  title: "Admin Homepage CMS",
};

export default async function AdminHomepagePage() {
  const [sections, products, categories, media] = await Promise.all([
    getHomepageSections(),
    getProductOptions(),
    getCategoryOptions(),
    getMediaOptions(),
  ]);

  return (
    <HomepageAdminPage
      categories={categories}
      media={media}
      products={products}
      sections={sections}
    />
  );
}

async function getHomepageSections(): Promise<HomepageAdminSection[]> {
  const sections = await db.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      isActive: true,
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          alt: true,
          categoryId: true,
          href: true,
          id: true,
          image: true,
          metadata: true,
          productId: true,
          sortOrder: true,
          subtitle: true,
          title: true,
        },
      },
      sortOrder: true,
      subtitle: true,
      title: true,
      type: true,
    },
  });

  return sections.map((section) => ({
    id: section.id,
    isActive: section.isActive,
    itemCount: section.items.length,
    items: section.items.map(mapHomepageItem),
    sortOrder: section.sortOrder,
    subtitle: section.subtitle,
    title: section.title,
    type: section.type,
  }));
}

function mapHomepageItem(item: {
  alt: string | null;
  categoryId: string | null;
  href: string | null;
  id: string;
  image: string | null;
  metadata: unknown;
  productId: string | null;
  sortOrder: number;
  subtitle: string | null;
  title: string | null;
}): HomepageAdminItem {
  return {
    alt: item.alt,
    categoryId: item.categoryId,
    groupTitle: readMetadataString(item.metadata, "groupTitle") ?? "",
    href: item.href,
    icon: readMetadataString(item.metadata, "icon") ?? "check",
    id: item.id,
    image: item.image,
    productId: item.productId,
    sortOrder: item.sortOrder,
    subtitle: item.subtitle,
    title: item.title,
    tone:
      readMetadataString(item.metadata, "tone") ??
      "from-zinc-950 to-zinc-600",
  };
}

async function getProductOptions(): Promise<HomepageProductOption[]> {
  const products = await db.product.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      images: {
        orderBy: [{ sortOrder: "asc" }],
        select: {
          isPrimary: true,
          url: true,
        },
      },
      name: true,
      slug: true,
    },
    where: {
      status: ProductStatus.PUBLISHED,
    },
  });

  return products.map((product) => ({
    id: product.id,
    imageUrl:
      product.images.find((image) => image.isPrimary)?.url ??
      product.images[0]?.url ??
      null,
    name: product.name,
    slug: product.slug,
  }));
}

async function getCategoryOptions(): Promise<HomepageCategoryOption[]> {
  const categories = await db.category.findMany({
    orderBy: [{ pathKey: "asc" }],
    select: {
      id: true,
      label: true,
      pathKey: true,
    },
    where: {
      isActive: true,
    },
  });

  return categories.map((category) => ({
    id: category.id,
    label: category.label,
    pathKey: category.pathKey,
  }));
}

async function getMediaOptions(): Promise<HomepageMediaOption[]> {
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
    take: 24,
    where: {
      deletedAt: null,
    },
  });

  return Promise.all(
    files.map(async (file) => {
      const preview = await getMediaPreviewUrl(file);

      return {
        filename: file.filename,
        id: file.id,
        previewUrl: preview.previewUrl,
        url: preview.mediaUrl ?? file.url,
      };
    }),
  );
}

function readMetadataString(metadata: unknown, key: string) {
  const record = readMetadataRecord(metadata);
  const value = record?.[key];

  return typeof value === "string" ? value : undefined;
}

function readMetadataRecord(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as Record<string, unknown>;
}
