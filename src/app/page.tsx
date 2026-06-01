import { HeroBanner } from "@/components/home/hero-banner";
import { FeatureStrip } from "@/components/home/feature-strip";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";
import { ProductYouMayLikeSection } from "@/components/home/product-you-may-like-section";
import { products } from "@/data/catalog";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <FeatureStrip />
      <CategoryShowcase />
      <NewArrivalsSection />
      <ProductYouMayLikeSection products={products} />
    </>
  );
}
