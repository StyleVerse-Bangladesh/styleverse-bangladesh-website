import { categoryTreeToNavigationItems } from "@/data/category-taxonomy";
import type { NavItem } from "@/types/navigation";

// Category navigation is adapted from the taxonomy seed today. Future admin/API
// category records should feed that service, while UI keeps consuming NavItem.
export const mainNavigation: NavItem[] = categoryTreeToNavigationItems();

export const menNavigationTree: NavItem[] =
  mainNavigation.find((item) => item.menuKey === "men")?.children ?? [];

export function getNavigationItems(navigation?: NavItem[]) {
  return navigation?.length ? navigation : mainNavigation;
}

export function findNavigationItemByMenuKey(
  menuKey: string,
  navigation?: NavItem[],
) {
  return getNavigationItems(navigation).find((item) => item.menuKey === menuKey);
}

export function flattenNavigationItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavigationItems(item.children) : []),
  ]);
}

export function findNavigationItemByHref(href: string, navigation?: NavItem[]) {
  return flattenNavigationItems(getNavigationItems(navigation)).find(
    (item) => item.href === href,
  );
}
