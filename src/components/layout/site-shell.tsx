import { Footer } from "@/components/layout/footer";
import { MobileAuthModal } from "@/components/auth/mobile-auth-modal";
import { DesktopFloatingCart } from "@/components/cart/desktop-floating-cart";
import { MobileCartDrawer } from "@/components/cart/mobile-cart-drawer";
import { Header } from "@/components/navigation/header";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { MobileCategoryDrawer } from "@/components/navigation/mobile-category-drawer";
import { MobileSearchDropdown } from "@/components/search/mobile-search-dropdown";
import { MobileWishlistDrawer } from "@/components/wishlist/mobile-wishlist-drawer";
import type { StorefrontSettingsDto } from "@/types/api/settings.dto";
import type { SearchProduct } from "@/lib/product-search";
import type { NavItem } from "@/types/navigation";

type SiteShellProps = {
  children: React.ReactNode;
  navigation?: NavItem[];
  searchProducts: SearchProduct[];
  settings: StorefrontSettingsDto;
};

export function SiteShell({
  children,
  navigation,
  searchProducts,
  settings,
}: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header
        navigation={navigation}
        searchProducts={searchProducts}
        settings={settings}
      />
      <main className="storefront-page-background flex-1">{children}</main>
      <Footer settings={settings} />
      <MobileCategoryDrawer navigation={navigation} />
      <DesktopFloatingCart deliverySettings={settings.delivery} />
      <MobileCartDrawer deliverySettings={settings.delivery} />
      <MobileWishlistDrawer />
      <MobileAuthModal />
      <MobileSearchDropdown products={searchProducts} />
      <MobileBottomNav navigation={navigation} />
    </div>
  );
}
