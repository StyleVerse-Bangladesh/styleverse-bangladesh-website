import {
  getStorefrontProductBySlug,
  getStorefrontProducts,
} from "@/data/catalog-access";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  return getStorefrontProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return getStorefrontProductBySlug(slug);
}
