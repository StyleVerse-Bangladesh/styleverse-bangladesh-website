import {
  HomeProductCard,
  type HomeProductCardProduct,
} from "@/components/home/home-product-card";
import { HomeSectionHeading } from "@/components/home/home-section-heading";
import {
  defaultImagePlaceholders,
  getImageUrl,
  imageSizes,
} from "@/lib/constants/assets";
import { siteContainerClassName } from "@/lib/constants/layout";
import type { Product } from "@/types/product";

type ProductRecommendationsProps = {
  currentProduct: Product;
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

export function ProductRecommendations({
  currentProduct,
  products,
}: ProductRecommendationsProps) {
  const remainingProducts = products.filter(
    (product) => product.id !== currentProduct.id,
  );
  const naturalRelated = remainingProducts.filter(
    (product) =>
      product.category === currentProduct.category ||
      product.gender === currentProduct.gender,
  );
  const relatedProducts = (naturalRelated.length ? naturalRelated : remainingProducts)
    .slice(0, 4);
  const relatedIds = new Set(relatedProducts.map((product) => product.id));
  const youMayAlsoLike =
    remainingProducts.filter((product) => !relatedIds.has(product.id)).slice(0, 4);
  const fallbackYouMayAlsoLike = youMayAlsoLike.length
    ? youMayAlsoLike
    : remainingProducts.slice(0, 4);

  if (!remainingProducts.length) {
    return null;
  }

  return (
    <div className="space-y-9 bg-white pb-10">
      <RecommendationSection title="Related Products" products={relatedProducts} />
      <RecommendationSection
        title="You May Also Like"
        products={fallbackYouMayAlsoLike}
      />
    </div>
  );
}

function RecommendationSection({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className={siteContainerClassName} aria-label={title}>
      <div className="relative border-b border-black/10 pb-2.5 text-center">
        <HomeSectionHeading>{title}</HomeSectionHeading>
        <span className="mx-auto mt-2 block h-px w-32 bg-black/35" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {products.map((product) => (
          <HomeProductCard
            key={product.id}
            product={toHomeProduct(product)}
            cartProduct={product}
            imageSizes={imageSizes.productCard}
          />
        ))}
      </div>
    </section>
  );
}
