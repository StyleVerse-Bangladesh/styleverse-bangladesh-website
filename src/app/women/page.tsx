import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type WomenPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function WomenPage({ searchParams }: WomenPageProps) {
  return <CategoryListingPage rootSlug="women" searchParams={searchParams} />;
}
