import { siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

type PriceProps = {
  price: number;
  compareAtPrice?: number;
  className?: string;
};

const formatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

export function Price({ price, compareAtPrice, className }: PriceProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm leading-5",
        className,
      )}
    >
      <span className="shrink-0 font-medium">{formatter.format(price)}</span>
      {compareAtPrice ? (
        <span className="shrink-0 text-muted-foreground line-through">
          {formatter.format(compareAtPrice)}
        </span>
      ) : null}
    </div>
  );
}
