"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mainNavigation } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { NavItem } from "@/types/navigation";

export function MobileCategoryDrawer() {
  const open = useUiStore((state) => state.isMobileCategoryDrawerOpen);
  const setOpen = useUiStore((state) => state.setMobileCategoryDrawerOpen);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function closeDrawerOnTablet(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false);
      }
    }

    if (mediaQuery.matches) {
      setOpen(false);
    }

    mediaQuery.addEventListener("change", closeDrawerOnTablet);

    return () =>
      mediaQuery.removeEventListener("change", closeDrawerOnTablet);
  }, [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        id="mobile-category-drawer"
        className="left-0 right-auto w-[min(21rem,88vw)] border-l-0 border-r bg-white p-0 pb-[env(safe-area-inset-bottom)] shadow-[18px_0_44px_rgba(0,0,0,0.18)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden"
        aria-label="Mobile category menu"
      >
        <SheetHeader className="border-b px-5 pb-4 pt-6">
          <SheetTitle className="text-base font-extrabold tracking-[0.18em] text-black">
            CATEGORY
          </SheetTitle>
        </SheetHeader>

        <nav
          className="grid max-h-[calc(100vh-5rem-env(safe-area-inset-bottom))] gap-1 overflow-y-auto px-3 py-4"
          aria-label="Mobile categories"
        >
          {mainNavigation.map((item) => (
            <CategoryDrawerItem key={item.href} item={item} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function CategoryDrawerItem({ item }: { item: NavItem }) {
  if (!item.children?.length) {
    return (
      <SheetClose asChild>
        <Link
          href={item.href}
          className="flex min-h-11 items-center rounded-md px-3 py-3 text-sm font-semibold tracking-wide text-black transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100"
        >
          {item.label}
        </Link>
      </SheetClose>
    );
  }

  return (
    <details className="group rounded-md">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-3 py-3 text-sm font-semibold tracking-wide text-black transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100">
        <span>{item.label}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>

      <div className="ml-3 grid gap-1 border-l border-zinc-200 py-1 pl-3">
        <SheetClose asChild>
          <Link
            href={item.href}
            className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100"
          >
            View all {item.label}
          </Link>
        </SheetClose>

        {item.children.map((child) => (
          <CategoryDrawerBranch key={child.href} item={child} />
        ))}
      </div>
    </details>
  );
}

function CategoryDrawerBranch({ item }: { item: NavItem }) {
  if (!item.children?.length) {
    return (
      <SheetClose asChild>
        <Link
          href={item.href}
          className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black focus-visible:bg-zinc-100"
        >
          {item.label}
        </Link>
      </SheetClose>
    );
  }

  return (
    <details className="group/branch rounded-md">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100">
        <span>{item.label}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open/branch:rotate-180" />
      </summary>

      <div className="ml-3 grid gap-1 border-l border-zinc-200 pl-3">
        <SheetClose asChild>
          <Link
            href={item.href}
            className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100"
          >
            View all {item.label}
          </Link>
        </SheetClose>

        {item.children.map((child) => (
          <SheetClose asChild key={child.href}>
            <Link
              href={child.href}
              className={cn(
                "flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors",
                "hover:bg-zinc-100 hover:text-black focus-visible:bg-zinc-100",
              )}
            >
              {child.label}
            </Link>
          </SheetClose>
        ))}
      </div>
    </details>
  );
}
