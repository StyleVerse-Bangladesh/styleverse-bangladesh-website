import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type KidsPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function KidsPage({ searchParams }: KidsPageProps) {
  return <CategoryListingPage rootSlug="kids" searchParams={searchParams} />;
}
