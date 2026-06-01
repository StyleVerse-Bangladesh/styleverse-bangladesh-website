import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type MenPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function MenPage({ searchParams }: MenPageProps) {
  return <CategoryListingPage rootSlug="men" searchParams={searchParams} />;
}
