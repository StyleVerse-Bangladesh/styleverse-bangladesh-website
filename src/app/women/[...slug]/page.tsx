import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";

type WomenCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export function generateStaticParams() {
  return generateCategoryStaticParams("women");
}

export default async function WomenCategoryPage({
  params,
  searchParams,
}: WomenCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="women"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
