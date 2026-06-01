import { ListingPageShell } from "@/components/product/listing-page-shell";
import { ProductListing } from "@/components/product/product-listing";
import { getProductsListingData } from "@/data/catalog";
import type { ListingSearchParams } from "@/types/listing";

type ProductsPageProps = {
  searchParams?: Promise<ListingSearchParams>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const listingData = getProductsListingData({
    searchParams: await searchParams,
  });

  return (
    <ListingPageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Products" },
      ]}
    >
      <ProductListing
        products={listingData.products}
        filters={listingData.filters}
        facets={listingData.facets}
        basePath={listingData.basePath}
      />
    </ListingPageShell>
  );
}
