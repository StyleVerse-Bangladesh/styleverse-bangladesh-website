import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type SeasonalFitsPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function SeasonalFitsPage({
  searchParams,
}: SeasonalFitsPageProps) {
  return (
    <CategoryListingPage rootSlug="seasonal-fits" searchParams={searchParams} />
  );
}
