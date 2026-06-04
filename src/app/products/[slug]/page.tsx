import { notFound } from "next/navigation";
import { Price } from "@/components/product/price";
import { ProductGallery } from "@/components/product/product-gallery";
import { MobileProductGallery } from "@/components/product/mobile-product-gallery";
import { MobileProductPurchasePanel } from "@/components/product/mobile-product-purchase-panel";
import { ProductInfoAccordion } from "@/components/product/product-info-accordion";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductRecommendations } from "@/components/product/product-recommendations";
import {
  SiteBreadcrumb,
  type BreadcrumbItem,
} from "@/components/shared/site-breadcrumb";
import {
  getCategoryPathNodesFromCatalog,
  getProductPrimaryCategoryFromCatalog,
} from "@/data/catalog";
import {
  buildCategoryHref,
} from "@/data/category-taxonomy";
import {
  getStorefrontProductBySlug,
  getStorefrontProducts,
  getStorefrontProductStaticParams,
} from "@/data/catalog-access";
import { getStorefrontCategories } from "@/data/category-access";
import { siteContainerClassName } from "@/lib/constants/layout";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getStorefrontProductStaticParams();
}

function getProductBreadcrumbItems(
  product: Product,
  categories: Awaited<ReturnType<typeof getStorefrontCategories>>,
): BreadcrumbItem[] {
  const category = getProductPrimaryCategoryFromCatalog(product, categories);
  const categoryItems = category
    ? getCategoryPathNodesFromCatalog(category, categories).map((item) => ({
        label: item.label,
        href: buildCategoryHref(item),
      }))
    : [{ label: "Products", href: "/products" }];

  return [
    { label: "Home", href: "/" },
    ...categoryItems,
    { label: product.name },
  ];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products, categories] = await Promise.all([
    getStorefrontProductBySlug(slug),
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteBreadcrumb items={getProductBreadcrumbItems(product, categories)} />
      <section className="bg-white pb-8 md:hidden">
        <MobileProductGallery
          images={product.images}
          productName={product.name}
        />
        <MobileProductPurchasePanel product={product} />
        <div className={siteContainerClassName}>
          <ProductInfoAccordion product={product} />
        </div>
        <ProductRecommendations currentProduct={product} products={products} />
      </section>

      <section
        className={`${siteContainerClassName} hidden gap-8 py-10 md:grid lg:grid-cols-2`}
      >
        <ProductGallery
          images={product.images}
          productName={product.name}
          priorityFirstImage
        />
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <Price
              className="mt-4"
              price={product.price}
              compareAtPrice={product.compareAtPrice}
            />
          </div>
          <ProductPurchasePanel product={product} />
        </div>
      </section>
    </>
  );
}
