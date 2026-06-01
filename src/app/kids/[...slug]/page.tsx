import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";

type KidsCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export function generateStaticParams() {
  return generateCategoryStaticParams("kids");
}

export default async function KidsCategoryPage({
  params,
  searchParams,
}: KidsCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="kids"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
