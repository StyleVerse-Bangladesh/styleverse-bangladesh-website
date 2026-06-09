import Image from "next/image";
import { ImageOff, ShoppingBag } from "lucide-react";
import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import type { TopSellingProduct } from "@/app/admin/(panel)/dashboard-data";

export function TopSellingProductsCard({
  products,
}: {
  products: TopSellingProduct[];
}) {
  return (
    <DashboardCard actionHref="/admin/products" actionLabel="View All" title="Top Selling Products">
      {products.length ? (
        <div className="grid gap-3">
          {products.map((product) => (
            <article
              className="grid gap-3 rounded-md border border-zinc-200 bg-white p-3 sm:grid-cols-[4.5rem_minmax(0,1fr)]"
              key={product.id}
            >
              <ProductThumb product={product} />
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-black text-zinc-950">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                      {product.description || "No description stored."}
                    </p>
                  </div>
                  <span className="inline-flex h-7 shrink-0 items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-black text-emerald-700">
                    {product.salesCount} sold
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-zinc-950">
                    {formatMoney(product.price, product.currency)}
                  </p>
                  {product.compareAtPrice ? (
                    <p className="text-xs font-semibold text-zinc-400 line-through">
                      {formatMoney(product.compareAtPrice, product.currency)}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-zinc-500">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-black text-zinc-950">
            No product sales yet
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Products will appear here after orders are recorded.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}

function ProductThumb({ product }: { product: TopSellingProduct }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-zinc-400 sm:h-[4.5rem] sm:w-[4.5rem]">
      {product.imageUrl ? (
        <Image
          alt={product.imageAlt}
          className="h-full w-full object-cover"
          height={80}
          src={product.imageUrl}
          unoptimized
          width={80}
        />
      ) : (
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
