import type { Product } from "@/types/product";
import type { ListingFilters, ProductListingFacets } from "@/types/listing";
import { ProductGrid } from "./product-grid";
import { ProductFilterSidebar } from "./product-filter-sidebar";
import { ProductListingToolbar } from "./product-listing-toolbar";

export type ProductListingVariant = "default" | "desktop-filter-sidebar";

type ProductListingProps = {
  products: Product[];
  filters?: ListingFilters;
  facets?: ProductListingFacets;
  basePath?: string;
  variant?: ProductListingVariant;
};

export function ProductListing({
  products,
  filters,
  facets,
  basePath,
  variant = "default",
}: ProductListingProps) {
  const showDesktopSidebar =
    variant === "desktop-filter-sidebar" && filters && facets && basePath;

  return (
    <div className="min-w-0 overflow-hidden">
      <div
        className={
          showDesktopSidebar
            ? "md:grid md:grid-cols-[minmax(220px,240px)_minmax(0,1fr)] md:gap-6 lg:gap-7 xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-8"
            : undefined
        }
      >
        {showDesktopSidebar ? (
          <ProductFilterSidebar filters={filters} facets={facets} />
        ) : null}

        <div className="min-w-0">
          <ProductListingToolbar
            filters={filters}
            facets={facets}
            basePath={basePath}
            variant={variant}
          />
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-md border border-dashed p-5 text-sm leading-6 text-muted-foreground">
              No products match these filters. Try clearing a chip or choosing
              a different range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
