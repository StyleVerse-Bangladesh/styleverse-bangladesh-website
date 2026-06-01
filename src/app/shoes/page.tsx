import { CategoryListingPage } from "@/components/product/category-listing-page";
import type { ListingSearchParams } from "@/types/listing";

type ShoesPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default function ShoesPage({ searchParams }: ShoesPageProps) {
  return <CategoryListingPage rootSlug="shoes" searchParams={searchParams} />;
}
