import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-access";
import type { ListingSearchParams } from "@/types/listing";

type MenCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export async function generateStaticParams() {
  return generateCategoryStaticParams("men");
}

export default async function MenCategoryPage({
  params,
  searchParams,
}: MenCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="men"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
