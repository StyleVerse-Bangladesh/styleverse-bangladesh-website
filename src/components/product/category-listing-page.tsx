import { notFound } from "next/navigation";
import { getCategoryListingData } from "@/data/catalog";
import {
  getCategoryPathNodes,
  type RootCategorySlug,
} from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";
import type { BreadcrumbItem } from "@/components/shared/site-breadcrumb";
import { ListingPageShell } from "./listing-page-shell";
import { ProductListing } from "./product-listing";

type CategoryListingPageProps = {
  rootSlug: RootCategorySlug;
  slug?: string[];
  searchParams?: Promise<ListingSearchParams>;
};

export async function CategoryListingPage({
  rootSlug,
  slug = [],
  searchParams,
}: CategoryListingPageProps) {
  const listingData = getCategoryListingData({
    rootSlug,
    slug,
    searchParams: await searchParams,
  });

  if (!listingData) {
    notFound();
  }

  return (
    <ListingPageShell breadcrumbs={getCategoryBreadcrumbs(listingData.category)}>
      <ProductListing
        products={listingData.products}
        filters={listingData.filters}
        facets={listingData.facets}
        basePath={listingData.basePath}
      />
    </ListingPageShell>
  );
}

function getCategoryBreadcrumbs(
  category: NonNullable<
    ReturnType<typeof getCategoryListingData>
  >["category"],
): BreadcrumbItem[] {
  const pathNodes = getCategoryPathNodes(category);

  return [
    { label: "Home", href: "/" },
    ...pathNodes.map((item, index) => {
      const isCurrent = index === pathNodes.length - 1;

      return {
        label: item.label,
        href: isCurrent ? undefined : `/${item.path.join("/")}`,
      };
    }),
  ];
}
