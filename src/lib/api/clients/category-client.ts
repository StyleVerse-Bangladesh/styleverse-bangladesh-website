import {
  getAllCategories as getStaticAllCategories,
  getCategoryByPath as getStaticCategoryByPath,
  getRootCategories as getStaticRootCategories,
  type Category,
} from "@/data/category-taxonomy";
import { mapCategoryDtoToCategory } from "@/lib/api/adapters/category-adapter";
import type { CategoryDto } from "@/types/api/category.dto";

function toCategoryDto(category: Category): CategoryDto {
  return {
    ...category,
    path: [...category.path],
    seo: category.seo ? { ...category.seo } : undefined,
    children: category.children?.map(toCategoryDto),
  };
}

export async function getRootCategories(): Promise<Category[]> {
  return getStaticRootCategories()
    .map(toCategoryDto)
    .map(mapCategoryDtoToCategory);
}

export async function getAllCategories(): Promise<Category[]> {
  return getStaticAllCategories()
    .map(toCategoryDto)
    .map(mapCategoryDtoToCategory);
}

export async function getCategoryByPath(
  path: string[],
): Promise<Category | undefined> {
  const category = getStaticCategoryByPath(path);

  return category ? mapCategoryDtoToCategory(toCategoryDto(category)) : undefined;
}
