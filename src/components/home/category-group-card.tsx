import type { MouseEventHandler } from "react";
import Link from "next/link";

export type CategoryGroup = {
  title: string;
  items: Array<{
    label: string;
    href: string;
    tone: string;
  }>;
};

type CategoryGroupCardProps = {
  group: CategoryGroup;
  animationDelayMs?: number;
  className?: string;
  itemDraggable?: boolean;
  onItemClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function CategoryGroupCard({
  group,
  animationDelayMs,
  className,
  itemDraggable,
  onItemClick,
}: CategoryGroupCardProps) {
  return (
    <article
      className={`category-card-enter rounded-md border border-black/10 bg-white p-4 shadow-sm shadow-black/5 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-black/20 hover:shadow-xl hover:shadow-black/10 ${className ?? ""}`}
      style={
        animationDelayMs !== undefined
          ? { animationDelay: `${animationDelayMs}ms` }
          : undefined
      }
    >
      <h3 className="text-lg font-extrabold text-black">{group.title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
        {group.items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group/item block rounded-md outline-none transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-black"
            draggable={itemDraggable}
            onClick={onItemClick}
          >
            <div
              className={`relative aspect-square overflow-hidden rounded-md bg-gradient-to-br ${item.tone} shadow-sm shadow-black/10 transition-[box-shadow,transform] duration-300 ease-out group-hover/item:scale-[1.015] group-hover/item:shadow-lg group-hover/item:shadow-black/20 sm:aspect-[4/3]`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.34),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)] transition-transform duration-500 ease-out group-hover/item:scale-110" />
              <div className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-sm transition-[transform,opacity] duration-500 ease-out group-hover/item:translate-x-[420%] group-hover/item:opacity-100" />
              <div className="absolute bottom-2 right-2 h-8 w-14 rounded-full bg-white/20 blur-md transition-transform duration-300 group-hover/item:scale-125" />
            </div>
            <p className="mt-2 text-center text-sm font-medium text-zinc-700 transition-colors group-hover/item:text-black sm:text-left">
              {item.label}
            </p>
          </Link>
        ))}
      </div>
    </article>
  );
}
