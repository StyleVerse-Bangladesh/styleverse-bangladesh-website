"use client";

import { useMemo, useState } from "react";
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

type ProductYouMayLikeSectionProps = {
  products: Product[];
  title?: string;
};

const productsPerPage = 10;

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

export function ProductYouMayLikeSection({
  products,
  title = "Product You May Like",
}: ProductYouMayLikeSectionProps) {
  const [visibleCount, setVisibleCount] = useState(productsPerPage);
  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const hasMoreProducts = visibleCount < products.length;

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white pb-10 pt-0 sm:pb-14 sm:pt-2" aria-label="Product you may like">
      <div className={siteContainerClassName}>
        <div className="relative border-b border-black/10 pb-2.5 text-center sm:pb-5">
          <HomeSectionHeading>{title}</HomeSectionHeading>
          <span className="mx-auto mt-2 block h-px w-32 bg-black/35 sm:mt-4 sm:h-0.5 sm:w-56 sm:bg-black" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {visibleProducts.map((product) => (
            <HomeProductCard
              key={product.id}
              product={toHomeProduct(product)}
              cartProduct={product}
              imageSizes={imageSizes.productCard}
            />
          ))}
        </div>

        {hasMoreProducts ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white shadow-lg shadow-black/15 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-xl hover:shadow-black/20 active:translate-y-0 active:scale-[0.99] sm:w-auto"
              onClick={() =>
                setVisibleCount((current) =>
                  Math.min(current + productsPerPage, products.length),
                )
              }
            >
              View More
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
