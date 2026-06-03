"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  FolderTree,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Menu,
  Package,
  Settings,
  Store,
  TicketPercent,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logoutAdminAction } from "@/app/admin/actions";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  admin: {
    email: string;
    roleName: string;
    roleSlug: string;
  };
  children: ReactNode;
};

type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/media", icon: ImageIcon, label: "Media" },
  { href: "/admin/categories", icon: FolderTree, label: "Categories" },
  { href: "/admin/inventory", icon: Boxes, label: "Inventory" },
  { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
  { href: "/admin/coupons", icon: TicketPercent, label: "Coupons" },
  { href: "/admin/homepage", icon: LayoutPanelTop, label: "Homepage CMS" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/settings", icon: Settings, label: "Store Settings" },
] satisfies AdminNavItem[];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const roleLabel = admin.roleName || admin.roleSlug;

  return (
    <section className="fixed inset-0 z-[60] h-dvh overflow-hidden bg-[#f4f6f8] text-zinc-950">
      <div className="flex h-full min-h-0">
        <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-white/10 bg-[#101214] text-white lg:flex">
          <SidebarBrand />
          <AdminNavList pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-zinc-200 bg-white/95 shadow-sm shadow-black/5 backdrop-blur">
            <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <MobileMenu pathname={pathname} />

              <div className="min-w-0">
                <p className="text-base font-black text-zinc-950 sm:text-lg">
                  StyleVerse Admin
                </p>
                <p className="text-xs font-medium text-zinc-500 sm:hidden">
                  {roleLabel}
                </p>
              </div>

              <div className="ml-auto flex min-w-0 items-center gap-3">
                <div className="min-w-0 text-right">
                  <p className="max-w-[42vw] truncate text-sm font-semibold text-zinc-950 sm:max-w-none">
                    {admin.email}
                  </p>
                  <p className="hidden text-xs font-medium text-zinc-500 sm:block">
                    {roleLabel}
                  </p>
                </div>

                <form action={logoutAdminAction}>
                  <button
                    type="submit"
                    className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white text-sm font-semibold text-zinc-950 shadow-sm shadow-black/5 transition hover:border-zinc-950 hover:bg-zinc-50 sm:w-auto sm:px-3"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

function SidebarBrand() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-zinc-950">
        <Store className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black">StyleVerse</p>
        <p className="text-xs font-medium text-white/55">Admin Panel</p>
      </div>
    </div>
  );
}

function AdminNavList({
  closeOnSelect = false,
  pathname,
}: {
  closeOnSelect?: boolean;
  pathname: string;
}) {
  return (
    <nav className="grid gap-1 px-3 py-4" aria-label="Admin navigation">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(pathname, item.href);
        const link = (
          <Link
            href={item.href}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white",
              active &&
                "bg-white text-zinc-950 shadow-sm shadow-black/20 hover:bg-white hover:text-zinc-950",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 text-white/50",
                active && "text-sky-600",
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 truncate">{item.label}</span>
          </Link>
        );

        if (closeOnSelect) {
          return (
            <SheetClose asChild key={item.href}>
              {link}
            </SheetClose>
          );
        }

        return <div key={item.href}>{link}</div>;
      })}
    </nav>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-sm shadow-black/5 transition hover:border-zinc-950 lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent className="left-0 right-auto w-80 border-l-0 border-r border-white/10 bg-[#101214] p-0 text-white">
        <SheetHeader className="sr-only">
          <SheetTitle>Admin navigation</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-full flex-col">
          <SidebarBrand />
          <AdminNavList closeOnSelect pathname={pathname} />
          <div className="mt-auto border-t border-white/10 px-5 py-4">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              View storefront
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
