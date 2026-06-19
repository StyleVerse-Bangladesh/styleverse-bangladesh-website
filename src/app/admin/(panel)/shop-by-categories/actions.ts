"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type ShopByCategoriesActionState = {
  message?: string;
  status?: "error" | "success";
};

type SlotInput = {
  items: SlotItemInput[];
  position: number;
  rootCategoryId: string;
  title: string;
};

type SlotItemInput = {
  categoryId: string;
  imageOverride: string | null;
  labelOverride: string | null;
  position: number;
};

const slotPositions = [1, 2, 3, 4] as const;
const itemPositions = [1, 2, 3, 4] as const;

export async function saveShopByCategoriesAction(
  _state: ShopByCategoriesActionState,
  formData: FormData,
): Promise<ShopByCategoriesActionState> {
  const slots = parseSlots(formData);
  const validationError = await validateSlots(slots);

  if (validationError) {
    return {
      message: validationError,
      status: "error",
    };
  }

  await db.$transaction(async (tx) => {
    for (const slot of slots) {
      const savedSlot = await tx.homepageCategorySlot.upsert({
        where: { position: slot.position },
        update: {
          isActive: true,
          rootCategoryId: slot.rootCategoryId,
          title: slot.title,
        },
        create: {
          isActive: true,
          position: slot.position,
          rootCategoryId: slot.rootCategoryId,
          title: slot.title,
        },
        select: {
          id: true,
        },
      });

      await tx.homepageCategorySlotItem.deleteMany({
        where: {
          slotId: savedSlot.id,
          position: {
            notIn: [...itemPositions],
          },
        },
      });

      for (const item of slot.items) {
        if (!item.categoryId) {
          await tx.homepageCategorySlotItem.deleteMany({
            where: {
              position: item.position,
              slotId: savedSlot.id,
            },
          });
          continue;
        }

        await tx.homepageCategorySlotItem.upsert({
          where: {
            slotId_position: {
              position: item.position,
              slotId: savedSlot.id,
            },
          },
          update: {
            categoryId: item.categoryId,
            imageOverride: item.imageOverride,
            labelOverride: item.labelOverride,
          },
          create: {
            categoryId: item.categoryId,
            imageOverride: item.imageOverride,
            labelOverride: item.labelOverride,
            position: item.position,
            slotId: savedSlot.id,
          },
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/shop-by-categories");

  return {
    message: "Shop By Categories saved.",
    status: "success",
  };
}

function parseSlots(formData: FormData): SlotInput[] {
  return slotPositions.map((position) => ({
    items: itemPositions.map((itemPosition) => ({
      categoryId: readString(formData, fieldName(position, itemPosition, "categoryId")),
      imageOverride: readNullableString(
        formData,
        fieldName(position, itemPosition, "imageOverride"),
      ),
      labelOverride: readNullableString(
        formData,
        fieldName(position, itemPosition, "labelOverride"),
      ),
      position: readPosition(
        formData,
        fieldName(position, itemPosition, "position"),
      ),
    })),
    position: readPosition(formData, `slots.${position}.position`),
    rootCategoryId: readString(formData, `slots.${position}.rootCategoryId`),
    title: readString(formData, `slots.${position}.title`),
  }));
}

async function validateSlots(slots: SlotInput[]) {
  if (slots.length !== 4) {
    return "Exactly 4 slots are required.";
  }

  const allCategoryIds = new Set<string>();

  for (const expectedPosition of slotPositions) {
    const slot = slots.find((item) => item.position === expectedPosition);

    if (!slot) {
      return `Slot ${expectedPosition} is missing.`;
    }

    if (!slot.title) {
      return `Slot ${expectedPosition} title is required.`;
    }

    if (!slot.rootCategoryId) {
      return `Slot ${expectedPosition} root category is required.`;
    }

    allCategoryIds.add(slot.rootCategoryId);

    const itemPositionSet = new Set<number>();
    const itemCategorySet = new Set<string>();

    for (const item of slot.items) {
      if (!itemPositions.includes(item.position as (typeof itemPositions)[number])) {
        return `Slot ${expectedPosition} has an invalid item position.`;
      }

      if (itemPositionSet.has(item.position)) {
        return `Slot ${expectedPosition} has duplicate item positions.`;
      }

      itemPositionSet.add(item.position);

      if (!item.categoryId) {
        continue;
      }

      if (itemCategorySet.has(item.categoryId)) {
        return `Slot ${expectedPosition} has duplicate item categories.`;
      }

      itemCategorySet.add(item.categoryId);
      allCategoryIds.add(item.categoryId);
    }

    if (itemPositionSet.size !== 4) {
      return `Slot ${expectedPosition} must submit 4 item rows.`;
    }
  }

  const categoryIds = [...allCategoryIds];
  const categories = await db.category.findMany({
    select: { id: true },
    where: {
      id: { in: categoryIds },
      isActive: true,
    },
  });
  const existingCategoryIds = new Set(categories.map((category) => category.id));

  for (const categoryId of categoryIds) {
    if (!existingCategoryIds.has(categoryId)) {
      return "One or more selected categories no longer exist.";
    }
  }

  return null;
}

function fieldName(
  slotPosition: number,
  itemPosition: number,
  key: "categoryId" | "imageOverride" | "labelOverride" | "position",
) {
  return `slots.${slotPosition}.items.${itemPosition}.${key}`;
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNullableString(formData: FormData, key: string) {
  return readString(formData, key) || null;
}

function readPosition(formData: FormData, key: string) {
  const position = Number.parseInt(readString(formData, key), 10);

  return Number.isFinite(position) ? position : 0;
}
