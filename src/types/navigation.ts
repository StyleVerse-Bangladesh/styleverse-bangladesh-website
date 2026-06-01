export type NavItem = {
  label: string;
  href: string;
  menuKey?: string;
  children?: NavItem[];
};
