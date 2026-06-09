import { BarChart3, SlidersHorizontal } from "lucide-react";
import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import type {
  DashboardDateRange,
  SalesReportPoint,
} from "@/app/admin/(panel)/dashboard-data";

export function SalesReportCard({
  points,
  range,
}: {
  points: SalesReportPoint[];
  range: DashboardDateRange;
}) {
  const maxAmount = Math.max(...points.map((point) => point.amount), 0);
  const total = points.reduce((sum, point) => sum + point.amount, 0);
  const hasSales = maxAmount > 0;

  return (
    <DashboardCard
      className="min-h-full"
      subtitle={`${range.from} to ${range.to}`}
      title="Sales Report"
    >
      <div className="grid gap-5">
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <DateField label="From" name="from" value={range.from} />
          <DateField label="To" name="to" value={range.to} />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800"
            type="submit"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Apply
          </button>
        </form>

        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500">
                Total sales
              </p>
              <p className="mt-1 text-2xl font-black text-zinc-950">
                {formatMoney(total)}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          {hasSales ? (
            <div
              className="mt-6 flex h-56 items-end gap-2 overflow-x-auto border-b border-zinc-200 pb-3"
              aria-label="Sales amount by day"
            >
              {points.map((point) => {
                const height = Math.max(8, (point.amount / maxAmount) * 100);

                return (
                  <div
                    className="flex min-w-10 flex-1 flex-col items-center gap-2"
                    key={point.date}
                  >
                    <div className="flex h-40 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-sky-600 shadow-sm shadow-sky-900/10"
                        style={{ height: `${height}%` }}
                        title={`${point.label}: ${formatMoney(point.amount)}`}
                      />
                    </div>
                    <span className="text-[0.68rem] font-semibold text-zinc-500">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-zinc-200 bg-white p-8 text-center">
              <p className="text-sm font-black text-zinc-950">
                No sales in this range
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Choose a wider date range to review order revenue.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

function DateField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      <input
        className="min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
        defaultValue={value}
        name={name}
        type="date"
      />
    </label>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    currency: "BDT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
