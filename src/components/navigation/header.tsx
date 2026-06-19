"use client";

import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookmarkCheck,
  Heart,
  Menu,
  UserRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CompactDesktopSearch } from "@/components/search/desktop-product-search";
import { HomeDesktopSearch } from "@/components/search/home-desktop-search";
import { getNavigationItems } from "@/lib/constants/navigation";
import { siteContainerClassName } from "@/lib/constants/layout";
import type { SearchProduct } from "@/lib/product-search";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { StorefrontSettingsDto } from "@/types/api/settings.dto";
import type { NavItem } from "@/types/navigation";
import { MegaMenuShell } from "./mega-menu-shell";

const megaMenuCloseDelay = 250;

const categoryHeaderNavigationItems: NavItem[] = [
  { label: "MEN", href: "/men", menuKey: "men" },
  { label: "WOMEN", href: "/women", menuKey: "women" },
  { label: "KIDS", href: "/kids", menuKey: "kids" },
  { label: "SEASONAL FITS", href: "/seasonal-fits", menuKey: "seasonal-fits" },
  { label: "SPORTS", href: "/sports", menuKey: "sports" },
  { label: "SHOES", href: "/shoes", menuKey: "shoes" },
  { label: "ACCESSORIES", href: "/accessories", menuKey: "accessories" },
];

export function Header({
  navigation,
  searchProducts,
  settings,
}: {
  navigation?: NavItem[];
  searchProducts: SearchProduct[];
  settings: StorefrontSettingsDto;
}) {
  const pathname = usePathname();
  const navigationItems = getNavigationItems(navigation);
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const activeMegaMenu = useUiStore((state) => state.activeMegaMenu);
  const setActiveMegaMenu = useUiStore((state) => state.setActiveMegaMenu);
  const setMobileCategoryDrawerOpen = useUiStore(
    (state) => state.setMobileCategoryDrawerOpen,
  );
  const isMobileWishlistDrawerOpen = useUiStore(
    (state) => state.isMobileWishlistDrawerOpen,
  );
  const setMobileWishlistDrawerOpen = useUiStore(
    (state) => state.setMobileWishlistDrawerOpen,
  );
  const setAuthModalOpen = useUiStore((state) => state.setMobileAuthModalOpen);
  const firstPathSegment = pathname.split("/").filter(Boolean)[0] ?? null;
  const activeCategorySegment =
    categoryHeaderNavigationItems.find(
      (item) => item.menuKey === firstPathSegment,
    )?.menuKey ?? null;
  const useCategoryHeader =
    pathname === "/products" || Boolean(activeCategorySegment);
  const headerVariant =
    pathname === "/" ? "home" : useCategoryHeader ? "category" : "default";
  const showCompactDesktopSearch = !pathname.startsWith("/admin");
  const fixedCategoryNavigationItems = categoryHeaderNavigationItems.map((item) => {
    const navigationItem = navigationItems.find(
      (candidate) => candidate.menuKey === item.menuKey,
    );

    return navigationItem?.children?.length
      ? { ...item, children: navigationItem.children }
      : item;
  });
  const closeTimerRef = useRef<number | null>(null);

  function clearMegaMenuCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function closeMegaMenu() {
    clearMegaMenuCloseTimer();
    setActiveMegaMenu(null);
  }

  function scheduleMegaMenuClose() {
    clearMegaMenuCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMegaMenu(null);
      closeTimerRef.current = null;
    }, megaMenuCloseDelay);
  }

  function openMegaMenu(menuKey: string | null | undefined) {
    clearMegaMenuCloseTimer();
    setActiveMegaMenu(menuKey ?? null);
  }

  function closeMegaMenuOnEmptyArea(event: ReactMouseEvent<HTMLElement>) {
    if (event.target === event.currentTarget) {
      closeMegaMenu();
    }
  }

  useEffect(() => {
    return () => clearMegaMenuCloseTimer();
  }, []);

  if (headerVariant === "home") {
    return (
      <header
        className="sticky top-0 z-40 border-b border-black/5 bg-white/75 shadow-sm backdrop-blur-xl md:border-b md:bg-background md:shadow-none md:backdrop-blur-none"
        onMouseLeave={closeMegaMenu}
      >
        <div className="bg-white/70 backdrop-blur-xl md:bg-[#f1f2f3] md:backdrop-blur-none" onMouseEnter={closeMegaMenu}>
          <div
            className={cn(
              siteContainerClassName,
              "grid min-h-[56px] grid-cols-[3rem_minmax(0,1fr)_3rem] items-center py-2 md:min-h-[72px] md:grid-cols-[1fr_minmax(320px,520px)_1fr] md:gap-3 md:py-3",
            )}
          >
            <div className="flex items-center justify-start md:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileCategoryDrawerOpen(true)}
                aria-label="Open menu"
                aria-controls="mobile-category-drawer"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <StyleVerseLogo
                alt={settings.storeName}
                className="hidden md:block"
                src={settings.logo.header}
              />
            </div>

            <StyleVerseLogo
              alt={settings.storeName}
              className="justify-self-center md:hidden"
              src={settings.logo.header}
            />

            <HomeDesktopSearch products={searchProducts} />

            <div className="flex items-center justify-end md:gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileWishlistDrawerOpen(true)}
                aria-label="Wishlist"
                aria-expanded={isMobileWishlistDrawerOpen}
                aria-controls="mobile-wishlist-drawer"
              >
                <span className="relative">
                  <BookmarkCheck className="h-5 w-5 text-black" />
                  <WishlistCountBadge count={wishlistCount} />
                </span>
              </Button>
              <DesktopHeaderActions
                wishlistCount={wishlistCount}
                wishlistOpen={isMobileWishlistDrawerOpen}
                onWishlistOpen={() => setMobileWishlistDrawerOpen(true)}
                onProfileOpen={() => setAuthModalOpen(true)}
              />
            </div>
          </div>
        </div>

        <div
          onMouseEnter={clearMegaMenuCloseTimer}
          onMouseLeave={scheduleMegaMenuClose}
        >
          <nav className="hidden bg-white/55 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl md:block">
            <div
              className={cn(
                siteContainerClassName,
                "flex h-14 items-center justify-center",
              )}
            >
              <div className="flex h-10 items-center justify-center gap-4 px-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative shrink-0 px-2 py-2 text-sm font-semibold text-black transition-opacity after:pointer-events-none after:absolute after:inset-x-2 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out hover:opacity-60 hover:after:scale-x-100",
                    activeMegaMenu === item.menuKey && "after:scale-x-100",
                  )}
                  onMouseEnter={() => openMegaMenu(item.menuKey)}
                >
                  {item.label}
                </Link>
              ))}
              </div>
            </div>
          </nav>

          <MegaMenuShell
            activeMenuKey={activeMegaMenu}
            navigation={navigationItems}
            onMouseEnter={clearMegaMenuCloseTimer}
            onMouseLeave={scheduleMegaMenuClose}
          />
        </div>
      </header>
    );
  }

  if (headerVariant === "category") {
    return (
      <header
        className="sticky top-0 z-40 border-b border-black/5 bg-white/75 shadow-sm backdrop-blur-xl md:border-b md:bg-background md:shadow-none md:backdrop-blur-none"
        onMouseLeave={closeMegaMenu}
      >
        <div
          onMouseEnter={clearMegaMenuCloseTimer}
          onMouseLeave={scheduleMegaMenuClose}
        >
          <div className="md:bg-[#f1f2f3] md:backdrop-blur-none">
            <div
              className={cn(
                siteContainerClassName,
                "grid h-16 grid-cols-[3rem_minmax(0,1fr)_3rem] items-center md:h-auto md:min-h-[72px] md:grid-cols-[1fr_minmax(320px,560px)_1fr] md:gap-3 md:py-3",
              )}
            >
              <div className="flex items-center justify-start md:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileCategoryDrawerOpen(true)}
                  aria-label="Open menu"
                  aria-controls="mobile-category-drawer"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <StyleVerseLogo
                  alt={settings.storeName}
                  className="hidden md:block"
                  onMouseEnter={closeMegaMenu}
                  src={settings.logo.header}
                />
              </div>

              <StyleVerseLogo
                alt={settings.storeName}
                className="justify-self-center md:hidden"
                src={settings.logo.header}
              />

              <nav
                className="hidden min-w-0 justify-self-center md:flex"
                aria-label="Primary categories"
              >
                <div className="flex h-10 min-w-0 items-center justify-center gap-2 px-1 lg:gap-3 lg:px-2 xl:gap-4 xl:px-3">
                  {fixedCategoryNavigationItems.map((item) => {
                    const active = activeCategorySegment === item.menuKey;
                    const activeMegaMenuItem = activeMegaMenu === item.menuKey;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative shrink-0 px-1 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-black transition-opacity after:pointer-events-none after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out hover:opacity-60 hover:after:scale-x-100 lg:px-1.5 lg:text-xs lg:after:inset-x-1.5 xl:px-2 xl:text-sm xl:after:inset-x-2",
                          (active || activeMegaMenuItem) && "after:scale-x-100",
                        )}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => openMegaMenu(item.menuKey)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="flex items-center justify-end md:gap-3" onMouseEnter={closeMegaMenu}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileWishlistDrawerOpen(true)}
                  aria-label="Wishlist"
                  aria-expanded={isMobileWishlistDrawerOpen}
                  aria-controls="mobile-wishlist-drawer"
                >
                  <span className="relative">
                    <BookmarkCheck className="h-5 w-5 text-black" />
                    <WishlistCountBadge count={wishlistCount} />
                  </span>
                </Button>
                {showCompactDesktopSearch ? (
                  <CompactDesktopSearch products={searchProducts} />
                ) : null}
                <DesktopHeaderActions
                  wishlistCount={wishlistCount}
                  wishlistOpen={isMobileWishlistDrawerOpen}
                  onWishlistOpen={() => setMobileWishlistDrawerOpen(true)}
                  onProfileOpen={() => setAuthModalOpen(true)}
                />
              </div>
            </div>
          </div>

          <MegaMenuShell
            activeMenuKey={activeMegaMenu}
            navigation={fixedCategoryNavigationItems}
            onMouseEnter={clearMegaMenuCloseTimer}
            onMouseLeave={scheduleMegaMenuClose}
          />
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-black/5 bg-white/75 shadow-sm backdrop-blur-xl md:bg-background/95 md:shadow-none md:backdrop-blur"
      onMouseLeave={closeMegaMenu}
    >
      <div
        onMouseEnter={clearMegaMenuCloseTimer}
        onMouseLeave={scheduleMegaMenuClose}
      >
        <div
          className={cn(
            siteContainerClassName,
            "grid h-16 grid-cols-[3rem_minmax(0,1fr)_3rem] items-center md:flex md:gap-4",
          )}
          onMouseMove={closeMegaMenuOnEmptyArea}
        >
          <Button
            variant="ghost"
            size="icon"
            className="justify-self-start md:hidden"
            onClick={() => setMobileCategoryDrawerOpen(true)}
            aria-label="Open menu"
            aria-controls="mobile-category-drawer"
            onMouseEnter={closeMegaMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <StyleVerseLogo
            alt={settings.storeName}
            className="justify-self-center md:justify-self-auto"
            onMouseEnter={closeMegaMenu}
            src={settings.logo.header}
          />

          <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <div className="flex h-10 min-w-0 items-center justify-center gap-1 bg-white/55 px-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:gap-2 lg:px-3 xl:gap-4 xl:px-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative shrink-0 px-1 py-2 text-xs font-medium tracking-wide text-black transition-opacity after:pointer-events-none after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out hover:opacity-60 hover:after:scale-x-100 lg:px-2 lg:after:inset-x-2",
                  activeMegaMenu === item.menuKey && "after:scale-x-100",
                )}
                onMouseEnter={() => openMegaMenu(item.menuKey)}
              >
                {item.label}
              </Link>
            ))}
            </div>
          </nav>

          <div
            className="ml-auto flex items-center justify-self-end gap-0 sm:gap-1 md:ml-0 md:justify-self-auto md:gap-3"
            onMouseEnter={closeMegaMenu}
          >
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileWishlistDrawerOpen(true)}
              aria-label="Wishlist"
              aria-expanded={isMobileWishlistDrawerOpen}
              aria-controls="mobile-wishlist-drawer"
            >
              <span className="relative">
                <BookmarkCheck className="h-5 w-5" />
                <WishlistCountBadge count={wishlistCount} />
              </span>
            </Button>
            {showCompactDesktopSearch ? (
              <CompactDesktopSearch products={searchProducts} />
            ) : null}
            <DesktopHeaderActions
              wishlistCount={wishlistCount}
              wishlistOpen={isMobileWishlistDrawerOpen}
              onWishlistOpen={() => setMobileWishlistDrawerOpen(true)}
              onProfileOpen={() => setAuthModalOpen(true)}
            />
          </div>
        </div>

        <MegaMenuShell
          activeMenuKey={activeMegaMenu}
          navigation={navigationItems}
          onMouseEnter={clearMegaMenuCloseTimer}
          onMouseLeave={scheduleMegaMenuClose}
        />
      </div>
    </header>
  );
}

function DesktopHeaderActions({
  wishlistCount,
  wishlistOpen,
  onProfileOpen,
  onWishlistOpen,
}: {
  wishlistCount: number;
  wishlistOpen: boolean;
  onProfileOpen: () => void;
  onWishlistOpen: () => void;
}) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <HeaderIconAction
        label="Wishlist"
        onClick={onWishlistOpen}
        ariaExpanded={wishlistOpen}
        ariaControls="mobile-wishlist-drawer"
      >
        <span className="relative">
          <Heart className="h-5 w-5" aria-hidden="true" />
          <WishlistCountBadge count={wishlistCount} />
        </span>
      </HeaderIconAction>
      <HeaderIconAction
        label="Profile"
        onClick={onProfileOpen}
        ariaControls="mobile-auth-modal"
      >
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </HeaderIconAction>
    </div>
  );
}

function HeaderIconAction({
  ariaControls,
  ariaExpanded,
  children,
  label,
  onClick,
}: {
  ariaControls: string;
  ariaExpanded?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-[11px] font-semibold text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function WishlistCountBadge({ count }: { count: number }) {
  if (!count) {
    return null;
  }

  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white">
      {count}
    </span>
  );
}

function StyleVerseLogo({
  alt,
  className,
  onMouseEnter,
  src,
}: {
  alt: string;
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  src: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "relative block h-[22px] w-[151px] shrink-0 min-[360px]:h-[24px] min-[360px]:w-[165px] xs:h-[26px] xs:w-[178px] sm:h-[28px] sm:w-[192px] lg:h-[32px] lg:w-[219px]",
        className,
      )}
      aria-label={alt}
      onMouseEnter={onMouseEnter}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 219px, (min-width: 640px) 192px, (min-width: 480px) 151px, (min-width: 360px) 130px, 96px"
        className="object-contain object-left dark:invert"
        unoptimized={isExternalImage(src)}
      />
    </Link>
  );
}

function isExternalImage(src: string) {
  return /^https?:\/\//i.test(src);
}
