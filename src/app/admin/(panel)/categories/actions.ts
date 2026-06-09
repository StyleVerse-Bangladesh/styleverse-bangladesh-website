"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type CategoryBooleanField =
  | "featureInBanner"
  | "featured"
  | "isActive"
  | "showInFilter"
  | "showInNav";

export type CategoryActionState = {
  message?: string;
  status?: "error" | "success";
  values?: {
    featured?: boolean;
    featureInBanner?: boolean;
    icon?: string;
    image?: string;
    isActive?: boolean;
    label?: string;
    parentId?: string;
    seoDescription?: string;
    seoTitle?: string;
    showInFilter?: boolean;
    showInNav?: boolean;
    slug?: string;
    sortOrder?: string;
  };
};

type CategoryMutationInput = {
  featured: boolean;
  featureInBanner: boolean;
  icon: string | null;
  image: string | null;
  isActive: boolean;
  label: string;
  parentId: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  showInFilter: boolean;
  showInNav: boolean;
  slug: string;
  sortOrder: number;
  submittedSlug: string;
};

type CategoryPathBase = {
  depth: number;
  path: string[];
  pathKey: string;
  rootSlug: string;
};

type CategoryTreeNode = {
  id: string;
  parentId: string | null;
  pathKey: string;
  slug: string;
};

export async function createCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const input = parseCategoryFormData(formData);

  if (!input.label) {
    return errorState("Label is required.", input);
  }

  if (!input.slug) {
    return errorState("Slug is required.", input);
  }

  const parent = await getParentCategory(input.parentId);

  if (input.parentId && !parent) {
    return errorState("Selected parent category no longer exists.", input);
  }

  const metadata = buildCategoryPath(input.slug, parent);
  const uniquenessError = await validateCategoryUniqueness({
    parentId: input.parentId,
    pathKey: metadata.pathKey,
    slug: input.slug,
  });

  if (uniquenessError) {
    return errorState(uniquenessError, input);
  }

  await db.category.create({
    data: {
      depth: metadata.depth,
      featureInBanner: input.featureInBanner,
      featured: input.featured,
      icon: input.icon,
      image: input.image,
      isActive: input.isActive,
      label: input.label,
      parentId: input.parentId,
      path: metadata.path,
      pathKey: metadata.pathKey,
      rootSlug: metadata.rootSlug,
      seoDescription: input.seoDescription,
      seoTitle: input.seoTitle,
      showInFilter: input.showInFilter,
      showInNav: input.showInNav,
      slug: input.slug,
      sortOrder: input.sortOrder,
    },
  });

  revalidateCategories();

  return {
    message: "Category created.",
    status: "success",
  };
}

export async function updateCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = readRequiredString(formData, "id");
  const input = parseCategoryFormData(formData);

  if (!id) {
    return errorState("Category id is required.", input);
  }

  if (!input.label) {
    return errorState("Label is required.", input);
  }

  if (!input.slug) {
    return errorState("Slug is required.", input);
  }

  const category = await db.category.findUnique({
    where: { id },
    select: {
      id: true,
      parentId: true,
      path: true,
    },
  });

  if (!category) {
    return errorState("Category no longer exists.", input);
  }

  if (input.parentId === id) {
    return errorState("A category cannot use itself as parent.", input);
  }

  const parent = await getParentCategory(input.parentId);

  if (input.parentId && !parent) {
    return errorState("Selected parent category no longer exists.", input);
  }

  if (parent && isPathPrefix(category.path, parent.path)) {
    return errorState("A category cannot be moved below its own child.", input);
  }

  const metadata = buildCategoryPath(input.slug, parent);
  const uniquenessError = await validateCategoryUniqueness({
    excludeId: id,
    parentId: input.parentId,
    pathKey: metadata.pathKey,
    slug: input.slug,
  });

  if (uniquenessError) {
    return errorState(uniquenessError, input);
  }

  const tree = await db.category.findMany({
    select: {
      id: true,
      parentId: true,
      pathKey: true,
      slug: true,
    },
  });
  const descendantUpdates = buildDescendantUpdates(tree, id, metadata);
  const descendantConflict = findDescendantPathConflict(
    tree,
    id,
    descendantUpdates,
    metadata.pathKey,
  );

  if (descendantConflict) {
    return errorState(descendantConflict, input);
  }

  await db.$transaction(async (tx) => {
    await tx.category.update({
      where: { id },
      data: {
        depth: metadata.depth,
        featureInBanner: input.featureInBanner,
        featured: input.featured,
        icon: input.icon,
        image: input.image,
        isActive: input.isActive,
        label: input.label,
        parentId: input.parentId,
        path: metadata.path,
        pathKey: metadata.pathKey,
        rootSlug: metadata.rootSlug,
        seoDescription: input.seoDescription,
        seoTitle: input.seoTitle,
        showInFilter: input.showInFilter,
        showInNav: input.showInNav,
        slug: input.slug,
        sortOrder: input.sortOrder,
      },
    });

    await updateDescendantCategories(tx, descendantUpdates);
  });

  revalidateCategories();

  return {
    message: "Category updated.",
    status: "success",
  };
}

export async function deleteCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return {
      message: "Category id is required.",
      status: "error",
    };
  }

  const category = await db.category.findUnique({
    where: { id },
    select: {
      label: true,
    },
  });

  if (!category) {
    return {
      message: "Category no longer exists.",
      status: "error",
    };
  }

  const [childCount, productCategoryCount, primaryProductCount] =
    await Promise.all([
      db.category.count({ where: { parentId: id } }),
      db.productCategory.count({ where: { categoryId: id } }),
      db.product.count({ where: { primaryCategoryId: id } }),
    ]);

  if (childCount > 0) {
    return {
      message: "Delete child categories before deleting this category.",
      status: "error",
    };
  }

  if (productCategoryCount + primaryProductCount > 0) {
    return {
      message: "Remove assigned products before deleting this category.",
      status: "error",
    };
  }

  await db.category.delete({
    where: { id },
  });

  revalidateCategories();

  return {
    message: `${category.label} deleted.`,
    status: "success",
  };
}

function parseCategoryFormData(formData: FormData): CategoryMutationInput {
  const label = readRequiredString(formData, "label");
  const submittedSlug = readRequiredString(formData, "slug");
  const slug = slugifyCategory(submittedSlug || label);
  const parentId = readOptionalString(formData, "parentId");
  const sortOrder = parseSortOrder(readRequiredString(formData, "sortOrder"));

  return {
    featureInBanner: readBoolean(formData, "featureInBanner"),
    featured: readBoolean(formData, "featured"),
    icon: readNullableText(formData, "icon"),
    image: readNullableText(formData, "image"),
    isActive: readBoolean(formData, "isActive"),
    label,
    parentId,
    seoDescription: readNullableText(formData, "seoDescription"),
    seoTitle: readNullableText(formData, "seoTitle"),
    showInFilter: readBoolean(formData, "showInFilter"),
    showInNav: readBoolean(formData, "showInNav"),
    slug,
    sortOrder,
    submittedSlug,
  };
}

function readRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);

  return value || null;
}

function readNullableText(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);

  return value || null;
}

function readBoolean(formData: FormData, key: CategoryBooleanField) {
  return formData.get(key) === "on";
}

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getParentCategory(parentId: string | null) {
  if (!parentId) {
    return null;
  }

  return db.category.findUnique({
    where: { id: parentId },
    select: {
      depth: true,
      id: true,
      path: true,
      rootSlug: true,
    },
  });
}

function buildCategoryPath(
  slug: string,
  parent: Awaited<ReturnType<typeof getParentCategory>>,
): CategoryPathBase {
  if (!parent) {
    const path = [slug];

    return {
      depth: 0,
      path,
      pathKey: path.join("/"),
      rootSlug: slug,
    };
  }

  const path = [...parent.path, slug];

  return {
    depth: parent.depth + 1,
    path,
    pathKey: path.join("/"),
    rootSlug: parent.rootSlug,
  };
}

async function validateCategoryUniqueness({
  excludeId,
  parentId,
  pathKey,
  slug,
}: {
  excludeId?: string;
  parentId: string | null;
  pathKey: string;
  slug: string;
}) {
  const sibling = await db.category.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      parentId,
      slug,
    },
    select: { id: true },
  });

  if (sibling) {
    return "Another category with this parent and slug already exists.";
  }

  const pathMatch = await db.category.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      pathKey,
    },
    select: { id: true },
  });

  if (pathMatch) {
    return "Another category with this generated path already exists.";
  }

  return null;
}

function isPathPrefix(prefix: string[], path: string[]) {
  return prefix.length > 0 && prefix.every((item, index) => path[index] === item);
}

function buildDescendantUpdates(
  categories: CategoryTreeNode[],
  categoryId: string,
  categoryMetadata: CategoryPathBase,
) {
  const childrenByParentId = new Map<string, CategoryTreeNode[]>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    const siblings = childrenByParentId.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParentId.set(category.parentId, siblings);
  }

  const updates: Array<CategoryPathBase & { id: string }> = [];
  const seen = new Set<string>([categoryId]);

  function visit(parentId: string, parentMetadata: CategoryPathBase) {
    const children = childrenByParentId.get(parentId) ?? [];

    for (const child of children) {
      if (seen.has(child.id)) {
        continue;
      }

      seen.add(child.id);

      const path = [...parentMetadata.path, child.slug];
      const metadata = {
        depth: parentMetadata.depth + 1,
        id: child.id,
        path,
        pathKey: path.join("/"),
        rootSlug: parentMetadata.rootSlug,
      };

      updates.push(metadata);
      visit(child.id, metadata);
    }
  }

  visit(categoryId, categoryMetadata);

  return updates;
}

function findDescendantPathConflict(
  categories: CategoryTreeNode[],
  categoryId: string,
  descendantUpdates: Array<CategoryPathBase & { id: string }>,
  categoryPathKey: string,
) {
  const movedIds = new Set([categoryId, ...descendantUpdates.map((item) => item.id)]);
  const futurePathKeys = new Set([categoryPathKey]);

  for (const update of descendantUpdates) {
    if (futurePathKeys.has(update.pathKey)) {
      return "Generated descendant paths must be unique.";
    }

    futurePathKeys.add(update.pathKey);
  }

  for (const category of categories) {
    if (!movedIds.has(category.id) && futurePathKeys.has(category.pathKey)) {
      return "A descendant category would conflict with an existing path.";
    }
  }

  return null;
}

async function updateDescendantCategories(
  tx: Prisma.TransactionClient,
  descendantUpdates: Array<CategoryPathBase & { id: string }>,
) {
  for (const update of descendantUpdates) {
    await tx.category.update({
      where: { id: update.id },
      data: {
        depth: update.depth,
        path: update.path,
        pathKey: update.pathKey,
        rootSlug: update.rootSlug,
      },
    });
  }
}

function errorState(
  message: string,
  input: CategoryMutationInput,
): CategoryActionState {
  return {
    message,
    status: "error",
    values: {
      isActive: input.isActive,
      featureInBanner: input.featureInBanner,
      featured: input.featured,
      icon: input.icon ?? "",
      image: input.image ?? "",
      label: input.label,
      parentId: input.parentId ?? "",
      seoDescription: input.seoDescription ?? "",
      seoTitle: input.seoTitle ?? "",
      showInFilter: input.showInFilter,
      showInNav: input.showInNav,
      slug: input.submittedSlug || input.slug,
      sortOrder: String(input.sortOrder),
    },
  };
}

function revalidateCategories() {
  try {
    revalidatePath("/admin/categories");
    revalidatePath("/");
  } catch {
    // Keep direct test invocations from failing outside Next's request store.
  }
}
