import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatRow({
  count,
  disabled = false,
  href,
  icon: Icon,
  label,
  tone,
}: {
  count: number;
  disabled?: boolean;
  href?: string;
  icon: LucideIcon;
  label: string;
  tone: "amber" | "blue" | "emerald" | "red" | "sky" | "violet" | "zinc";
}) {
  const action = disabled ? (
    <span className="text-xs font-black text-zinc-400">Unavailable</span>
  ) : href ? (
    <Link
      className="text-xs font-black text-sky-700 transition hover:text-sky-900"
      href={href}
    >
      View All
    </Link>
  ) : null;

  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          toneClasses[tone],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-black leading-none text-zinc-950">{count}</p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-600">
          {label}
        </p>
      </div>
      {action}
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
