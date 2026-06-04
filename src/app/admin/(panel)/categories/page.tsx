import {
  CategoryAdminPage,
  type CategoryAdminItem,
} from "@/app/admin/(panel)/categories/category-admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Categories",
};

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    select: {
      _count: {
        select: {
          children: true,
          primaryProducts: true,
          productCategories: true,
        },
      },
      depth: true,
      id: true,
      isActive: true,
      label: true,
      parent: {
        select: {
          label: true,
        },
      },
      parentId: true,
      path: true,
      pathKey: true,
      rootSlug: true,
      seoDescription: true,
      seoTitle: true,
      showInFilter: true,
      showInNav: true,
      slug: true,
      sortOrder: true,
    },
  });

  const items = categories
    .map<CategoryAdminItem>((category) => ({
      childCount: category._count.children,
      depth: category.depth,
      id: category.id,
      isActive: category.isActive,
      label: category.label,
      parentId: category.parentId,
      parentLabel: category.parent?.label ?? null,
      path: category.path,
      pathKey: category.pathKey,
      productAssignmentCount:
        category._count.primaryProducts + category._count.productCategories,
      rootSlug: category.rootSlug,
      seoDescription: category.seoDescription,
      seoTitle: category.seoTitle,
      showInFilter: category.showInFilter,
      showInNav: category.showInNav,
      slug: category.slug,
      sortOrder: category.sortOrder,
    }))
    .sort((left, right) => {
      const pathCompare = left.pathKey.localeCompare(right.pathKey);

      if (pathCompare !== 0) {
        return pathCompare;
      }

      return left.sortOrder - right.sortOrder;
    });

  return <CategoryAdminPage categories={items} />;
}
