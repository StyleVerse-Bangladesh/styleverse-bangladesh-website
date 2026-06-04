import {
  type Category,
} from "@/data/category-taxonomy";
import {
  getStorefrontCategories,
  getStorefrontCategoryByPath,
  getStorefrontCategoryTree,
} from "@/data/category-access";

export async function getRootCategories(): Promise<Category[]> {
  return getStorefrontCategoryTree();
}

export async function getAllCategories(): Promise<Category[]> {
  return getStorefrontCategories();
}

export async function getCategoryByPath(
  path: string[],
): Promise<Category | undefined> {
  return getStorefrontCategoryByPath(path);
}
