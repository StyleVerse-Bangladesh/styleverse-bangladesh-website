"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Image as ImageIcon, Loader2, Save, XCircle } from "lucide-react";
import {
  saveShopByCategoriesAction,
  type ShopByCategoriesActionState,
} from "@/app/admin/(panel)/shop-by-categories/actions";
import {
  AdminMediaPicker,
  type AdminMediaPickerItem,
} from "@/components/admin/admin-media-picker";
import { cn } from "@/lib/utils";

export type ShopByCategoryOption = {
  depth: number;
  id: string;
  image: string | null;
  label: string;
  pathKey: string;
};

export type ShopByCategorySlotDraft = {
  items: ShopByCategorySlotItemDraft[];
  position: number;
  rootCategoryId: string;
  title: string;
};

export type ShopByCategorySlotItemDraft = {
  categoryId: string;
  imageOverride: string;
  labelOverride: string;
  position: number;
};

type ShopByCategoriesAdminPageProps = {
  categories: ShopByCategoryOption[];
  slots: ShopByCategorySlotDraft[];
};

const initialActionState: ShopByCategoriesActionState = {};

export function ShopByCategoriesAdminPage({
  categories,
  slots,
}: ShopByCategoriesAdminPageProps) {
  const [state, formAction] = useActionState(
    saveShopByCategoriesAction,
    initialActionState,
  );
  const rootCategories = useMemo(
    () => categories.filter((category) => category.depth === 0),
    [categories],
  );

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-semibold text-sky-700">Product Config</p>
        <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
          Shop By Categories
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-zinc-600">
          Control the four homepage Shop By Category slots. You can update slots
          gradually. Empty item positions use the current homepage fallback item.
        </p>
      </header>

      <form action={formAction} className="grid gap-5">
        <ActionMessage state={state} />
        <div className="grid gap-5 xl:grid-cols-2">
          {slots.map((slot) => (
            <SlotEditor
              categories={categories}
              key={slot.position}
              rootCategories={rootCategories}
              slot={slot}
            />
          ))}
        </div>
        <div className="sticky bottom-0 z-10 flex justify-end border-t border-zinc-200 bg-[#f4f6f8]/95 py-4 backdrop-blur">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SlotEditor({
  categories,
  rootCategories,
  slot,
}: {
  categories: ShopByCategoryOption[];
  rootCategories: ShopByCategoryOption[];
  slot: ShopByCategorySlotDraft;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Slot {slot.position}
          </p>
          <h2 className="text-lg font-black text-zinc-950">{slot.title}</h2>
        </div>
      </div>

      <input name={`slots.${slot.position}.position`} type="hidden" value={slot.position} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Slot Title">
          <input
            className={inputClassName}
            defaultValue={slot.title}
            name={`slots.${slot.position}.title`}
            required
            type="text"
          />
        </FormField>
        <FormField label="Root Category">
          <CategorySelect
            categories={rootCategories}
            defaultValue={slot.rootCategoryId}
            name={`slots.${slot.position}.rootCategoryId`}
            placeholder="Select root category"
            required
          />
        </FormField>
      </div>

      <div className="mt-5 grid gap-3">
        {slot.items.map((item) => (
          <ItemRow
            categories={categories}
            item={item}
            key={item.position}
            slotPosition={slot.position}
          />
        ))}
      </div>
    </section>
  );
}

function ItemRow({
  categories,
  item,
  slotPosition,
}: {
  categories: ShopByCategoryOption[];
  item: ShopByCategorySlotItemDraft;
  slotPosition: number;
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-zinc-950">
        <ImageIcon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
        Item {item.position}
      </div>
      <input
        name={`slots.${slotPosition}.items.${item.position}.position`}
        type="hidden"
        value={item.position}
      />
      <div className="grid gap-3">
        <FormField label="Category">
          <CategorySelect
            categories={categories}
            defaultValue={item.categoryId}
            name={`slots.${slotPosition}.items.${item.position}.categoryId`}
            placeholder="No category selected"
          />
        </FormField>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Label Override">
            <input
              className={inputClassName}
              defaultValue={item.labelOverride}
              name={`slots.${slotPosition}.items.${item.position}.labelOverride`}
              placeholder="Use category label"
              type="text"
            />
          </FormField>
          <ImageOverrideField
            defaultValue={item.imageOverride}
            name={`slots.${slotPosition}.items.${item.position}.imageOverride`}
          />
        </div>
      </div>
    </div>
  );
}

function CategorySelect({
  categories,
  defaultValue,
  name,
  placeholder,
  required,
}: {
  categories: ShopByCategoryOption[];
  defaultValue: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <select
      className={inputClassName}
      defaultValue={defaultValue}
      name={name}
      required={required}
    >
      <option value="">{placeholder}</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {`${"- ".repeat(category.depth)}${category.pathKey}`}
        </option>
      ))}
    </select>
  );
}

function ImageOverrideField({
  defaultValue,
  name,
}: {
  defaultValue: string;
  name: string;
}) {
  const [value, setValue] = useState(defaultValue);

  function handleSelect(file: AdminMediaPickerItem) {
    setValue(file.mediaUrl ?? file.url);
  }

  return (
    <FormField label="Image Override">
      <div className="grid gap-2">
        <input
          className={inputClassName}
          name={name}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Use category image"
          type="text"
          value={value}
        />
        <AdminMediaPicker buttonLabel="Choose Image" onSelect={handleSelect} />
      </div>
    </FormField>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="h-4 w-4" aria-hidden="true" />
      )}
      Save Shop By Categories
    </button>
  );
}

function ActionMessage({ state }: { state: ShopByCategoriesActionState }) {
  if (!state.message || !state.status) {
    return null;
  }

  const Icon = state.status === "success" ? CheckCircle2 : XCircle;

  return (
    <p
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {state.message}
    </p>
  );
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "min-h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm shadow-black/5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10";
