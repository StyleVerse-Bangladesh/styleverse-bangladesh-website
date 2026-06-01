import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type AccessoriesPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function AccessoriesPage({ searchParams }: AccessoriesPageProps) {
  return (
    <CategoryListingPage rootSlug="accessories" searchParams={searchParams} />
  );
}
