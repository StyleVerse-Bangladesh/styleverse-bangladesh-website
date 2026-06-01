import { Check, Headphones, RefreshCcw, Truck } from "lucide-react";
import { siteContainerClassName } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Premium Quality Products",
    icon: Check,
  },
  {
    title: "Fastest Shipping Countrywide",
    icon: Truck,
  },
  {
    title: "Easy Exchange Policy",
    icon: RefreshCcw,
  },
  {
    title: "Online Support 24/7",
    icon: Headphones,
  },
];

export function FeatureStrip() {
  return (
    <section
      className="hidden border-y bg-[#f5f6f8] md:block"
      aria-label="Store features"
    >
      <div
        className={cn(
          siteContainerClassName,
          "grid grid-cols-2 gap-3 py-4 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6 lg:py-7",
        )}
      >
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group flex min-h-[118px] min-w-0 items-center gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm shadow-black/5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-black/25 hover:shadow-xl hover:shadow-black/12 sm:min-h-[128px] sm:gap-4 sm:p-5 lg:min-h-[128px]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-black/20 bg-white text-black transition-[transform,border-color,box-shadow] duration-200 ease-out group-hover:scale-105 group-hover:border-black/35 group-hover:shadow-md group-hover:shadow-black/10 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="min-w-0 flex-1 text-[13px] font-extrabold leading-tight text-black sm:max-w-[220px] sm:text-base lg:text-lg">
                {feature.title}
              </h2>
            </div>
          );
        })}
      </div>
    </section>
  );
}
