import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardCard({
  actionHref,
  actionLabel,
  children,
  className,
  subtitle,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-black text-zinc-950">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link
            className="shrink-0 text-xs font-black text-sky-700 transition hover:text-sky-900"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
