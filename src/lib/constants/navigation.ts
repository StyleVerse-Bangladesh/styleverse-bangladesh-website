import type { NavItem } from "@/types/navigation";

export const menNavigationTree: NavItem[] = [
  {
    label: "T-Shirts",
    href: "/men/t-shirts",
    children: [
      {
        label: "Half Sleeve T-Shirt",
        href: "/men/t-shirts/half-sleeve-t-shirt",
      },
      {
        label: "Full Sleeve T-Shirt",
        href: "/men/t-shirts/full-sleeve-t-shirt",
      },
      {
        label: "Drop Shoulder T-Shirt",
        href: "/men/t-shirts/drop-shoulder-t-shirt",
      },
      {
        label: "Solid T-Shirt",
        href: "/men/t-shirts/solid-t-shirt",
      },
    ],
  },
  {
    label: "Polo T-Shirts",
    href: "/men/polo-t-shirts",
    children: [
      { label: "Knitted Polo", href: "/men/polo-t-shirts/knitted-polo" },
      { label: "Old Money Polo", href: "/men/polo-t-shirts/old-money-polo" },
      { label: "Solid Polo", href: "/men/polo-t-shirts/solid-polo" },
      { label: "Printed Polo", href: "/men/polo-t-shirts/printed-polo" },
    ],
  },
  {
    label: "Shirts",
    href: "/men/shirts",
    children: [
      { label: "Casual Shirt", href: "/men/shirts/casual-shirt" },
      { label: "Formal Shirt", href: "/men/shirts/formal-shirt" },
      { label: "Denim Shirt", href: "/men/shirts/denim-shirt" },
      { label: "Linen Shirt", href: "/men/shirts/linen-shirt" },
    ],
  },
  {
    label: "Joggers",
    href: "/men/joggers",
    children: [
      { label: "Regular Joggers", href: "/men/joggers/regular-joggers" },
      { label: "Cargo Joggers", href: "/men/joggers/cargo-joggers" },
      { label: "Sports Joggers", href: "/men/joggers/sports-joggers" },
      { label: "Slim Fit Joggers", href: "/men/joggers/slim-fit-joggers" },
    ],
  },
];

export const mainNavigation: NavItem[] = [
  { label: "MEN", href: "/men", menuKey: "men", children: menNavigationTree },
  { label: "WOMEN", href: "/women", menuKey: "women" },
  { label: "KIDS", href: "/kids", menuKey: "kids" },
  { label: "SEASONAL FITS", href: "/seasonal-fits", menuKey: "seasonal-fits" },
  { label: "SPORTS", href: "/sports", menuKey: "sports" },
  { label: "SHOES", href: "/shoes", menuKey: "shoes" },
  { label: "ACCESSORIES", href: "/accessories", menuKey: "accessories" },
];

export function findNavigationItemByMenuKey(menuKey: string) {
  return mainNavigation.find((item) => item.menuKey === menuKey);
}

export function flattenNavigationItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavigationItems(item.children) : []),
  ]);
}

export function findNavigationItemByHref(href: string) {
  return flattenNavigationItems(mainNavigation).find((item) => item.href === href);
}
