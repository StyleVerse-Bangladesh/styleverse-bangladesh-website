import {
  CategoryGroupCard,
  type CategoryGroup,
} from "@/components/home/category-group-card";
import { HomeSectionHeading } from "@/components/home/home-section-heading";
import { MobileCategoryGroupsCarousel } from "@/components/home/mobile-category-groups-carousel";
import { siteContainerClassName } from "@/lib/constants/layout";

const categoryGroups: CategoryGroup[] = [
  {
    title: "Men Essentials",
    items: [
      { label: "T-Shirts", href: "/men/t-shirts", tone: "from-zinc-950 to-zinc-600" },
      { label: "Polo", href: "/men/polo-t-shirts", tone: "from-neutral-700 to-stone-300" },
      { label: "Shirts", href: "/men/shirts", tone: "from-slate-900 to-slate-500" },
      { label: "Joggers", href: "/men/joggers", tone: "from-stone-800 to-zinc-400" },
    ],
  },
  {
    title: "Women Collection",
    items: [
      { label: "Dresses", href: "/women", tone: "from-zinc-900 to-rose-200" },
      { label: "Tops", href: "/women", tone: "from-neutral-800 to-zinc-300" },
      { label: "Co-Ord Set", href: "/women", tone: "from-stone-900 to-stone-300" },
      { label: "Outerwear", href: "/women", tone: "from-slate-950 to-slate-400" },
    ],
  },
  {
    title: "Kids",
    items: [
      { label: "T-Shirts", href: "/kids", tone: "from-black to-zinc-500" },
      { label: "Sets", href: "/kids", tone: "from-zinc-900 to-neutral-300" },
      { label: "Shoes", href: "/kids", tone: "from-slate-900 to-slate-400" },
      { label: "Accessories", href: "/kids", tone: "from-stone-800 to-stone-300" },
    ],
  },
  {
    title: "Accessories",
    items: [
      { label: "Bags", href: "/accessories", tone: "from-neutral-950 to-neutral-500" },
      { label: "Caps", href: "/accessories", tone: "from-zinc-800 to-zinc-300" },
      { label: "Belts", href: "/accessories", tone: "from-stone-950 to-stone-500" },
      { label: "Sunglasses", href: "/accessories", tone: "from-slate-900 to-zinc-300" },
    ],
  },
];

export function CategoryShowcase() {
  return (
    <section className="bg-white py-5 sm:py-12" aria-label="Categories">
      <div className={siteContainerClassName}>
        <div className="relative border-b border-black/10 pb-2.5 text-center sm:pb-5">
          <HomeSectionHeading>SHOP BY CATEGORY</HomeSectionHeading>
          <span className="mx-auto mt-2 block h-px w-32 bg-black/35 sm:mt-4 sm:h-0.5 sm:w-56 sm:bg-black" />
        </div>

        <div className="mt-4 md:hidden">
          <MobileCategoryGroupsCarousel groups={categoryGroups} />
        </div>

        <div className="mt-4 hidden gap-5 sm:mt-10 md:grid md:grid-cols-2 xl:grid-cols-4">
          {categoryGroups.map((group, index) => (
            <CategoryGroupCard
              key={group.title}
              group={group}
              animationDelayMs={index * 90}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
