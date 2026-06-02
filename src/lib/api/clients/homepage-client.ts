import { mapHomepageDtoToHomepageContent } from "@/lib/api/adapters/homepage-adapter";
import { assets, type WebpAssetFile } from "@/lib/constants/assets";
import type { HomepageContent } from "@/lib/api/adapters/homepage-adapter";
import type { HomepageContentDto } from "@/types/api/homepage.dto";

const staticHomepageContentDto: HomepageContentDto = {
  heroSlides: [
    heroSlide("hero-banner-1", "hero-1.webp", 0),
    heroSlide("hero-banner-2", "hero-2.webp", 1),
    heroSlide("hero-banner-3", "hero-3.webp", 2),
    heroSlide("hero-banner-4", "hero-4.webp", 3),
    heroSlide("hero-banner-5", "hero-5.webp", 4),
  ],
  categoryGroups: [
    {
      id: "men-essentials",
      title: "Men Essentials",
      sortOrder: 0,
      items: [
        categoryItem("men-t-shirts", "T-Shirts", "/men/t-shirts", "from-zinc-950 to-zinc-600", 0),
        categoryItem("men-polo", "Polo", "/men/polo-t-shirts", "from-neutral-700 to-stone-300", 1),
        categoryItem("men-shirts", "Shirts", "/men/shirts", "from-slate-900 to-slate-500", 2),
        categoryItem("men-joggers", "Joggers", "/men/joggers", "from-stone-800 to-zinc-400", 3),
      ],
    },
    {
      id: "women-collection",
      title: "Women Collection",
      sortOrder: 1,
      items: [
        categoryItem("women-dresses", "Dresses", "/women", "from-zinc-900 to-rose-200", 0),
        categoryItem("women-tops", "Tops", "/women", "from-neutral-800 to-zinc-300", 1),
        categoryItem("women-co-ord", "Co-Ord Set", "/women", "from-stone-900 to-stone-300", 2),
        categoryItem("women-outerwear", "Outerwear", "/women", "from-slate-950 to-slate-400", 3),
      ],
    },
    {
      id: "kids",
      title: "Kids",
      sortOrder: 2,
      items: [
        categoryItem("kids-t-shirts", "T-Shirts", "/kids", "from-black to-zinc-500", 0),
        categoryItem("kids-sets", "Sets", "/kids", "from-zinc-900 to-neutral-300", 1),
        categoryItem("kids-shoes", "Shoes", "/kids", "from-slate-900 to-slate-400", 2),
        categoryItem("kids-accessories", "Accessories", "/kids", "from-stone-800 to-stone-300", 3),
      ],
    },
    {
      id: "accessories",
      title: "Accessories",
      sortOrder: 3,
      items: [
        categoryItem("accessories-bags", "Bags", "/accessories", "from-neutral-950 to-neutral-500", 0),
        categoryItem("accessories-caps", "Caps", "/accessories", "from-zinc-800 to-zinc-300", 1),
        categoryItem("accessories-belts", "Belts", "/accessories", "from-stone-950 to-stone-500", 2),
        categoryItem("accessories-sunglasses", "Sunglasses", "/accessories", "from-slate-900 to-zinc-300", 3),
      ],
    },
  ],
  newArrivals: [
    productCard("svb-001-black", "svb-001", "Half Sleeve Printed Casual Shirt For Men", "half-sleeve-printed-casual-shirt-black.webp", 990, 1490, "/products/structured-cotton-shirt", 0),
    productCard("svb-001-white", "svb-001", "Half Sleeve Printed Casual Shirt For Men", "half-sleeve-printed-casual-shirt-white.webp", 990, 1490, "/products/structured-cotton-shirt", 1),
    productCard("svb-002-black", "svb-002", "Premium Knitted Polo Shirt For Men", "premium-knitted-polo-shirt-black.webp", 1190, 1500, "/products/relaxed-linen-dress", 2),
    productCard("svb-004-cream", "svb-004", "Premium Knitted Polo Shirt For Men", "premium-knitted-polo-shirt-cream.webp", 1190, 1500, "/products/performance-knit-sneaker", 3),
    productCard("svb-003-olive", "svb-003", "Premium Knit Casual Polo", "premium-knit-casual-polo-olive.webp", 1190, 1500, "/products/kids-everyday-hoodie", 4),
    productCard("svb-001-sand", "svb-001", "Relaxed Everyday Fashion Shirt", "relaxed-everyday-fashion-shirt-sand.webp", 1290, 1690, "/products/structured-cotton-shirt", 5),
  ],
  recommendedProductIds: [],
  featureStrip: [
    { id: "premium-quality", title: "Premium Quality Products", icon: "check", sortOrder: 0 },
    { id: "fast-shipping", title: "Fastest Shipping Countrywide", icon: "truck", sortOrder: 1 },
    { id: "easy-exchange", title: "Easy Exchange Policy", icon: "refresh", sortOrder: 2 },
    { id: "online-support", title: "Online Support 24/7", icon: "headphones", sortOrder: 3 },
  ],
};

export async function getHomepageContent(): Promise<HomepageContent> {
  return mapHomepageDtoToHomepageContent(staticHomepageContentDto);
}

function heroSlide(id: string, image: WebpAssetFile, sortOrder: number) {
  const index = sortOrder + 1;

  return {
    id,
    image: assets.heroImage(image),
    width: 1920,
    height: 690,
    alt: `StyleVerse Bangladesh hero banner ${index}`,
    href: "#",
    category: `Hero Banner ${index}`,
    sortOrder,
  };
}

function categoryItem(
  id: string,
  label: string,
  href: string,
  tone: string,
  sortOrder: number,
) {
  return { id, label, href, tone, sortOrder };
}

function productCard(
  id: string,
  wishlistId: string,
  name: string,
  image: WebpAssetFile,
  price: number,
  compareAtPrice: number,
  href: string,
  sortOrder: number,
) {
  return {
    id,
    wishlistId,
    name,
    image: assets.productImage(image),
    price,
    compareAtPrice,
    href,
    sortOrder,
  };
}
