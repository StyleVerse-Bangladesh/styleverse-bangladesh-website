export type HomepageHeroSlideDto = {
  id: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  href: string;
  category: string;
  sortOrder: number;
};

export type HomepageCategoryGroupDto = {
  id: string;
  title: string;
  sortOrder: number;
  items: Array<{
    id: string;
    label: string;
    href: string;
    image?: string;
    tone: string;
    sortOrder: number;
  }>;
};

export type HomepageProductCardDto = {
  id: string;
  wishlistId?: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  href: string;
  sortOrder: number;
};

export type HomepageFeatureDto = {
  id: string;
  title: string;
  icon: "check" | "truck" | "refresh" | "headphones";
  sortOrder: number;
};

export type HomepageContentDto = {
  heroSlides: HomepageHeroSlideDto[];
  categoryGroups: HomepageCategoryGroupDto[];
  newArrivals: HomepageProductCardDto[];
  recommendedProductIds: string[];
  featureStrip: HomepageFeatureDto[];
};
