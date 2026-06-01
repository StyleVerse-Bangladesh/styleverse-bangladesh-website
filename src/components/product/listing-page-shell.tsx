import type { BreadcrumbItem } from "@/components/shared/site-breadcrumb";
import { SiteBreadcrumb } from "@/components/shared/site-breadcrumb";
import { siteContainerClassName } from "@/lib/constants/layout";

type ListingPageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
};

export function ListingPageShell({
  breadcrumbs,
  children,
}: ListingPageShellProps) {
  return (
    <>
      <SiteBreadcrumb items={breadcrumbs} />
      <section className={`${siteContainerClassName} pt-3 pb-10 sm:pt-4`}>
        {children}
      </section>
    </>
  );
}
