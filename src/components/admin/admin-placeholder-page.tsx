import { ArrowUpRight } from "lucide-react";

type AdminPlaceholderPageProps = {
  description: string;
  title: string;
};

export function AdminPlaceholderPage({
  description,
  title,
}: AdminPlaceholderPageProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-semibold text-sky-700">Admin module</p>
        <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600">
          {description}
        </p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-black/5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-zinc-950">
              Placeholder ready
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              This protected page is mounted inside the admin dashboard shell.
              Management tools for this module will be added in a later phase.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
