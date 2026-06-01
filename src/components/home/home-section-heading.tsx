import { cn } from "@/lib/utils";

type HomeSectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function HomeSectionHeading({
  children,
  className,
}: HomeSectionHeadingProps) {
  return (
    <h2
      className={cn(
        "font-bebas text-2xl font-normal uppercase leading-none tracking-[0.03em] text-black sm:text-3xl sm:leading-none",
        className,
      )}
    >
      {children}
    </h2>
  );
}
