import { categoryTreeToNavigationItems } from "@/data/category-taxonomy";
import type { NavItem } from "@/types/navigation";

// Category navigation is adapted from the taxonomy seed today. Future admin/API
// category records should feed that service, while UI keeps consuming NavItem.
export const mainNavigation: NavItem[] = categoryTreeToNavigationItems();

export const menNavigationTree: NavItem[] =
  mainNavigation.find((item) => item.menuKey === "men")?.children ?? [];

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
