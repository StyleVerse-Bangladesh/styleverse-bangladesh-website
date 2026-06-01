export type ProductColor = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
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
