import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-access";
import type { ListingSearchParams } from "@/types/listing";

type ShoesCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export async function generateStaticParams() {
  return generateCategoryStaticParams("shoes");
}

export default async function ShoesCategoryPage({
  params,
  searchParams,
}: ShoesCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="shoes"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
