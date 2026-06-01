import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";

type SportsCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export function generateStaticParams() {
  return generateCategoryStaticParams("sports");
}

export default async function SportsCategoryPage({
  params,
  searchParams,
}: SportsCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="sports"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
