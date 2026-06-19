import Link from "next/link";
import { siteContainerClassName } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type SiteBreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function SiteBreadcrumb({ items, className }: SiteBreadcrumbProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "border-b border-black/5 bg-white md:bg-transparent",
        className,
      )}
    >
      <div className={cn(siteContainerClassName, "min-w-0")}>
        <ol className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap py-2.5 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:text-sm">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1 || !item.href;
            const href = item.href;

            return (
              <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
                {index > 0 ? (
                  <span className="shrink-0 text-zinc-300" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {isCurrent || !href ? (
                  <span
                    className="max-w-[16rem] truncate font-medium text-black sm:max-w-none"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="shrink-0 text-zinc-500 transition-colors hover:text-black"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
