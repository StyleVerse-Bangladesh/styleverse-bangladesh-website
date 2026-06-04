import { Footer } from "@/components/layout/footer";
import { MobileAuthModal } from "@/components/auth/mobile-auth-modal";
import { MobileCartDrawer } from "@/components/cart/mobile-cart-drawer";
import { Header } from "@/components/navigation/header";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { MobileCategoryDrawer } from "@/components/navigation/mobile-category-drawer";
import { MobileSearchDropdown } from "@/components/search/mobile-search-dropdown";
import { MobileWishlistDrawer } from "@/components/wishlist/mobile-wishlist-drawer";
import type { StorefrontSettingsDto } from "@/types/api/settings.dto";

type SiteShellProps = {
  children: React.ReactNode;
  settings: StorefrontSettingsDto;
};

export function SiteShell({ children, settings }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <MobileCategoryDrawer />
      <MobileCartDrawer deliverySettings={settings.delivery} />
      <MobileWishlistDrawer />
      <MobileAuthModal />
      <MobileSearchDropdown />
      <MobileBottomNav />
    </div>
  );
}
