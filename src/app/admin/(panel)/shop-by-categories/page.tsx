import {
  ShopByCategoriesAdminPage,
  type ShopByCategoryOption,
  type ShopByCategorySlotDraft,
} from "@/app/admin/(panel)/shop-by-categories/shop-by-categories-admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Shop By Categories",
};

const slotPositions = [1, 2, 3, 4] as const;
const itemPositions = [1, 2, 3, 4] as const;

const defaultSlots = [
  {
    items: ["men/t-shirts", "men/polo-t-shirts", "men/shirts", "men/joggers"],
    root: "men",
    title: "Men Essentials",
  },
  {
    items: ["women/dresses", "women/tops", "women/co-ord-set", "women/outerwear"],
    root: "women",
    title: "Women Collection",
  },
  {
    items: ["kids/t-shirts", "kids/sets", "kids/shoes", "kids/accessories"],
    root: "kids",
    title: "Kids",
  },
  {
    items: [
      "accessories/bags",
      "accessories/caps",
      "accessories/belts",
      "accessories/sunglasses",
    ],
    root: "accessories",
    title: "Accessories",
  },
];

export default async function AdminShopByCategoriesPage() {
  const [categories, slots] = await Promise.all([
    getCategoryOptions(),
    getSlotDrafts(),
  ]);

  return <ShopByCategoriesAdminPage categories={categories} slots={slots} />;
}

async function getCategoryOptions(): Promise<ShopByCategoryOption[]> {
  const categories = await db.category.findMany({
    orderBy: [{ pathKey: "asc" }],
    select: {
      depth: true,
      id: true,
      image: true,
      label: true,
      pathKey: true,
    },
    where: {
      isActive: true,
    },
  });

  return categories;
}

async function getSlotDrafts(): Promise<ShopByCategorySlotDraft[]> {
  const [categories, slots] = await Promise.all([
    db.category.findMany({
      select: {
        id: true,
        pathKey: true,
      },
      where: {
        isActive: true,
      },
    }),
    db.homepageCategorySlot.findMany({
      orderBy: [{ position: "asc" }],
      select: {
        id: true,
        items: {
          orderBy: [{ position: "asc" }],
          select: {
            categoryId: true,
            imageOverride: true,
            labelOverride: true,
            position: true,
          },
        },
        position: true,
        rootCategoryId: true,
        title: true,
      },
      where: {
        position: {
          in: [...slotPositions],
        },
      },
    }),
  ]);
  const categoryIdByPathKey = new Map(
    categories.map((category) => [category.pathKey, category.id]),
  );
  const slotByPosition = new Map(slots.map((slot) => [slot.position, slot]));

  return slotPositions.map((position) => {
    const existingSlot = slotByPosition.get(position);
    const fallbackSlot = defaultSlots[position - 1];

    return {
      items: itemPositions.map((itemPosition) => {
        const existingItem = existingSlot?.items.find(
          (item) => item.position === itemPosition,
        );

        return {
          categoryId:
            existingItem?.categoryId ??
            categoryIdByPathKey.get(fallbackSlot.items[itemPosition - 1]) ??
            "",
          imageOverride: existingItem?.imageOverride ?? "",
          labelOverride: existingItem?.labelOverride ?? "",
          position: itemPosition,
        };
      }),
      position,
      rootCategoryId:
        existingSlot?.rootCategoryId ??
        categoryIdByPathKey.get(fallbackSlot.root) ??
        "",
      title: existingSlot?.title ?? fallbackSlot.title,
    };
  });
}
