import type { Category } from "@/data/category-taxonomy";
import type { CategoryDto } from "@/types/api/category.dto";

export function mapCategoryDtoToCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    parentId: dto.parentId,
    label: dto.label,
    slug: dto.slug,
    path: [...dto.path],
    rootSlug: dto.rootSlug,
    depth: dto.depth,
    sortOrder: dto.sortOrder,
    isActive: dto.isActive,
    showInNav: dto.showInNav,
    showInFilter: dto.showInFilter,
    image: dto.image,
    icon: dto.icon,
    tone: dto.tone,
    featured: dto.featured,
    featureInBanner: dto.featureInBanner,
    seo: dto.seo ? { ...dto.seo } : undefined,
    children: dto.children?.map(mapCategoryDtoToCategory),
  };
}
