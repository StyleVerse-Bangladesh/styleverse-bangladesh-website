"use client";

import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type MouseEventHandler,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookmarkCheck,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mainNavigation } from "@/lib/constants/navigation";
import { siteContainerClassName } from "@/lib/constants/layout";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { MegaMenuShell } from "./mega-menu-shell";

const logoSrc = "/logo/StyleVerse-Logo-Long-Black.png";
const logoAlt = "StyleVerse Bangladesh";
const megaMenuCloseDelay = 250;

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCartSummary();
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
  const isHomePage = pathname === "/";
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

  if (isHomePage) {
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
              <StyleVerseLogo className="hidden md:block" />
            </div>

            <StyleVerseLogo className="justify-self-center md:hidden" />

            <div className="relative hidden w-full md:col-span-1 md:block">
              <Input
                className="h-10 rounded-full border-black bg-white px-4 pr-11 text-sm placeholder:text-zinc-600 focus-visible:ring-black"
                placeholder="Search Products By Name....."
                aria-label="Search products by name"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
            </div>

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
              <Button
                className="hidden md:inline-flex"
                variant="ghost"
                size="icon"
                aria-label="Profile"
                asChild
              >
                <Link href="/login">
                  <UserRound className="h-5 w-5 text-black" />
                </Link>
              </Button>
              <Button
                className="hidden md:inline-flex"
                variant="ghost"
                size="icon"
                aria-label="Cart"
                asChild
              >
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5 text-black" />
                  {itemCount > 0 ? (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                      {itemCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <Button
                className="hidden md:inline-flex"
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                asChild
              >
                <Link href="/wishlist" className="relative">
                  <UserRound className="h-5 w-5 text-black" />
                  <WishlistCountBadge count={wishlistCount} />
                </Link>
              </Button>
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
              {mainNavigation.map((item) => (
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
            className="justify-self-center md:justify-self-auto"
            onMouseEnter={closeMegaMenu}
          />

          <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <div className="flex h-10 min-w-0 items-center justify-center gap-1 bg-white/55 px-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:gap-2 lg:px-3 xl:gap-4 xl:px-6">
            {mainNavigation.map((item) => (
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

          <div className="hidden w-52 items-center xl:flex" onMouseEnter={closeMegaMenu}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search" aria-label="Search" />
            </div>
          </div>

          <div
            className="ml-auto flex items-center justify-self-end gap-0 sm:gap-1 md:ml-0 md:justify-self-auto"
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
            <Button
              className="hidden md:inline-flex"
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              asChild
            >
              <Link href="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                <WishlistCountBadge count={wishlistCount} />
              </Link>
            </Button>
            <Button
              className="hidden md:inline-flex"
              variant="ghost"
              size="icon"
              aria-label="Cart"
              asChild
            >
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Button
              className="hidden md:inline-flex"
              variant="ghost"
              size="icon"
              aria-label="Profile"
              asChild
            >
              <Link href="/login">
                <UserRound className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <MegaMenuShell
          activeMenuKey={activeMegaMenu}
          onMouseEnter={clearMegaMenuCloseTimer}
          onMouseLeave={scheduleMegaMenuClose}
        />
      </div>
    </header>
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
  className,
  onMouseEnter,
}: {
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "relative block h-[22px] w-[151px] shrink-0 min-[360px]:h-[24px] min-[360px]:w-[165px] xs:h-[26px] xs:w-[178px] sm:h-[28px] sm:w-[192px] lg:h-[32px] lg:w-[219px]",
        className,
      )}
      aria-label={logoAlt}
      onMouseEnter={onMouseEnter}
    >
      <Image
        src={logoSrc}
        alt={logoAlt}
        fill
        sizes="(min-width: 1024px) 219px, (min-width: 640px) 192px, (min-width: 480px) 151px, (min-width: 360px) 130px, 96px"
        className="object-contain object-left dark:invert"
      />
    </Link>
  );
}
