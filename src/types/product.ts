export type ProductColor = {
  name: string;
  value: string;
};

export type InventoryStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "pre_order";

export type ProductVariantPreorder = {
  enabled: boolean;
  shipsAt?: string;
  limit?: number;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  status?: InventoryStatus;
  lowStockThreshold?: number;
  preorder?: ProductVariantPreorder;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;
  department?:
    | "men"
    | "women"
    | "kids"
    | "sports"
    | "shoes"
    | "accessories"
    | "seasonal-fits";
  primaryCategoryId?: string;
  categoryIds?: string[];
  categoryPath?: string[];
  gender: "men" | "women" | "kids" | "unisex";
  price: number;
  compareAtPrice?: number;
  currency: "BDT";
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  isNew?: boolean;
  isDiscounted?: boolean;
};
