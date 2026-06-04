import { HeroBanner } from "@/components/home/hero-banner";
import { FeatureStrip } from "@/components/home/feature-strip";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";
import { ProductYouMayLikeSection } from "@/components/home/product-you-may-like-section";
import { getStorefrontProducts } from "@/data/catalog-access";
import { getHomepageContent } from "@/lib/api/clients/homepage-client";

export default async function HomePage() {
  const [products, homepage] = await Promise.all([
    getStorefrontProducts(),
    getHomepageContent(),
  ]);
  const recommendedProducts = homepage.recommendedProductIds.length
    ? products.filter((product) => homepage.recommendedProductIds.includes(product.id))
    : products;

  return (
    <>
      {homepage.sections.hero.enabled ? (
        <HeroBanner slides={homepage.heroSlides} />
      ) : null}
      {homepage.sections.featureStrip.enabled ? (
        <FeatureStrip items={homepage.featureStrip} />
      ) : null}
      {homepage.sections.categoryGroups.enabled ? (
        <CategoryShowcase
          groups={homepage.categoryGroups}
          title={homepage.sections.categoryGroups.title}
        />
      ) : null}
      {homepage.sections.newArrivals.enabled ? (
        <NewArrivalsSection
          cartProducts={products}
          products={homepage.newArrivals}
          title={homepage.sections.newArrivals.title}
        />
      ) : null}
      {homepage.sections.recommendedProducts.enabled ? (
        <ProductYouMayLikeSection
          products={recommendedProducts}
          title={homepage.sections.recommendedProducts.title}
        />
      ) : null}
    </>
  );
}
