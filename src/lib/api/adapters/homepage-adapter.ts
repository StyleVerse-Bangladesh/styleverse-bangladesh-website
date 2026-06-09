import type { CategoryGroup } from "@/components/home/category-group-card";
import type { HomeProductCardProduct } from "@/components/home/home-product-card";
import type { HomepageContentDto } from "@/types/api/homepage.dto";

export type HomepageHeroSlide = {
  id: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  href: string;
  category: string;
};

export type HomepageFeature = {
  id: string;
  title: string;
  icon: "check" | "truck" | "refresh" | "headphones";
};

export type HomepageContent = {
  heroSlides: HomepageHeroSlide[];
  categoryGroups: CategoryGroup[];
  newArrivals: HomeProductCardProduct[];
  recommendedProductIds: string[];
  featureStrip: HomepageFeature[];
  sections: {
    categoryGroups: HomepageSectionState;
    featureStrip: HomepageSectionState;
    hero: HomepageSectionState;
    newArrivals: HomepageSectionState;
    recommendedProducts: HomepageSectionState;
  };
};

export type HomepageSectionState = {
  enabled: boolean;
  subtitle?: string;
  title: string;
};

export function mapHomepageDtoToHomepageContent(
  dto: HomepageContentDto,
): HomepageContent {
  return {
    heroSlides: [...dto.heroSlides]
      .sort(sortBySortOrder)
      .map((slide) => ({
        id: slide.id,
        image: slide.image,
        width: slide.width,
        height: slide.height,
        alt: slide.alt,
        href: slide.href,
        category: slide.category,
      })),
    categoryGroups: [...dto.categoryGroups].sort(sortBySortOrder).map((group) => ({
      title: group.title,
      items: [...group.items]
        .sort(sortBySortOrder)
        .map((item) => ({
          label: item.label,
          href: item.href,
          image: item.image,
          tone: item.tone,
        })),
    })),
    newArrivals: [...dto.newArrivals]
      .sort(sortBySortOrder)
      .map((product) => ({
        id: product.id,
        wishlistId: product.wishlistId,
        name: product.name,
        image: product.image,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        href: product.href,
      })),
    recommendedProductIds: [...dto.recommendedProductIds],
    featureStrip: [...dto.featureStrip]
      .sort(sortBySortOrder)
      .map((feature) => ({
        id: feature.id,
        title: feature.title,
        icon: feature.icon,
      })),
    sections: {
      categoryGroups: sectionState("SHOP BY CATEGORY"),
      featureStrip: sectionState("Feature Strip"),
      hero: sectionState("Hero"),
      newArrivals: sectionState("New Arrival Products"),
      recommendedProducts: sectionState("Product You May Like"),
    },
  };
}

function sortBySortOrder(left: { sortOrder: number }, right: { sortOrder: number }) {
  return left.sortOrder - right.sortOrder;
}

function sectionState(title: string): HomepageSectionState {
  return {
    enabled: true,
    title,
  };
}
