import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";

type SeasonalFitsCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export function generateStaticParams() {
  return generateCategoryStaticParams("seasonal-fits");
}

export default async function SeasonalFitsCategoryPage({
  params,
  searchParams,
}: SeasonalFitsCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="seasonal-fits"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
