import type { ProductDto } from "@/types/api/product.dto";
import type { Product } from "@/types/product";

export function mapProductDtoToProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    category: dto.category,
    categorySlug: dto.categorySlug,
    subcategory: dto.subcategory,
    subcategorySlug: dto.subcategorySlug,
    department: dto.department,
    primaryCategoryId: dto.primaryCategoryId,
    categoryIds: dto.categoryIds ? [...dto.categoryIds] : undefined,
    categoryPath: dto.categoryPath ? [...dto.categoryPath] : undefined,
    gender: dto.gender,
    price: dto.price,
    compareAtPrice: dto.compareAtPrice,
    currency: dto.currency,
    images: [...dto.images],
    colors: dto.colors.map((color) => ({ ...color })),
    sizes: [...dto.sizes],
    variants: dto.variants.map((variant) => ({
      ...variant,
      preorder: variant.preorder ? { ...variant.preorder } : undefined,
    })),
    isNew: dto.isNew,
    isDiscounted: dto.isDiscounted,
  };
}
