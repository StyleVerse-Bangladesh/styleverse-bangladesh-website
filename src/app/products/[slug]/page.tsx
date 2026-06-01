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
import { getProductBySlug, products } from "@/data/catalog";
import { siteContainerClassName } from "@/lib/constants/layout";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

const categoryPathByKey: Record<string, string> = {
  accessories: "/accessories",
  kids: "/kids",
  men: "/men",
  "seasonal fits": "/seasonal-fits",
  "seasonal-fits": "/seasonal-fits",
  shoes: "/shoes",
  sports: "/sports",
  women: "/women",
};

function normalizeCategoryKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCategoryBreadcrumb(product: Product): BreadcrumbItem {
  // Later, product admin data can supply subcategoryLabel/subcategoryHref here.
  const genderKey = normalizeCategoryKey(product.gender);
  const categoryKey = normalizeCategoryKey(product.category);
  const href = categoryPathByKey[genderKey] ?? categoryPathByKey[categoryKey];

  return {
    label: product.category || "Products",
    href: href ?? "/products",
  };
}

function getProductBreadcrumbItems(product: Product): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    getCategoryBreadcrumb(product),
    { label: product.name },
  ];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteBreadcrumb items={getProductBreadcrumbItems(product)} />
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
