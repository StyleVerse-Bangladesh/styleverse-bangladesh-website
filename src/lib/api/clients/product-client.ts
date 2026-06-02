import { products as staticProducts } from "@/data/catalog";
import { mapProductDtoToProduct } from "@/lib/api/adapters/product-adapter";
import type { ProductDto } from "@/types/api/product.dto";
import type { Product } from "@/types/product";

const staticProductDtos = staticProducts as ProductDto[];

export async function getProducts(): Promise<Product[]> {
  return staticProductDtos.map(mapProductDtoToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const productDto = staticProductDtos.find((product) => product.slug === slug);

  return productDto ? mapProductDtoToProduct(productDto) : undefined;
}
