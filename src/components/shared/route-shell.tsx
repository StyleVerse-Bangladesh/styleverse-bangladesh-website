import { siteContainerClassName } from "@/lib/constants/layout";

type RouteShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function RouteShell({
  eyebrow,
  title,
  description,
  children,
}: RouteShellProps) {
  return (
    <section className={`${siteContainerClassName} py-10`}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
