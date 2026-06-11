"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  FolderTree,
  Grid3X3,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  TicketPercent,
  UserCog,
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

type AdminNavLinkItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  superAdminOnly?: boolean;
};

type AdminNavGroupItem = {
  children: AdminNavLinkItem[];
  icon: LucideIcon;
  label: string;
  superAdminOnly?: boolean;
};

type AdminNavItem = AdminNavLinkItem | AdminNavGroupItem;

const adminNavItems: AdminNavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  {
    children: [
      { href: "/admin/categories", icon: FolderTree, label: "Categories" },
      {
        href: "/admin/shop-by-categories",
        icon: Grid3X3,
        label: "Shop by Category",
      },
    ],
    icon: SlidersHorizontal,
    label: "Product Config",
  },
  { href: "/admin/media", icon: ImageIcon, label: "Media" },
  { href: "/admin/inventory", icon: Boxes, label: "Inventory" },
  { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
  { href: "/admin/coupons", icon: TicketPercent, label: "Coupons" },
  { href: "/admin/homepage", icon: LayoutPanelTop, label: "Homepage CMS" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/settings", icon: Settings, label: "Store Settings" },
  {
    href: "/admin/users",
    icon: UserCog,
    label: "Admin Users",
    superAdminOnly: true,
  },
  {
    href: "/admin/roles",
    icon: ShieldCheck,
    label: "Roles & Permissions",
    superAdminOnly: true,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavGroupItem(item: AdminNavItem): item is AdminNavGroupItem {
  return "children" in item;
}

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const roleLabel = admin.roleName || admin.roleSlug;

  return (
    <section className="fixed inset-0 z-[60] h-dvh overflow-hidden bg-[#f4f6f8] text-zinc-950">
      <div className="flex h-full min-h-0">
        <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-white/10 bg-[#101214] text-white lg:flex">
          <SidebarBrand />
          <AdminNavList pathname={pathname} roleSlug={admin.roleSlug} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-zinc-200 bg-white/95 shadow-sm shadow-black/5 backdrop-blur">
            <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <MobileMenu pathname={pathname} roleSlug={admin.roleSlug} />

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
  roleSlug,
}: {
  closeOnSelect?: boolean;
  pathname: string;
  roleSlug: string;
}) {
  const visibleItems = adminNavItems.filter(
    (item) => !item.superAdminOnly || roleSlug === "SUPER_ADMIN",
  );

  return (
    <nav className="grid gap-1 px-3 py-4" aria-label="Admin navigation">
      {visibleItems.map((item) => {
        if (isNavGroupItem(item)) {
          return (
            <AdminNavGroup
              closeOnSelect={closeOnSelect}
              item={item}
              key={item.label}
              pathname={pathname}
              roleSlug={roleSlug}
            />
          );
        }

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

function AdminNavGroup({
  closeOnSelect,
  item,
  pathname,
  roleSlug,
}: {
  closeOnSelect: boolean;
  item: AdminNavGroupItem;
  pathname: string;
  roleSlug: string;
}) {
  const visibleChildren = item.children.filter(
    (child) => !child.superAdminOnly || roleSlug === "SUPER_ADMIN",
  );
  const hasActiveChild = visibleChildren.some((child) =>
    isActiveRoute(pathname, child.href),
  );
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = item.icon;

  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  if (visibleChildren.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md">
      <button
        type="button"
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white",
          hasActiveChild &&
            "bg-white text-zinc-950 shadow-sm shadow-black/20 hover:bg-white hover:text-zinc-950",
        )}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 text-white/50",
            hasActiveChild && "text-sky-600",
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-white/45 transition-transform",
            open && "rotate-180",
            hasActiveChild && "text-zinc-500",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="mt-1 grid gap-1 border-l border-white/10 py-1 pl-3 ml-5">
          {visibleChildren.map((child) => {
            const ChildIcon = child.icon;
            const active = isActiveRoute(pathname, child.href);
            const link = (
              <Link
                href={child.href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white",
                  active &&
                    "bg-white text-zinc-950 shadow-sm shadow-black/20 hover:bg-white hover:text-zinc-950",
                )}
                aria-current={active ? "page" : undefined}
              >
                <ChildIcon
                  className={cn(
                    "h-4 w-4 shrink-0 text-white/45",
                    active && "text-sky-600",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">{child.label}</span>
              </Link>
            );

            if (closeOnSelect) {
              return (
                <SheetClose asChild key={child.href}>
                  {link}
                </SheetClose>
              );
            }

            return <div key={child.href}>{link}</div>;
          })}
        </div>
      ) : null}
    </div>
  );
}

function MobileMenu({
  pathname,
  roleSlug,
}: {
  pathname: string;
  roleSlug: string;
}) {
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
          <AdminNavList
            closeOnSelect
            pathname={pathname}
            roleSlug={roleSlug}
          />
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
