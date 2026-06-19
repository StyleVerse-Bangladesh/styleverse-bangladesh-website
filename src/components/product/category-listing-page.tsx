import { notFound } from "next/navigation";
import {
  getCategoryListingData,
} from "@/data/catalog-access";
import { getStorefrontCategories } from "@/data/category-access";
import { getCategoryPathNodesFromCatalog } from "@/data/catalog";
import {
  type RootCategorySlug,
} from "@/data/category-taxonomy";
import type { ListingSearchParams } from "@/types/listing";
import type { BreadcrumbItem } from "@/components/shared/site-breadcrumb";
import { ListingPageShell } from "./listing-page-shell";
import {
  ProductListing,
  type ProductListingVariant,
} from "./product-listing";

type CategoryListingPageProps = {
  rootSlug: RootCategorySlug;
  slug?: string[];
  searchParams?: Promise<ListingSearchParams>;
  listingVariant?: ProductListingVariant;
};

export async function CategoryListingPage({
  rootSlug,
  slug = [],
  searchParams,
  listingVariant = "desktop-filter-sidebar",
}: CategoryListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const [listingData, categories] = await Promise.all([
    getCategoryListingData({
      rootSlug,
      slug,
      searchParams: resolvedSearchParams,
    }),
    getStorefrontCategories(),
  ]);

  if (!listingData) {
    notFound();
  }

  return (
    <ListingPageShell
      breadcrumbs={getCategoryBreadcrumbs(listingData.category, categories)}
    >
      <ProductListing
        products={listingData.products}
        filters={listingData.filters}
        facets={listingData.facets}
        basePath={listingData.basePath}
        variant={listingVariant}
      />
    </ListingPageShell>
  );
}

function getCategoryBreadcrumbs(
  category: NonNullable<
    Awaited<ReturnType<typeof getCategoryListingData>>
  >["category"],
  categories: Awaited<ReturnType<typeof getStorefrontCategories>>,
): BreadcrumbItem[] {
  const pathNodes = getCategoryPathNodesFromCatalog(category, categories);

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
