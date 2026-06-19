import { mapHomepageDtoToHomepageContent } from "@/lib/api/adapters/homepage-adapter";
import { assets, type WebpAssetFile } from "@/lib/constants/assets";
import { HomepageSectionType, ProductStatus } from "@prisma/client";
import type {
  HomepageContent,
  HomepageFeature,
  HomepageSectionState,
} from "@/lib/api/adapters/homepage-adapter";
import type { HomepageContentDto } from "@/types/api/homepage.dto";

const homepageCategoryPositions = [1, 2, 3, 4] as const;
const homepageCategoryToneFallbacks = [
  "from-zinc-950 to-zinc-600",
  "from-neutral-800 to-zinc-300",
  "from-slate-900 to-slate-500",
  "from-stone-900 to-stone-300",
];

const staticHomepageContentDto: HomepageContentDto = {
  heroSlides: [
    heroSlide("hero-banner-1", "hero-1.webp", 0),
    heroSlide("hero-banner-2", "hero-2.webp", 1),
    heroSlide("hero-banner-3", "hero-3.webp", 2),
    heroSlide("hero-banner-4", "hero-4.webp", 3),
    heroSlide("hero-banner-5", "hero-5.webp", 4),
  ],
  categoryGroups: [
    {
      id: "men-essentials",
      title: "Men Essentials",
      sortOrder: 0,
      items: [
        categoryItem("men-t-shirts", "T-Shirts", "/men/t-shirts", "from-zinc-950 to-zinc-600", 0),
        categoryItem("men-polo", "Polo", "/men/polo-t-shirts", "from-neutral-700 to-stone-300", 1),
        categoryItem("men-shirts", "Shirts", "/men/shirts", "from-slate-900 to-slate-500", 2),
        categoryItem("men-joggers", "Joggers", "/men/joggers", "from-stone-800 to-zinc-400", 3),
      ],
    },
    {
      id: "women-collection",
      title: "Women Collection",
      sortOrder: 1,
      items: [
        categoryItem("women-dresses", "Dresses", "/women", "from-zinc-900 to-rose-200", 0),
        categoryItem("women-tops", "Tops", "/women", "from-neutral-800 to-zinc-300", 1),
        categoryItem("women-co-ord", "Co-Ord Set", "/women", "from-stone-900 to-stone-300", 2),
        categoryItem("women-outerwear", "Outerwear", "/women", "from-slate-950 to-slate-400", 3),
      ],
    },
    {
      id: "kids",
      title: "Kids",
      sortOrder: 2,
      items: [
        categoryItem("kids-t-shirts", "T-Shirts", "/kids", "from-black to-zinc-500", 0),
        categoryItem("kids-sets", "Sets", "/kids", "from-zinc-900 to-neutral-300", 1),
        categoryItem("kids-shoes", "Shoes", "/kids", "from-slate-900 to-slate-400", 2),
        categoryItem("kids-accessories", "Accessories", "/kids", "from-stone-800 to-stone-300", 3),
      ],
    },
    {
      id: "accessories",
      title: "Accessories",
      sortOrder: 3,
      items: [
        categoryItem("accessories-bags", "Bags", "/accessories", "from-neutral-950 to-neutral-500", 0),
        categoryItem("accessories-caps", "Caps", "/accessories", "from-zinc-800 to-zinc-300", 1),
        categoryItem("accessories-belts", "Belts", "/accessories", "from-stone-950 to-stone-500", 2),
        categoryItem("accessories-sunglasses", "Sunglasses", "/accessories", "from-slate-900 to-zinc-300", 3),
      ],
    },
  ],
  newArrivals: [
    productCard("svb-001-black", "svb-001", "Half Sleeve Printed Casual Shirt For Men", "half-sleeve-printed-casual-shirt-black.webp", 990, 1490, "/products/structured-cotton-shirt", 0),
    productCard("svb-001-white", "svb-001", "Half Sleeve Printed Casual Shirt For Men", "half-sleeve-printed-casual-shirt-white.webp", 990, 1490, "/products/structured-cotton-shirt", 1),
    productCard("svb-002-black", "svb-002", "Premium Knitted Polo Shirt For Men", "premium-knitted-polo-shirt-black.webp", 1190, 1500, "/products/relaxed-linen-dress", 2),
    productCard("svb-004-cream", "svb-004", "Premium Knitted Polo Shirt For Men", "premium-knitted-polo-shirt-cream.webp", 1190, 1500, "/products/performance-knit-sneaker", 3),
    productCard("svb-003-olive", "svb-003", "Premium Knit Casual Polo", "premium-knit-casual-polo-olive.webp", 1190, 1500, "/products/kids-everyday-hoodie", 4),
    productCard("svb-001-sand", "svb-001", "Relaxed Everyday Fashion Shirt", "relaxed-everyday-fashion-shirt-sand.webp", 1290, 1690, "/products/structured-cotton-shirt", 5),
  ],
  recommendedProductIds: [],
  featureStrip: [
    { id: "premium-quality", title: "Premium Quality Products", icon: "check", sortOrder: 0 },
    { id: "fast-shipping", title: "Fastest Shipping Countrywide", icon: "truck", sortOrder: 1 },
    { id: "easy-exchange", title: "Easy Exchange Policy", icon: "refresh", sortOrder: 2 },
    { id: "online-support", title: "Online Support 24/7", icon: "headphones", sortOrder: 3 },
  ],
};

export async function getHomepageContent(): Promise<HomepageContent> {
  const staticContent = mapHomepageDtoToHomepageContent(staticHomepageContentDto);
  let content = staticContent;

  try {
    const sections = await getHomepageSectionsFromDb();
    const activeSections = sections.filter(isCurrentlyActiveSection);

    if (activeSections.length) {
      content = mergeDbSectionsWithStaticFallback(
        sections,
        activeSections,
        staticContent,
      );
    }
  } catch (error) {
    console.error("Homepage CMS query failed:", error);
  }

  try {
    const slots = await getHomepageCategorySlotsFromDb();

    return withHomepageCategoryGroups(
      content,
      mergeHomepageCategorySlotsWithFallback(
        buildFallbackCategoryGroups(staticContent),
        slots,
      ),
    );
  } catch (error) {
    if (!isPrismaMissingTableError(error)) {
      console.error("Homepage category slot query failed:", error);
    }

    return withHomepageCategoryGroups(
      content,
      buildFallbackCategoryGroups(staticContent),
    );
  }
}

async function getHomepageSectionsFromDb() {
  const { db } = await import("@/lib/db");

  return db.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      endsAt: true,
      id: true,
      isActive: true,
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          alt: true,
          category: {
            select: {
              label: true,
              path: true,
            },
          },
          categoryId: true,
          href: true,
          id: true,
          image: true,
          metadata: true,
          product: {
            select: {
              compareAtPrice: true,
              currency: true,
              id: true,
              images: {
                orderBy: [{ sortOrder: "asc" }],
                select: {
                  isPrimary: true,
                  url: true,
                },
              },
              name: true,
              price: true,
              slug: true,
              status: true,
            },
          },
          productId: true,
          sortOrder: true,
          subtitle: true,
          title: true,
        },
      },
      settings: true,
      sortOrder: true,
      startsAt: true,
      subtitle: true,
      title: true,
      type: true,
    },
  });
}

async function getHomepageCategorySlotsFromDb() {
  const { db } = await import("@/lib/db");

  return db.homepageCategorySlot.findMany({
    orderBy: [{ position: "asc" }],
    select: {
      items: {
        orderBy: [{ position: "asc" }],
        select: {
          category: {
            select: {
              image: true,
              isActive: true,
              label: true,
              path: true,
              tone: true,
            },
          },
          categoryId: true,
          imageOverride: true,
          labelOverride: true,
          position: true,
        },
      },
      position: true,
      rootCategory: {
        select: {
          isActive: true,
          path: true,
        },
      },
      title: true,
    },
    where: {
      isActive: true,
      position: {
        in: [...homepageCategoryPositions],
      },
    },
  });
}

type HomepageSectionRecord = Awaited<
  ReturnType<typeof getHomepageSectionsFromDb>
>[number];

type HomepageCategorySlotRecord = Awaited<
  ReturnType<typeof getHomepageCategorySlotsFromDb>
>[number];

function mergeDbSectionsWithStaticFallback(
  sections: HomepageSectionRecord[],
  activeSections: HomepageSectionRecord[],
  staticContent: HomepageContent,
): HomepageContent {
  const existingTypes = new Set(sections.map((section) => section.type));
  const activeSectionsByType = groupSectionsByType(activeSections);
  const content: HomepageContent = {
    heroSlides: resolveSectionContent({
      activeSectionsByType,
      existingTypes,
      fallback: staticContent.heroSlides,
      map: mapHeroSlides,
      type: HomepageSectionType.HERO,
    }),
    categoryGroups: resolveSectionContent({
      activeSectionsByType,
      existingTypes,
      fallback: staticContent.categoryGroups,
      map: mapCategoryGroups,
      type: HomepageSectionType.CATEGORY_GROUP,
    }),
    newArrivals: resolveSectionContent({
      activeSectionsByType,
      existingTypes,
      fallback: staticContent.newArrivals,
      map: mapProductCards,
      type: HomepageSectionType.NEW_ARRIVALS,
    }),
    recommendedProductIds: resolveSectionContent({
      activeSectionsByType,
      existingTypes,
      fallback: staticContent.recommendedProductIds,
      map: mapRecommendedProductIds,
      type: HomepageSectionType.RECOMMENDED_PRODUCTS,
    }),
    featureStrip: resolveSectionContent({
      activeSectionsByType,
      existingTypes,
      fallback: staticContent.featureStrip,
      map: mapFeatureStrip,
      type: HomepageSectionType.FEATURE_STRIP,
    }),
    sections: {
      categoryGroups: resolveSectionState({
        defaultState: staticContent.sections.categoryGroups,
        sections,
        type: HomepageSectionType.CATEGORY_GROUP,
      }),
      featureStrip: resolveSectionState({
        defaultState: staticContent.sections.featureStrip,
        sections,
        type: HomepageSectionType.FEATURE_STRIP,
      }),
      hero: resolveSectionState({
        defaultState: staticContent.sections.hero,
        sections,
        type: HomepageSectionType.HERO,
      }),
      newArrivals: resolveSectionState({
        defaultState: staticContent.sections.newArrivals,
        sections,
        type: HomepageSectionType.NEW_ARRIVALS,
      }),
      recommendedProducts: resolveSectionState({
        defaultState: staticContent.sections.recommendedProducts,
        sections,
        type: HomepageSectionType.RECOMMENDED_PRODUCTS,
      }),
    },
  };

  return content;
}

function groupSectionsByType(sections: HomepageSectionRecord[]) {
  const grouped = new Map<HomepageSectionType, HomepageSectionRecord[]>();

  for (const section of sections) {
    grouped.set(section.type, [...(grouped.get(section.type) ?? []), section]);
  }

  return grouped;
}

function withHomepageCategoryGroups(
  content: HomepageContent,
  groups: HomepageContent["categoryGroups"],
): HomepageContent {
  return {
    ...content,
    categoryGroups: groups,
    sections: {
      ...content.sections,
      categoryGroups: {
        ...content.sections.categoryGroups,
        enabled: true,
        title: "SHOP BY CATEGORY",
      },
    },
  };
}

function buildFallbackCategoryGroups(staticContent: HomepageContent) {
  return ensureFourGroupsWithFourItems(staticContent.categoryGroups);
}

function mergeHomepageCategorySlotsWithFallback(
  fallbackGroups: HomepageContent["categoryGroups"],
  slots: HomepageCategorySlotRecord[],
): HomepageContent["categoryGroups"] {
  const slotByPosition = new Map(
    slots
      .filter((slot) => isHomepageCategoryPosition(slot.position))
      .map((slot) => [slot.position, slot]),
  );

  return ensureFourGroupsWithFourItems(
    fallbackGroups.map((fallbackGroup, groupIndex) => {
      const position = groupIndex + 1;
      const slot = slotByPosition.get(position);

      if (!slot || !isValidHomepageCategorySlot(slot)) {
        return fallbackGroup;
      }

      const itemByPosition = new Map(
        slot.items
          .filter((item) => isHomepageCategoryPosition(item.position))
          .map((item) => [item.position, item]),
      );
      const usedHrefs = new Set<string>();

      return {
        title: slot.title.trim() || fallbackGroup.title,
        items: fallbackGroup.items.map((fallbackItem, itemIndex) => {
          const itemPosition = itemIndex + 1;
          const item = itemByPosition.get(itemPosition);
          const overlayItem = item
            ? mapHomepageCategorySlotItem(item, fallbackItem, groupIndex, itemIndex)
            : null;
          const selectedItem =
            overlayItem && !usedHrefs.has(normalizeHref(overlayItem.href))
              ? overlayItem
              : fallbackItem;

          usedHrefs.add(normalizeHref(selectedItem.href));

          return selectedItem;
        }),
      };
    }),
  );
}

function mapHomepageCategorySlotItem(
  item: HomepageCategorySlotRecord["items"][number],
  fallbackItem: CategoryGroupItem,
  groupIndex: number,
  itemIndex: number,
): CategoryGroupItem | null {
  if (!item.category.isActive) {
    return null;
  }

  const href = normalizeCategoryHref(item.category.path);

  if (!href) {
    return null;
  }

  return {
    href,
    image: item.imageOverride || item.category.image || fallbackItem.image,
    label: item.labelOverride || item.category.label,
    tone:
      item.category.tone ||
      fallbackItem.tone ||
      homepageCategoryToneFallbacks[
        (groupIndex + itemIndex) % homepageCategoryToneFallbacks.length
      ],
  };
}

function isValidHomepageCategorySlot(slot: HomepageCategorySlotRecord) {
  return slot.rootCategory.isActive && Boolean(normalizeCategoryHref(slot.rootCategory.path));
}

function ensureFourGroupsWithFourItems(
  groups: HomepageContent["categoryGroups"],
): HomepageContent["categoryGroups"] {
  return homepageCategoryPositions.map((position, groupIndex) => {
    const fallbackItem = {
      href: "/",
      label: "Shop",
      tone:
        homepageCategoryToneFallbacks[
          groupIndex % homepageCategoryToneFallbacks.length
        ],
    };
    const group = groups[groupIndex] ?? {
      items: [],
      title: `Category Slot ${position}`,
    };
    const firstItem = group.items[0] ?? fallbackItem;

    return {
      title: group.title || `Category Slot ${position}`,
      items: homepageCategoryPositions.map(
        (_itemPosition, itemIndex) => group.items[itemIndex] ?? firstItem,
      ),
    };
  });
}

function isHomepageCategoryPosition(value: number) {
  return homepageCategoryPositions.includes(
    value as (typeof homepageCategoryPositions)[number],
  );
}

function resolveSectionContent<T>({
  activeSectionsByType,
  existingTypes,
  fallback,
  map,
  type,
}: {
  activeSectionsByType: Map<HomepageSectionType, HomepageSectionRecord[]>;
  existingTypes: Set<HomepageSectionType>;
  fallback: T[];
  map: (sections: HomepageSectionRecord[]) => T[];
  type: HomepageSectionType;
}) {
  const activeSections = activeSectionsByType.get(type) ?? [];

  if (!activeSections.length) {
    return existingTypes.has(type) ? [] : fallback;
  }

  const mapped = map(activeSections);

  return mapped.length ? mapped : fallback;
}

function resolveSectionState({
  defaultState,
  sections,
  type,
}: {
  defaultState: HomepageSectionState;
  sections: HomepageSectionRecord[];
  type: HomepageSectionType;
}): HomepageSectionState {
  const section = sections.find((item) => item.type === type);

  if (!section) {
    return defaultState;
  }

  return {
    enabled: isCurrentlyActiveSection(section),
    subtitle: section.subtitle ?? undefined,
    title: section.title || defaultState.title,
  };
}

function isCurrentlyActiveSection(section: HomepageSectionRecord) {
  const now = Date.now();

  return (
    section.isActive &&
    (!section.startsAt || section.startsAt.getTime() <= now) &&
    (!section.endsAt || section.endsAt.getTime() >= now)
  );
}

function mapHeroSlides(sections: HomepageSectionRecord[]) {
  return sections
    .flatMap((section) =>
      section.items.map((item) => {
        if (!item.image) {
          return null;
        }

        return {
          id: item.id,
          image: item.image,
          width: readMetadataNumber(item.metadata, "width") ?? 1920,
          height: readMetadataNumber(item.metadata, "height") ?? 690,
          alt: item.alt || item.title || "StyleVerse Bangladesh hero banner",
          href: item.href || "#",
          category: item.title || section.title || "Hero Banner",
          sortOrder: item.sortOrder,
        };
      }),
    )
    .filter(isDefined)
    .sort(sortBySortOrder);
}

function mapFeatureStrip(sections: HomepageSectionRecord[]): HomepageFeature[] {
  return sections
    .flatMap((section) =>
      section.items.map((item) => {
        if (!item.title) {
          return null;
        }

        return {
          id: item.id,
          title: item.title,
          icon: readFeatureIcon(item.metadata),
          sortOrder: item.sortOrder,
        };
      }),
    )
    .filter(isDefined)
    .sort(sortBySortOrder);
}

function mapCategoryGroups(sections: HomepageSectionRecord[]) {
  const groups = new Map<
    string,
    {
      items: Array<{
        href: string;
        image?: string;
        label: string;
        sortOrder: number;
        tone: string;
      }>;
      sortOrder: number;
      title: string;
    }
  >();

  for (const section of sections) {
    for (const item of section.items) {
      const title = item.title || item.category?.label;

      if (!title) {
        continue;
      }

      const groupTitle =
        readMetadataString(item.metadata, "groupTitle") ||
        section.title ||
        "Featured Categories";
      const group = groups.get(groupTitle) ?? {
        items: [],
        sortOrder: readMetadataNumber(item.metadata, "groupSortOrder") ?? section.sortOrder,
        title: groupTitle,
      };

      group.items.push({
        href: item.href || getCategoryHref(item.category?.path) || "#",
        image: item.image ?? undefined,
        label: title,
        sortOrder: item.sortOrder,
        tone: readMetadataString(item.metadata, "tone") || "from-zinc-950 to-zinc-600",
      });
      groups.set(groupTitle, group);
    }
  }

  return Array.from(groups.values())
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((group) => ({
      title: group.title,
      items: group.items
        .sort(sortBySortOrder)
        .map((item) => ({
          href: item.href,
          image: item.image,
          label: item.label,
          tone: item.tone,
        })),
    }));
}

type CategoryGroupItem = HomepageContent["categoryGroups"][number]["items"][number];

function mapProductCards(sections: HomepageSectionRecord[]) {
  return sections
    .flatMap((section) =>
      section.items.map((item) => {
        const product = item.product;
        const image =
          item.image ||
          product?.images.find((productImage) => productImage.isPrimary)?.url ||
          product?.images[0]?.url;
        const name = item.title || product?.name;
        const price = readMetadataNumber(item.metadata, "price") ?? product?.price;

        if (!image || !name || !price) {
          return null;
        }

        return {
          id: item.id,
          wishlistId:
            readMetadataString(item.metadata, "wishlistId") ||
            product?.id ||
            item.productId ||
            item.id,
          name,
          image,
          price: Number(price),
          compareAtPrice:
            readMetadataNumber(item.metadata, "compareAtPrice") ??
            (product?.compareAtPrice ? Number(product.compareAtPrice) : undefined),
          href: item.href || (product ? `/products/${product.slug}` : "#"),
          sortOrder: item.sortOrder,
        };
      }),
    )
    .filter(isDefined)
    .sort(sortBySortOrder);
}

function mapRecommendedProductIds(sections: HomepageSectionRecord[]) {
  return sections
    .flatMap((section) => section.items)
    .filter((item) => item.product?.status === ProductStatus.PUBLISHED)
    .sort(sortBySortOrder)
    .map((item) => item.productId)
    .filter(isDefined);
}

function getCategoryHref(path: string[] | undefined) {
  return path?.length ? `/${path.join("/")}` : null;
}

function normalizeCategoryHref(path: string[] | undefined) {
  const href = getCategoryHref(path);

  return href ? normalizeHref(href) : null;
}

function normalizeHref(href: string) {
  const trimmedHref = href.trim();

  if (trimmedHref.length <= 1) {
    return trimmedHref;
  }

  return trimmedHref.replace(/\/+$/, "");
}

function readFeatureIcon(metadata: unknown): HomepageFeature["icon"] {
  const icon = readMetadataString(metadata, "icon");

  if (
    icon === "check" ||
    icon === "truck" ||
    icon === "refresh" ||
    icon === "headphones"
  ) {
    return icon;
  }

  return "check";
}

function readMetadataString(metadata: unknown, key: string) {
  const value = readMetadataRecord(metadata)?.[key];

  return typeof value === "string" ? value : undefined;
}

function readMetadataNumber(metadata: unknown, key: string) {
  const value = readMetadataRecord(metadata)?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function isPrismaMissingTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2021"
  );
}

function readMetadataRecord(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

function sortBySortOrder(left: { sortOrder: number }, right: { sortOrder: number }) {
  return left.sortOrder - right.sortOrder;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function heroSlide(id: string, image: WebpAssetFile, sortOrder: number) {
  const index = sortOrder + 1;

  return {
    id,
    image: assets.heroImage(image),
    width: 1920,
    height: 690,
    alt: `StyleVerse Bangladesh hero banner ${index}`,
    href: "#",
    category: `Hero Banner ${index}`,
    sortOrder,
  };
}

function categoryItem(
  id: string,
  label: string,
  href: string,
  tone: string,
  sortOrder: number,
) {
  return { id, label, href, tone, sortOrder };
}

function productCard(
  id: string,
  wishlistId: string,
  name: string,
  image: WebpAssetFile,
  price: number,
  compareAtPrice: number,
  href: string,
  sortOrder: number,
) {
  return {
    id,
    wishlistId,
    name,
    image: assets.productImage(image),
    price,
    compareAtPrice,
    href,
    sortOrder,
  };
}
