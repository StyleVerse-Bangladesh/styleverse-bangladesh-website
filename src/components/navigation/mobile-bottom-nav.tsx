"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Grid3X3, Home, Search, ShoppingBag, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { mainNavigation } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const navItemClassName =
  "relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-black/75 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCartSummary();
  const setCategoryDrawerOpen = useUiStore(
    (state) => state.setMobileCategoryDrawerOpen,
  );
  const categoryDrawerOpen = useUiStore(
    (state) => state.isMobileCategoryDrawerOpen,
  );
  const setCartDrawerOpen = useUiStore(
    (state) => state.setMobileCartDrawerOpen,
  );
  const cartDrawerOpen = useUiStore((state) => state.isMobileCartDrawerOpen);
  const setAuthModalOpen = useUiStore((state) => state.setMobileAuthModalOpen);
  const authModalOpen = useUiStore((state) => state.isMobileAuthModalOpen);
  const searchDropdownOpen = useUiStore(
    (state) => state.isMobileSearchDropdownOpen,
  );
  const setSearchDropdownOpen = useUiStore(
    (state) => state.setMobileSearchDropdownOpen,
  );
  const categoryActive =
    categoryDrawerOpen ||
    mainNavigation.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/75 shadow-[0_-12px_36px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden"
      aria-label="Mobile bottom navigation"
    >
      <div className="grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        <MobileBottomLink href="/" label="Home" active={pathname === "/"}>
          <Home className="h-5 w-5" />
        </MobileBottomLink>

        <button
          type="button"
          className={cn(
            navItemClassName,
            categoryActive && "text-black",
          )}
          onClick={() => setCategoryDrawerOpen(true)}
          aria-label="Open categories"
          aria-expanded={categoryDrawerOpen}
          aria-controls="mobile-category-drawer"
        >
          <Grid3X3 className="h-5 w-5" />
          <span>Category</span>
        </button>

        <button
          type="button"
          className={cn(
            navItemClassName,
            searchDropdownOpen && "text-black",
          )}
          onClick={() => setSearchDropdownOpen(true)}
          aria-label="Open product search"
          aria-expanded={searchDropdownOpen}
          aria-controls="mobile-search-dropdown"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </button>

        <button
          type="button"
          className={cn(
            navItemClassName,
            (cartDrawerOpen || pathname === "/cart") && "text-black",
          )}
          onClick={() => setCartDrawerOpen(true)}
          aria-label="Open cart"
          aria-expanded={cartDrawerOpen}
          aria-controls="mobile-cart-drawer"
        >
          <span className="relative" data-cart-animation-target="true">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white">
                {itemCount}
              </span>
            ) : null}
          </span>
          <span>Cart</span>
        </button>

        <button
          type="button"
          className={cn(
            navItemClassName,
            (authModalOpen || pathname === "/login") && "text-black",
          )}
          onClick={() => setAuthModalOpen(true)}
          aria-label="Open account"
          aria-expanded={authModalOpen}
          aria-controls="mobile-auth-modal"
        >
          <UserRound className="h-5 w-5" />
          <span>Account</span>
        </button>
      </div>
    </nav>
  );
}

function MobileBottomLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(navItemClassName, active && "text-black")}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {children}
      <span>{label}</span>
    </Link>
  );
}
