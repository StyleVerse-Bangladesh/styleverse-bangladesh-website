import {
  HomeProductCard,
  type HomeProductCardProduct,
} from "@/components/home/home-product-card";
import {
  defaultImagePlaceholders,
  getImageUrl,
  imageSizes,
} from "@/lib/constants/assets";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
};

function toHomeProduct(product: Product): HomeProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    image: getImageUrl(product.images[0], defaultImagePlaceholders.product),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    href: `/products/${product.slug}`,
  };
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-7 xs:gap-x-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-8">
      {products.map((product) => (
        <HomeProductCard
          key={product.id}
          product={toHomeProduct(product)}
          cartProduct={product}
          imageSizes={imageSizes.productCard}
        />
      ))}
    </div>
  );
}
