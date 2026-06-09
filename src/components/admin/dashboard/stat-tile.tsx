import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  count,
  href,
  icon: Icon,
  label,
  tone,
}: {
  count: number;
  href?: string;
  icon: LucideIcon;
  label: string;
  tone: "amber" | "blue" | "emerald" | "red" | "sky" | "violet" | "zinc";
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            toneClasses[tone],
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black leading-none text-zinc-950">
            {count}
          </p>
          <p className="mt-1 text-xs font-semibold leading-4 text-zinc-600">
            {label}
          </p>
        </div>
      </div>
      {href ? (
        <Link
          className="mt-3 inline-flex text-xs font-black text-sky-700 transition hover:text-sky-900"
          href={href}
        >
          View All
        </Link>
      ) : (
        <span className="mt-3 inline-flex text-xs font-black text-zinc-400">
          Not available yet
        </span>
      )}
    </div>
  );
}

const toneClasses = {
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  zinc: "bg-zinc-100 text-zinc-700",
} satisfies Record<string, string>;
