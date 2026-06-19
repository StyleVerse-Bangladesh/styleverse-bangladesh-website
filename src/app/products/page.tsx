import type { Metadata } from "next";
import { ListingPageShell } from "@/components/product/listing-page-shell";
import { ProductListing } from "@/components/product/product-listing";
import { getProductsListingData } from "@/data/catalog-access";
import type { ListingSearchParams } from "@/types/listing";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Shop all published StyleVerse Bangladesh products.",
  alternates: {
    canonical: "/products",
  },
};

type ProductsPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const listingData = await getProductsListingData({
    searchParams: await searchParams,
  });

  return (
    <ListingPageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Shop All" },
      ]}
    >
      <ProductListing
        products={listingData.products}
        filters={listingData.filters}
        facets={listingData.facets}
        basePath={listingData.basePath}
        variant="desktop-filter-sidebar"
      />
    </ListingPageShell>
  );
}
