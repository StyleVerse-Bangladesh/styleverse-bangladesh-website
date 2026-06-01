import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type SportsPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function SportsPage({ searchParams }: SportsPageProps) {
  return <CategoryListingPage rootSlug="sports" searchParams={searchParams} />;
}
