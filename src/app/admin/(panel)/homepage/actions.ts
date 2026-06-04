"use server";

import { revalidatePath } from "next/cache";
import { HomepageSectionType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type HomepageActionState = {
  message?: string;
  status?: "error" | "success";
  values?: Record<string, string | boolean | undefined>;
};

const featureIcons = new Set(["check", "truck", "refresh", "headphones"]);

export async function updateHomepageSectionAction(
  _state: HomepageActionState,
  formData: FormData,
): Promise<HomepageActionState> {
  const id = readString(formData, "id");
  const title = readString(formData, "title");
  const subtitle = readNullableString(formData, "subtitle");
  const sortOrder = parseSortOrder(readString(formData, "sortOrder"));
  const isActive = formData.get("isActive") === "on";

  if (!id) {
    return errorState("Section id is required.");
  }

  if (!Number.isFinite(sortOrder)) {
    return errorState("Sort order must be numeric.", {
      isActive,
      subtitle: subtitle ?? "",
      title,
    });
  }

  await db.homepageSection.update({
    where: { id },
    data: {
      isActive,
      sortOrder,
      subtitle,
      title: title || null,
    },
  });

  revalidateHomepage();

  return {
    message: "Section updated.",
    status: "success",
  };
}

export async function saveHomepageItemAction(
  _state: HomepageActionState,
  formData: FormData,
): Promise<HomepageActionState> {
  const id = readString(formData, "id");
  const sectionId = readString(formData, "sectionId");
  const sectionType = parseHomepageSectionType(readString(formData, "sectionType"));
  const input = parseItemForm(formData);

  if (!sectionId || !sectionType) {
    return errorState("Section information is required.", input.values);
  }

  const section = await db.homepageSection.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      type: true,
    },
  });

  if (!section || section.type !== sectionType) {
    return errorState("Section no longer exists.", input.values);
  }

  const validationError = await validateItem(sectionType, input);

  if (validationError) {
    return errorState(validationError, input.values);
  }

  const data = {
    alt: input.alt,
    categoryId: input.categoryId,
    href: input.href,
    image: input.image,
    metadata: buildItemMetadata(sectionType, formData),
    productId: input.productId,
    sectionId,
    sortOrder: input.sortOrder,
    subtitle: input.subtitle,
    title: input.title,
  };

  if (id) {
    await db.homepageSectionItem.update({
      where: { id },
      data,
    });
  } else {
    await db.homepageSectionItem.create({
      data,
    });
  }

  revalidateHomepage();

  return {
    message: id ? "Item updated." : "Item added.",
    status: "success",
  };
}

export async function deleteHomepageItemAction(
  _state: HomepageActionState,
  formData: FormData,
): Promise<HomepageActionState> {
  const id = readString(formData, "id");

  if (!id) {
    return errorState("Item id is required.");
  }

  await db.homepageSectionItem.delete({
    where: { id },
  });

  revalidateHomepage();

  return {
    message: "Item deleted.",
    status: "success",
  };
}

type ParsedItemInput = {
  alt: string | null;
  categoryId: string | null;
  href: string | null;
  image: string | null;
  productId: string | null;
  sortOrder: number;
  subtitle: string | null;
  title: string | null;
  values: Record<string, string>;
};

function parseItemForm(formData: FormData): ParsedItemInput {
  const title = readNullableString(formData, "title");
  const subtitle = readNullableString(formData, "subtitle");
  const image = readNullableString(formData, "image");
  const alt = readNullableString(formData, "alt");
  const href = readNullableString(formData, "href");
  const productId = readNullableString(formData, "productId");
  const categoryId = readNullableString(formData, "categoryId");
  const sortOrderValue = readString(formData, "sortOrder");

  return {
    alt,
    categoryId,
    href,
    image,
    productId,
    sortOrder: parseSortOrder(sortOrderValue),
    subtitle,
    title,
    values: {
      alt: alt ?? "",
      categoryId: categoryId ?? "",
      href: href ?? "",
      image: image ?? "",
      productId: productId ?? "",
      sortOrder: sortOrderValue,
      subtitle: subtitle ?? "",
      title: title ?? "",
    },
  };
}

async function validateItem(
  sectionType: HomepageSectionType,
  input: ParsedItemInput,
) {
  if (!Number.isFinite(input.sortOrder)) {
    return "Sort order must be numeric.";
  }

  if (
    sectionType === HomepageSectionType.HERO ||
    sectionType === HomepageSectionType.FEATURE_STRIP ||
    sectionType === HomepageSectionType.CATEGORY_GROUP
  ) {
    if (!input.title) {
      return "Title is required.";
    }
  }

  if (sectionType === HomepageSectionType.HERO && !input.image) {
    return "Hero image is required.";
  }

  if (
    (sectionType === HomepageSectionType.NEW_ARRIVALS ||
      sectionType === HomepageSectionType.RECOMMENDED_PRODUCTS) &&
    !input.productId
  ) {
    return "Select a product.";
  }

  if (input.productId) {
    const product = await db.product.findUnique({
      where: { id: input.productId },
      select: { id: true },
    });

    if (!product) {
      return "Selected product no longer exists.";
    }
  }

  if (input.categoryId) {
    const category = await db.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      return "Selected category no longer exists.";
    }
  }

  return null;
}

function buildItemMetadata(
  sectionType: HomepageSectionType,
  formData: FormData,
) {
  if (sectionType === HomepageSectionType.FEATURE_STRIP) {
    const icon = readString(formData, "icon");

    return {
      icon: featureIcons.has(icon) ? icon : "check",
    };
  }

  if (sectionType === HomepageSectionType.CATEGORY_GROUP) {
    return {
      groupTitle: readString(formData, "groupTitle") || "Featured Categories",
      tone: readString(formData, "tone") || "from-zinc-950 to-zinc-600",
    };
  }

  return Prisma.JsonNull;
}

function parseHomepageSectionType(value: string) {
  if (value in HomepageSectionType) {
    return HomepageSectionType[value as keyof typeof HomepageSectionType];
  }

  return null;
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);

  return value || null;
}

function parseSortOrder(value: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function errorState(
  message: string,
  values?: HomepageActionState["values"],
): HomepageActionState {
  return {
    message,
    status: "error",
    values,
  };
}

function revalidateHomepage() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
