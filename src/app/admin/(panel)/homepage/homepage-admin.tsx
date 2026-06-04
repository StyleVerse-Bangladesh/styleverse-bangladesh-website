"use client";

import Image from "next/image";
import {
  useActionState,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  deleteHomepageItemAction,
  saveHomepageItemAction,
  updateHomepageSectionAction,
  type HomepageActionState,
} from "@/app/admin/(panel)/homepage/actions";
import { cn } from "@/lib/utils";
import type { HomepageSectionType } from "@prisma/client";

export type HomepageAdminSection = {
  id: string;
  isActive: boolean;
  itemCount: number;
  items: HomepageAdminItem[];
  sortOrder: number;
  subtitle: string | null;
  title: string | null;
  type: HomepageSectionType;
};

export type HomepageAdminItem = {
  alt: string | null;
  categoryId: string | null;
  groupTitle: string;
  href: string | null;
  icon: string;
  id: string;
  image: string | null;
  productId: string | null;
  sortOrder: number;
  subtitle: string | null;
  title: string | null;
  tone: string;
};

export type HomepageProductOption = {
  id: string;
  imageUrl: string | null;
  name: string;
  slug: string;
};

export type HomepageCategoryOption = {
  id: string;
  label: string;
  pathKey: string;
};

export type HomepageMediaOption = {
  filename: string;
  id: string;
  previewUrl: string | null;
  url: string;
};

type HomepageAdminPageProps = {
  categories: HomepageCategoryOption[];
  media: HomepageMediaOption[];
  products: HomepageProductOption[];
  sections: HomepageAdminSection[];
};

const initialActionState: HomepageActionState = {};
const featureIconOptions = ["check", "truck", "refresh", "headphones"];

export function HomepageAdminPage({
  categories,
  media,
  products,
  sections,
}: HomepageAdminPageProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">CMS</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Homepage CMS
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Control homepage merchandising sections from database-backed content.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Sections" value={String(sections.length)} />
          <StatTile
            label="Active"
            value={String(sections.filter((section) => section.isActive).length)}
          />
          <StatTile
            label="Items"
            value={String(sections.reduce((total, section) => total + section.itemCount, 0))}
          />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="border-b border-zinc-200 p-4 sm:p-5">
          <h2 className="text-lg font-black text-zinc-950">Sections</h2>
          <p className="text-sm text-zinc-500">
            Update section titles, active state, sort order, and items.
          </p>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Section Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Sort Order</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sections.map((section) => (
                <tr className="align-top" key={section.id}>
                  <td className="px-4 py-4 font-black text-zinc-950">
                    {formatSectionType(section.type)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-800">
                      {section.title || "Untitled"}
                    </p>
                    {section.subtitle ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        {section.subtitle}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill active={section.isActive} />
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-700">
                    {section.sortOrder}
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-700">
                    {section.itemCount}
                  </td>
                  <td className="px-4 py-4">
                    <a
                      className={secondaryButtonClassName}
                      href={`#homepage-section-${section.id}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 xl:hidden">
          {sections.map((section) => (
            <article
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5"
              key={section.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black text-zinc-950">
                    {formatSectionType(section.type)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {section.title || "Untitled"}
                  </p>
                </div>
                <StatusPill active={section.isActive} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
                <span>Sort {section.sortOrder}</span>
                <span>{section.itemCount} items</span>
              </div>
              <a
                className={cn(secondaryButtonClassName, "mt-4")}
                href={`#homepage-section-${section.id}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </a>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-5">
        {sections.map((section) => (
          <SectionEditor
            categories={categories}
            key={section.id}
            media={media}
            products={products}
            section={section}
          />
        ))}
      </div>
    </div>
  );
}

function SectionEditor({
  categories,
  media,
  products,
  section,
}: {
  categories: HomepageCategoryOption[];
  media: HomepageMediaOption[];
  products: HomepageProductOption[];
  section: HomepageAdminSection;
}) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5"
      id={`homepage-section-${section.id}`}
    >
      <details className="group" open={section.type === "HERO"}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">
              {formatSectionType(section.type)}
            </h2>
            <p className="text-sm text-zinc-500">
              {section.itemCount} items, sort order {section.sortOrder}
            </p>
          </div>
          <ChevronDown
            className="h-5 w-5 shrink-0 text-zinc-500 transition group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="grid gap-5 p-4 sm:p-5">
          <SectionForm section={section} />

          <div className="grid gap-3">
            <h3 className="text-base font-black text-zinc-950">Items</h3>
            {section.items.length ? (
              section.items.map((item) => (
                <ItemEditor
                  categories={categories}
                  item={item}
                  key={item.id}
                  media={media}
                  products={products}
                  section={section}
                />
              ))
            ) : (
              <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-500">
                No items yet.
              </p>
            )}
          </div>

          <details className="rounded-lg border border-zinc-200 bg-zinc-50">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-sm font-semibold text-zinc-800">
              <Plus className="h-4 w-4 text-sky-700" aria-hidden="true" />
              Add item
            </summary>
            <div className="border-t border-zinc-200 bg-white p-3">
              <ItemForm
                categories={categories}
                media={media}
                products={products}
                section={section}
                submitLabel="Add item"
              />
            </div>
          </details>
        </div>
      </details>
    </section>
  );
}

function SectionForm({ section }: { section: HomepageAdminSection }) {
  const [state, formAction] = useActionState(
    updateHomepageSectionAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <input name="id" type="hidden" value={section.id} />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]">
        <FormField label="Title">
          <input
            className={inputClassName}
            defaultValue={section.title ?? ""}
            name="title"
            type="text"
          />
        </FormField>
        <FormField label="Subtitle">
          <input
            className={inputClassName}
            defaultValue={section.subtitle ?? ""}
            name="subtitle"
            type="text"
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={String(section.sortOrder)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>
      <label className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800">
        <input
          className="h-4 w-4 accent-zinc-950"
          defaultChecked={section.isActive}
          name="isActive"
          type="checkbox"
        />
        Active
      </label>
      <ActionMessage state={state} />
      <SubmitButton icon={Save} label="Save section" />
    </form>
  );
}

function ItemEditor({
  categories,
  item,
  media,
  products,
  section,
}: {
  categories: HomepageCategoryOption[];
  item: HomepageAdminItem;
  media: HomepageMediaOption[];
  products: HomepageProductOption[];
  section: HomepageAdminSection;
}) {
  return (
    <details className="group rounded-lg border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <ItemThumb item={item} products={products} />
          <div className="min-w-0">
            <p className="truncate font-black text-zinc-950">
              {item.title || getProductName(products, item.productId) || "Untitled item"}
            </p>
            <p className="text-xs font-semibold text-zinc-500">
              Sort {item.sortOrder}
            </p>
          </div>
        </div>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-zinc-500 transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="grid gap-3 border-t border-zinc-200 p-3">
        <ItemForm
          categories={categories}
          item={item}
          media={media}
          products={products}
          section={section}
          submitLabel="Save item"
        />
        <DeleteItemForm item={item} />
      </div>
    </details>
  );
}

function ItemForm({
  categories,
  item,
  media,
  products,
  section,
  submitLabel,
}: {
  categories: HomepageCategoryOption[];
  item?: HomepageAdminItem;
  media: HomepageMediaOption[];
  products: HomepageProductOption[];
  section: HomepageAdminSection;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(
    saveHomepageItemAction,
    initialActionState,
  );
  const isHero = section.type === "HERO";
  const isFeature = section.type === "FEATURE_STRIP";
  const isCategory = section.type === "CATEGORY_GROUP";
  const isProduct =
    section.type === "NEW_ARRIVALS" ||
    section.type === "RECOMMENDED_PRODUCTS";

  return (
    <form action={formAction} className="grid gap-4">
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <input name="sectionId" type="hidden" value={section.id} />
      <input name="sectionType" type="hidden" value={section.type} />

      {isProduct ? (
        <FormField label="Product">
          <select
            className={inputClassName}
            defaultValue={(state.values?.productId as string | undefined) ?? item?.productId ?? ""}
            name="productId"
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.slug})
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Title">
          <input
            className={inputClassName}
            defaultValue={(state.values?.title as string | undefined) ?? item?.title ?? ""}
            name="title"
            required={isHero || isFeature || isCategory}
            type="text"
          />
        </FormField>
        <FormField label="Subtitle">
          <input
            className={inputClassName}
            defaultValue={(state.values?.subtitle as string | undefined) ?? item?.subtitle ?? ""}
            name="subtitle"
            type="text"
          />
        </FormField>
      </div>

      {isHero ? (
        <div className="grid gap-4 md:grid-cols-2">
          <MediaPickerField
            defaultValue={(state.values?.image as string | undefined) ?? item?.image ?? ""}
            media={media}
            required
          />
          <FormField label="Alt Text">
            <input
              className={inputClassName}
              defaultValue={(state.values?.alt as string | undefined) ?? item?.alt ?? ""}
              name="alt"
              type="text"
            />
          </FormField>
        </div>
      ) : null}

      {isFeature ? (
        <FormField label="Icon">
          <select
            className={inputClassName}
            defaultValue={item?.icon ?? "check"}
            name="icon"
          >
            {featureIconOptions.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      {isCategory ? (
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Category">
            <select
              className={inputClassName}
              defaultValue={(state.values?.categoryId as string | undefined) ?? item?.categoryId ?? ""}
              name="categoryId"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.pathKey}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Group">
            <input
              className={inputClassName}
              defaultValue={item?.groupTitle ?? ""}
              name="groupTitle"
              type="text"
            />
          </FormField>
          <FormField label="Tone">
            <input
              className={inputClassName}
              defaultValue={item?.tone ?? ""}
              name="tone"
              type="text"
            />
          </FormField>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField label="Href">
          <input
            className={inputClassName}
            defaultValue={(state.values?.href as string | undefined) ?? item?.href ?? ""}
            name="href"
            type="text"
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={(state.values?.sortOrder as string | undefined) ?? String(item?.sortOrder ?? 0)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>

      <ActionMessage state={state} />
      <SubmitButton icon={item ? Save : Plus} label={submitLabel} />
    </form>
  );
}

function MediaPickerField({
  defaultValue,
  media,
  required,
}: {
  defaultValue: string;
  media: HomepageMediaOption[];
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState(media);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function searchMedia() {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/admin/media/api?search=${encodeURIComponent(query)}`,
      );
      const payload = await response.json() as { files?: HomepageMediaOption[] };

      setFiles(payload.files ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormField label="Image URL">
      <div className="grid gap-2">
        <div className="flex gap-2">
          <input
            className={inputClassName}
            name="image"
            onChange={(event) => setValue(event.target.value)}
            required={required}
            type="text"
            value={value}
          />
          <button
            className={secondaryIconButtonClassName}
            onClick={() => setIsOpen(true)}
            type="button"
            title="Choose media"
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {value ? (
          <div className="relative h-24 w-40 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
            <Image alt="" className="object-cover" fill src={value} unoptimized />
          </div>
        ) : null}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="grid max-h-[80vh] w-full max-w-3xl gap-4 overflow-hidden rounded-lg bg-white p-4 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-zinc-950">Choose Media</h3>
              <button
                className={secondaryButtonClassName}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2">
              <input
                className={inputClassName}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search filename"
                type="search"
                value={query}
              />
              <button
                className={primaryButtonClassName}
                disabled={isLoading}
                onClick={searchMedia}
                type="button"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                Search
              </button>
            </div>
            <div className="grid max-h-[52vh] gap-3 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <button
                  className="grid gap-2 rounded-md border border-zinc-200 bg-white p-2 text-left text-sm shadow-sm shadow-black/5 transition hover:border-zinc-400"
                  key={file.id}
                  onClick={() => {
                    setValue(file.url);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <div className="relative aspect-video overflow-hidden rounded bg-zinc-100">
                    {file.previewUrl ? (
                      <Image
                        alt={file.filename}
                        className="object-cover"
                        fill
                        src={file.previewUrl}
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <span className="truncate font-semibold text-zinc-700">
                    {file.filename}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </FormField>
  );
}

function DeleteItemForm({ item }: { item: HomepageAdminItem }) {
  const [state, formAction] = useActionState(
    deleteHomepageItemAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={item.id} />
      <button className={dangerButtonClassName} type="submit">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete item
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

function ItemThumb({
  item,
  products,
}: {
  item: HomepageAdminItem;
  products: HomepageProductOption[];
}) {
  const productImage = products.find((product) => product.id === item.productId)?.imageUrl;
  const image = item.image ?? productImage;

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-zinc-400">
      {image ? (
        <Image
          alt={item.title ?? "Homepage item"}
          className="h-full w-full object-cover"
          height={56}
          src={image}
          unoptimized
          width={56}
        />
      ) : (
        <ImageIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function getProductName(products: HomepageProductOption[], productId: string | null) {
  return products.find((product) => product.id === productId)?.name;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
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
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitButton({
  icon: Icon,
  label,
}: {
  icon: typeof Save;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={primaryButtonClassName} disabled={pending} type="submit">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: HomepageActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-semibold",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

function formatSectionType(type: HomepageSectionType) {
  if (type === "CATEGORY_GROUP") {
    return "Shop By Category";
  }

  if (type === "RECOMMENDED_PRODUCTS") {
    return "Product You May Like";
  }

  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";

const secondaryIconButtonClassName =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";

const dangerButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 sm:w-fit";
