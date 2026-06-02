import type {
  InventoryStatus,
  Product,
  ProductColor,
  ProductVariantPreorder,
} from "@/types/product";

export type ProductColorDto = ProductColor;

export type ProductVariantPreorderDto = ProductVariantPreorder;

export type ProductVariantDto = {
  id: string;
  size: string;
  color: string;
  stock: number;
  status?: InventoryStatus;
  lowStockThreshold?: number;
  preorder?: ProductVariantPreorderDto;
};

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;
  department?: Product["department"];
  primaryCategoryId?: string;
  categoryIds?: string[];
  categoryPath?: string[];
  gender: Product["gender"];
  price: number;
  compareAtPrice?: number;
  currency: Product["currency"];
  images: string[];
  colors: ProductColorDto[];
  sizes: string[];
  variants: ProductVariantDto[];
  isNew?: boolean;
  isDiscounted?: boolean;
};
