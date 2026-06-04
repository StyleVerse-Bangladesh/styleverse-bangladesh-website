import { CategoryListingPage } from "@/components/product/category-listing-page";
import { generateCategoryStaticParams } from "@/data/category-access";
import type { ListingSearchParams } from "@/types/listing";

type AccessoriesCategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<ListingSearchParams>;
};

export async function generateStaticParams() {
  return generateCategoryStaticParams("accessories");
}

export default async function AccessoriesCategoryPage({
  params,
  searchParams,
}: AccessoriesCategoryPageProps) {
  const { slug } = await params;

  return (
    <CategoryListingPage
      rootSlug="accessories"
      slug={slug}
      searchParams={searchParams}
    />
  );
}
