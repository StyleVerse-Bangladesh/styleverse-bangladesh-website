import type { Product } from "@/types/product";
import type { ListingFilters, ProductListingFacets } from "@/types/listing";
import { ProductGrid } from "./product-grid";
import { ProductListingToolbar } from "./product-listing-toolbar";

type ProductListingProps = {
  products: Product[];
  filters?: ListingFilters;
  facets?: ProductListingFacets;
  basePath?: string;
};

export function ProductListing({
  products,
  filters,
  facets,
  basePath,
}: ProductListingProps) {
  return (
    <div className="min-w-0 overflow-hidden">
      <ProductListingToolbar
        filters={filters}
        facets={facets}
        basePath={basePath}
      />
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="rounded-md border border-dashed p-5 text-sm leading-6 text-muted-foreground">
          No products match these filters. Try clearing a chip or choosing a
          different range.
        </div>
      )}
    </div>
  );
}
