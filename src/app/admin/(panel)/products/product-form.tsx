"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  Check,
  ImageIcon,
  ImageOff,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { ProductFormActionState } from "@/app/admin/(panel)/products/actions";
import { cn } from "@/lib/utils";

export type ProductFormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProductFormGender = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
export type ProductFormInventoryStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "PRE_ORDER";

export type ProductFormCategoryOption = {
  depth: number;
  id: string;
  label: string;
  pathKey: string;
};

export type ProductFormImage = {
  alt: string;
  isPrimary: boolean;
  key: string;
  url: string;
};

export type ProductFormVariant = {
  colorName: string;
  colorValue: string;
  id: string;
  key: string;
  lowStockThreshold: string;
  preorderLimit: string;
  preorderShipsAt: string;
  size: string;
  sku: string;
  status: ProductFormInventoryStatus;
  stock: string;
};

export type ProductFormValues = {
  additionalCategoryIds: string[];
  compareAtPrice: string;
  description: string;
  gender: ProductFormGender;
  id?: string;
  images: ProductFormImage[];
  name: string;
  price: string;
  primaryCategoryId: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: ProductFormStatus;
  variants: ProductFormVariant[];
};

type MediaPickerItem = {
  filename: string;
  id: string;
  isCloudinary: boolean;
  isLegacyLocal: boolean;
  isLegacyLocalMissing: boolean;
  mediaUrl: string | null;
  mimeType: string;
  previewUrl: string | null;
  selectable: boolean;
  sizeLabel: string;
  sourceLabel: string;
  uploadedAt: string;
  url: string;
  warning: string | null;
};

type ProductFormPageProps = {
  action: (
    state: ProductFormActionState,
    formData: FormData,
  ) => Promise<ProductFormActionState>;
  categories: ProductFormCategoryOption[];
  mode: "create" | "edit";
  product: ProductFormValues;
};

const initialActionState: ProductFormActionState = {};
const productGenders: ProductFormGender[] = ["MEN", "WOMEN", "KIDS", "UNISEX"];
const inventoryStatuses: ProductFormInventoryStatus[] = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "PRE_ORDER",
];
const productFormSections = [
  { id: "general", label: "General" },
  { id: "media", label: "Media Contents" },
  { id: "description", label: "Description" },
  { id: "seo", label: "SEO Content" },
  { id: "inventory", label: "Inventory" },
] as const;

type ProductFormSectionId = (typeof productFormSections)[number]["id"];

export function ProductFormPage({
  action,
  categories,
  mode,
  product,
}: ProductFormPageProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [activeSection, setActiveSection] =
    useState<ProductFormSectionId>("general");
  const [categorySearch, setCategorySearch] = useState("");
  const [images, setImages] = useState<ProductFormImage[]>(
    product.images.length ? product.images : [createBlankImage(true)],
  );
  const [productStatus, setProductStatus] = useState<
    Extract<ProductFormStatus, "PUBLISHED" | "ARCHIVED">
  >(product.status === "PUBLISHED" ? "PUBLISHED" : "ARCHIVED");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    product.primaryCategoryId,
  );
  const [additionalCategoryIds, setAdditionalCategoryIds] = useState(
    () => new Set(product.additionalCategoryIds),
  );
  const [variants, setVariants] = useState<ProductFormVariant[]>(
    product.variants.length ? product.variants : [createBlankVariant()],
  );
  const title = mode === "create" ? "Add New Product" : "Edit Product";
  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();

    if (!search) {
      return categories;
    }

    return categories.filter((category) =>
      `${category.label} ${category.pathKey}`.toLowerCase().includes(search),
    );
  }, [categories, categorySearch]);
  const additionalCategoryInputs = Array.from(additionalCategoryIds).filter(
    (categoryId) => categoryId !== primaryCategoryId,
  );

  function activateSection(sectionId: ProductFormSectionId) {
    setActiveSection(sectionId);
    document
      .getElementById("product-form-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleCategory(categoryId: string) {
    if (categoryId === primaryCategoryId) {
      setAdditionalCategoryIds((current) => {
        const next = new Set(current);
        next.delete(categoryId);
        const [nextPrimaryCategoryId] = Array.from(next);
        setPrimaryCategoryId(nextPrimaryCategoryId ?? "");

        if (nextPrimaryCategoryId) {
          next.delete(nextPrimaryCategoryId);
        }

        return next;
      });
      return;
    }

    if (!primaryCategoryId) {
      setPrimaryCategoryId(categoryId);
      return;
    }

    setAdditionalCategoryIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  }

  return (
    <div className="grid gap-6">
      <header className="min-w-0">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
          href="/admin/products"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Products
        </Link>
        <h1 className="mt-3 text-2xl font-black text-zinc-950 sm:text-3xl">
          {title}
        </h1>
      </header>

      <form
        action={formAction}
        className="grid gap-4 xl:grid-cols-[12.5rem_minmax(0,1fr)_24rem] xl:items-start 2xl:grid-cols-[13rem_minmax(0,1fr)_25rem]"
        noValidate
      >
        {product.id ? <input name="id" type="hidden" value={product.id} /> : null}
        <input
          name="status"
          type="hidden"
          value={productStatus}
        />
        <input name="primaryCategoryId" type="hidden" value={primaryCategoryId} />
        {additionalCategoryInputs.map((categoryId) => (
          <input
            key={categoryId}
            name="additionalCategoryIds"
            type="hidden"
            value={categoryId}
          />
        ))}

        <nav
          aria-label="Product form sections"
          className="sticky top-4 z-10 -mx-4 overflow-x-auto px-4 xl:top-6 xl:mx-0 xl:overflow-visible xl:px-0"
        >
          <div className="flex min-w-max gap-2 xl:grid xl:min-w-0">
            {productFormSections.map((section) => (
              <button
                className={cn(
                  "inline-flex min-h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 ring-1 ring-zinc-200 transition hover:text-zinc-950 xl:w-full xl:justify-start",
                  activeSection === section.id &&
                    "text-sky-700 ring-sky-100 shadow-md shadow-black/5",
                )}
                key={section.id}
                onClick={() => activateSection(section.id)}
                type="button"
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        <div
          className={cn(
            "grid gap-4",
            !["general", "media", "description"].includes(activeSection) &&
              "xl:col-span-2",
          )}
          id="product-form-panel"
        >
          <ProductFormCard
            className={cn(activeSection !== "general" && "hidden")}
            id="general"
            title="General"
          >
            <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center">
              <FieldLabel>Name</FieldLabel>
              <input
                className={inputClassName}
                defaultValue={product.name}
                name="name"
                required
                type="text"
              />

              <FieldLabel>Slug</FieldLabel>
              <div className="grid gap-1.5">
                <input
                  className={inputClassName}
                  defaultValue={product.slug}
                  name="slug"
                  required
                  type="text"
                />
                <p className="text-xs italic text-zinc-500">
                  Use product name in slug.
                </p>
              </div>

              <FieldLabel>Type</FieldLabel>
              <select className={inputClassName} disabled defaultValue="simple">
                <option value="simple">Simple Product</option>
              </select>

              <FieldLabel>Audience</FieldLabel>
              <select
                className={inputClassName}
                defaultValue={product.gender}
                name="gender"
              >
                {productGenders.map((gender) => (
                  <option key={gender} value={gender}>
                    {formatEnumLabel(gender)}
                  </option>
                ))}
              </select>

              <FieldLabel>Attributes</FieldLabel>
              <div className="flex min-h-11 items-center rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm font-semibold text-zinc-400">
                Attribute configuration is coming soon.
              </div>

              <FieldLabel>Regular Price</FieldLabel>
              <CurrencyInput
                defaultValue={product.compareAtPrice}
                name="compareAtPrice"
              />

              <FieldLabel>Sale Price</FieldLabel>
              <CurrencyInput defaultValue={product.price} name="price" required />
            </div>
          </ProductFormCard>

          <ProductFormCard
            className={cn(activeSection !== "media" && "hidden")}
            id="media"
            title="Media Contents"
          >
            <MediaContentsPanel images={images} onImagesChange={setImages} />
          </ProductFormCard>

          <ProductFormCard
            className={cn(activeSection !== "description" && "hidden")}
            id="description"
            title="Product Description"
          >
            <ProductDescriptionPanel description={product.description} />
          </ProductFormCard>

          <ProductFormCard
            className={cn(activeSection !== "seo" && "hidden")}
            id="seo"
            title="SEO Contents"
          >
            <SeoContentPanel
              seoDescription={product.seoDescription}
              seoTitle={product.seoTitle}
            />
          </ProductFormCard>

          <ProductFormCard
            className={cn(activeSection !== "inventory" && "hidden")}
            id="inventory"
            title="Inventory"
          >
            <div className="grid gap-3">
              {variants.map((variant) => (
                <VariantRow
                  key={variant.key}
                  onChange={(nextVariant) =>
                    setVariants((current) =>
                      current.map((item) =>
                        item.key === variant.key ? nextVariant : item,
                      ),
                    )
                  }
                  onRemove={() =>
                    setVariants((current) =>
                      current.filter((item) => item.key !== variant.key),
                    )
                  }
                  variant={variant}
                />
              ))}
            </div>
            <button
              className={secondaryButtonClassName}
              onClick={() =>
                setVariants((current) => [...current, createBlankVariant()])
              }
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add variant
            </button>
          </ProductFormCard>

          <ActionMessage state={state} />

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200 bg-[#f4f6f8]/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <SubmitButton label={mode === "create" ? "Submit" : "Save product"} />
          </div>
        </div>

        <div
          className={cn(
            "grid gap-4 xl:sticky xl:top-6",
            !["general", "media", "description"].includes(activeSection) &&
              "hidden",
          )}
        >
          <aside className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
            <h2 className="border-b border-zinc-200 px-4 py-3 text-base font-black text-zinc-950">
              Product Status
            </h2>
            <div className="grid gap-5 p-4">
              <ToggleRow
                checked={productStatus === "PUBLISHED"}
                label="Publish Product"
                onChange={(checked) =>
                  setProductStatus(checked ? "PUBLISHED" : "ARCHIVED")
                }
              />
              {productStatus === "ARCHIVED" ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  This product is archived. Turn on Publish Product to publish
                  it, or save without changing status to keep it archived.
                </p>
              ) : null}
              <ToggleRow
                checked={false}
                disabled
                helperText="Coming soon"
                label="Show in Products Page"
              />
            </div>
          </aside>

          <aside className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
            <h2 className="border-b border-zinc-200 px-4 py-3 text-base font-black text-zinc-950">
              Categories
            </h2>
            <div className="grid gap-4 p-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <input
                  className={cn(inputClassName, "pl-9")}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="Search Category"
                  type="search"
                  value={categorySearch}
                />
              </div>
              <div className="max-h-80 overflow-y-auto rounded-md border border-zinc-200 bg-white p-3">
                {filteredCategories.length ? (
                  <div className="grid gap-2">
                    {filteredCategories.map((category) => {
                      const checked =
                        category.id === primaryCategoryId ||
                        additionalCategoryIds.has(category.id);
                      const isPrimary = category.id === primaryCategoryId;

                      return (
                        <label
                          className="flex min-h-8 items-start gap-2 text-sm font-semibold text-zinc-700"
                          key={category.id}
                          style={{
                            paddingLeft: `${Math.min(category.depth, 4) * 16}px`,
                          }}
                        >
                          <input
                            checked={checked}
                            className="mt-1 h-4 w-4 rounded border-zinc-300 accent-zinc-950"
                            onChange={() => toggleCategory(category.id)}
                            type="checkbox"
                          />
                          <span className="min-w-0">
                            <span className="break-words text-zinc-800">
                              {category.label}
                              {isPrimary ? (
                                <span className="ml-2 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-sky-700">
                                  Primary
                                </span>
                              ) : null}
                            </span>
                            <span className="block break-words font-mono text-xs font-medium text-zinc-400">
                              {category.pathKey}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm font-semibold text-zinc-500">
                    No categories match your search.
                  </p>
                )}
              </div>
              {!primaryCategoryId ? (
                <p className="text-xs font-semibold text-red-600">
                  Select at least one category. The first selected category is
                  submitted as primary.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function ProductFormCard({
  children,
  className,
  id,
  title,
}: {
  children: ReactNode;
  className?: string;
  id: ProductFormSectionId;
  title: string;
}) {
  return (
    <section
      className={cn(
        "scroll-mt-24 rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5",
        className,
      )}
      id={`product-form-${id}`}
    >
      <h2 className="border-b border-zinc-200 px-4 py-3 text-lg font-black text-zinc-950 sm:px-5">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-black text-zinc-950 lg:py-3">{children}</span>
  );
}

function CurrencyInput({
  defaultValue,
  name,
  required = false,
}: {
  defaultValue: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm shadow-black/5 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10">
      <span className="flex min-h-11 items-center justify-center border-r border-zinc-200 bg-zinc-50 text-sm font-black text-zinc-700">
        Tk
      </span>
      <input
        className="min-h-11 w-full bg-white px-3 text-sm font-medium text-zinc-950 outline-none"
        defaultValue={defaultValue}
        min="0"
        name={name}
        required={required}
        step="0.01"
        type="number"
      />
    </div>
  );
}

function ToggleRow({
  checked,
  disabled = false,
  helperText,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  helperText?: string;
  label: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="grid gap-2">
      <label
        className={cn(
          "flex items-center justify-between gap-3 text-sm font-semibold text-zinc-950",
          disabled && "text-zinc-400",
        )}
      >
        <span>{label}</span>
        <button
          aria-checked={checked}
          className={cn(
            "relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition",
            checked ? "bg-zinc-950" : "bg-zinc-300",
            disabled && "cursor-not-allowed opacity-70",
          )}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          role="switch"
          type="button"
        >
          <span
            className={cn(
              "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      </label>
      {helperText ? (
        <p className="text-xs font-semibold text-zinc-400">{helperText}</p>
      ) : null}
    </div>
  );
}

function ProductDescriptionPanel({
  description,
}: {
  description: string;
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <FieldLabel>Description</FieldLabel>
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm shadow-black/5 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10">
          <div
            aria-hidden="true"
            className="flex min-h-12 flex-wrap items-center gap-1 border-b border-zinc-200 bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-500"
          >
            {["B", "I", "U"].map((label) => (
              <span
                className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-transparent px-2 text-zinc-600"
                key={label}
              >
                {label}
              </span>
            ))}
            <span className="h-5 w-px bg-zinc-300" />
            {["Left", "Center", "Right", "Justify"].map((label) => (
              <span
                className="inline-flex h-7 items-center rounded border border-transparent px-2"
                key={label}
              >
                {label}
              </span>
            ))}
            <span className="h-5 w-px bg-zinc-300" />
            {["List", "Order"].map((label) => (
              <span
                className="inline-flex h-7 items-center rounded border border-transparent px-2"
                key={label}
              >
                {label}
              </span>
            ))}
            {["Font Size...", "Font Family...", "Font Format"].map((label) => (
              <span
                className="inline-flex h-7 min-w-24 items-center justify-between rounded border border-zinc-300 bg-white px-2 text-zinc-500"
                key={label}
              >
                {label}
                <span className="ml-2 text-[10px]">v</span>
              </span>
            ))}
            {["Link", "Image", "Table"].map((label) => (
              <span
                className="inline-flex h-7 items-center rounded border border-transparent px-2"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
          <textarea
            className="min-h-36 w-full resize-y border-0 bg-white px-3 py-3 text-sm font-medium leading-6 text-zinc-950 outline-none"
            defaultValue={description}
            name="description"
            placeholder="Write product details, material notes, fit guidance, and care instructions."
          />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <FieldLabel>Summary</FieldLabel>
        <textarea
          className={cn(inputClassName, "min-h-28 resize-y py-3")}
          disabled
          placeholder="Summary support is coming soon."
        />
      </div>
    </div>
  );
}

function SeoContentPanel({
  seoDescription,
  seoTitle,
}: {
  seoDescription: string;
  seoTitle: string;
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center">
        <FieldLabel>Meta Title</FieldLabel>
        <input
          className={inputClassName}
          defaultValue={seoTitle}
          name="seoTitle"
          type="text"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <FieldLabel>Meta Description</FieldLabel>
        <textarea
          className={cn(inputClassName, "min-h-32 resize-y py-3")}
          defaultValue={seoDescription}
          name="seoDescription"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
        <FieldLabel>Meta Keywords</FieldLabel>
        <div className="grid gap-1.5">
          <input className={inputClassName} type="text" />
          <p className="text-sm font-medium text-zinc-500">
            Type , as separator or hit enter among keywords
          </p>
        </div>
      </div>
    </div>
  );
}

function MediaContentsPanel({
  images,
  onImagesChange,
}: {
  images: ProductFormImage[];
  onImagesChange: Dispatch<SetStateAction<ProductFormImage[]>>;
}) {
  const primaryImageIndex = Math.max(
    images.findIndex((image) => image.isPrimary),
    0,
  );
  const primaryImage = images[primaryImageIndex] ?? createBlankImage(true);
  const galleryImages = images
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== primaryImageIndex);

  function updateImage(imageKey: string, nextImage: ProductFormImage) {
    onImagesChange((current) =>
      current.map((image) => (image.key === imageKey ? nextImage : image)),
    );
  }

  function selectMainImage(file: MediaPickerItem) {
    updateImage(primaryImage.key, {
      ...primaryImage,
      alt: primaryImage.alt || file.filename,
      isPrimary: true,
      url: file.mediaUrl ?? file.url,
    });
  }

  function addGalleryImage(file: MediaPickerItem) {
    onImagesChange((current) => [
      ...current,
      {
        ...createBlankImage(current.length === 0),
        alt: file.filename,
        isPrimary: current.length === 0,
        url: file.mediaUrl ?? file.url,
      },
    ]);
  }

  function addBlankGalleryImage() {
    onImagesChange((current) => [
      ...current,
      createBlankImage(current.length === 0),
    ]);
  }

  function makePrimary(imageKey: string) {
    onImagesChange((current) =>
      current.map((image) => ({
        ...image,
        isPrimary: image.key === imageKey,
      })),
    );
  }

  return (
    <div className="grid gap-5">
      <input name="primaryImageIndex" type="hidden" value={primaryImageIndex} />
      {images.map((image) => (
        <div hidden key={image.key}>
          <input name="imageUrl" readOnly type="hidden" value={image.url} />
          <input name="imageAlt" readOnly type="hidden" value={image.alt} />
        </div>
      ))}

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <FieldLabel>Main Image</FieldLabel>
        <div className="grid gap-3">
          <div className="relative flex aspect-square w-full max-w-[13rem] items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-200 bg-white text-zinc-300">
            {primaryImage.url ? (
              <Image
                alt={primaryImage.alt || "Selected main product image"}
                className="h-full w-full object-cover"
                height={240}
                src={primaryImage.url}
                unoptimized
                width={240}
              />
            ) : (
              <ImageIcon className="h-16 w-16 stroke-[1.4]" aria-hidden="true" />
            )}
            <MediaPickerButton
              ariaLabel="Choose main product image"
              className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-black/20 transition hover:bg-slate-800"
              onSelect={selectMainImage}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </MediaPickerButton>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Main image URL"
              className={inputClassName}
              onChange={(event) =>
                updateImage(primaryImage.key, {
                  ...primaryImage,
                  url: event.target.value,
                })
              }
              placeholder="Main image URL"
              type="url"
              value={primaryImage.url}
            />
            <input
              aria-label="Main image alt text"
              className={inputClassName}
              onChange={(event) =>
                updateImage(primaryImage.key, {
                  ...primaryImage,
                  alt: event.target.value,
                })
              }
              placeholder="Alt text"
              type="text"
              value={primaryImage.alt}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <FieldLabel>Gallery Images</FieldLabel>
        <div className="grid gap-3">
          <div className="min-h-32 rounded-lg border border-dashed border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap gap-3">
              <MediaPickerButton
                ariaLabel="Upload gallery image"
                className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-md border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                onSelect={addGalleryImage}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Upload
              </MediaPickerButton>

              {galleryImages.map(({ image, index }) => (
                <div className="grid w-28 gap-2" key={image.key}>
                  <div className="relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                    {image.url ? (
                      <Image
                        alt={image.alt || "Gallery product image"}
                        className="h-full w-full object-cover"
                        height={112}
                        src={image.url}
                        unoptimized
                        width={112}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-300">
                        <ImageIcon
                          className="h-8 w-8 stroke-[1.4]"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="min-h-8 flex-1 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-600 shadow-sm shadow-black/5 transition hover:text-zinc-950"
                      onClick={() => makePrimary(image.key)}
                      type="button"
                    >
                      Main
                    </button>
                    <button
                      aria-label={`Remove gallery image ${index + 1}`}
                      className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 shadow-sm shadow-black/5 transition hover:bg-red-50"
                      onClick={() =>
                        onImagesChange((current) =>
                          removeImageRow(current, image.key),
                        )
                      }
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {galleryImages.length ? (
            <div className="grid gap-3">
              {galleryImages.map(({ image }, displayIndex) => (
                <div
                  className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-2"
                  key={image.key}
                >
                  <input
                    aria-label={`Gallery image ${displayIndex + 1} URL`}
                    className={inputClassName}
                    onChange={(event) =>
                      updateImage(image.key, {
                        ...image,
                        url: event.target.value,
                      })
                    }
                    placeholder="Gallery image URL"
                    type="url"
                    value={image.url}
                  />
                  <input
                    aria-label={`Gallery image ${displayIndex + 1} alt text`}
                    className={inputClassName}
                    onChange={(event) =>
                      updateImage(image.key, {
                        ...image,
                        alt: event.target.value,
                      })
                    }
                    placeholder="Alt text"
                    type="text"
                    value={image.alt}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <button
            className={secondaryButtonClassName}
            onClick={addBlankGalleryImage}
            type="button"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Add image URL
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <FieldLabel>Video</FieldLabel>
        <div className="grid gap-1.5">
          <input
            className={inputClassName}
            placeholder="https://www.youtube.com/embed/..."
            type="url"
          />
          <p className="text-sm font-medium text-zinc-500">
            Only youtube embed link is allowed
          </p>
        </div>
      </div>
    </div>
  );
}

function MediaPickerButton({
  ariaLabel,
  children,
  className,
  onSelect,
}: {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  onSelect: (file: MediaPickerItem) => void;
}) {
  const [error, setError] = useState("");
  const [files, setFiles] = useState<MediaPickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const params = new URLSearchParams();
      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      setError("");
      setLoading(true);

      try {
        const query = params.toString();
        const response = await fetch(
          `/admin/media/api${query ? `?${query}` : ""}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Could not load media.");
        }

        const data = (await response.json()) as { files: MediaPickerItem[] };
        setFiles(data.files);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError("Could not load media.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 160);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [open, search]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label={ariaLabel}
          className={className ?? secondaryButtonClassName}
          type="button"
        >
          {children ?? (
            <>
              <Images className="h-4 w-4" aria-hidden="true" />
              Choose From Media Library
            </>
          )}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/45 data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] grid max-h-[86vh] w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-xl shadow-black/20 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-black text-zinc-950">
                Media Library
              </Dialog.Title>
              <p className="text-sm text-zinc-500">
                Select an image for this product row.
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close media library"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50"
                type="button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              className={cn(inputClassName, "pl-9")}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search filename"
              type="search"
              value={search}
            />
          </div>

          <div className="min-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3">
            {loading ? (
              <div className="flex min-h-60 items-center justify-center text-sm font-semibold text-zinc-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Loading media
              </div>
            ) : error ? (
              <div className="flex min-h-60 items-center justify-center text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : files.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <button
                    className={cn(
                      "grid gap-3 rounded-md border border-zinc-200 bg-white p-3 text-left shadow-sm shadow-black/5 transition focus:outline-none focus:ring-2 focus:ring-zinc-950/15",
                      file.selectable
                        ? "hover:border-zinc-950"
                        : "cursor-not-allowed opacity-70",
                    )}
                    disabled={!file.selectable}
                    key={file.id}
                    onClick={() => {
                      onSelect(file);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    <div className="aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                      {file.previewUrl ? (
                        <Image
                          alt={file.filename}
                          className="h-full w-full object-cover"
                          height={240}
                          src={file.previewUrl}
                          unoptimized
                          width={240}
                        />
                      ) : (
                        <div className="flex h-full min-h-48 flex-col items-center justify-center text-center text-zinc-400">
                          <ImageOff className="h-6 w-6" aria-hidden="true" />
                          <span className="mt-2 px-3 text-xs font-semibold">
                            Preview unavailable
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black text-zinc-950">
                        {file.filename}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        {file.sizeLabel}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <MediaSourcePill file={file} />
                        {file.warning ? (
                          <span className="inline-flex h-7 w-fit items-center rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700">
                            {file.warning}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold",
                        file.selectable
                          ? "bg-zinc-950 text-white"
                          : "bg-zinc-200 text-zinc-500",
                      )}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {file.selectable ? "Select" : "Unavailable"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-60 flex-col items-center justify-center text-center">
                <ImageOff className="h-6 w-6 text-zinc-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-zinc-600">
                  No media found
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MediaSourcePill({ file }: { file: MediaPickerItem }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        file.isCloudinary
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : file.isLegacyLocal
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-zinc-200 bg-zinc-50 text-zinc-600",
      )}
    >
      {file.sourceLabel}
    </span>
  );
}

function VariantRow({
  onChange,
  onRemove,
  variant,
}: {
  onChange: (variant: ProductFormVariant) => void;
  onRemove: () => void;
  variant: ProductFormVariant;
}) {
  const isPreorder = variant.status === "PRE_ORDER";

  return (
    <div className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <input name="variantId" type="hidden" value={variant.id} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Size">
          <input
            className={inputClassName}
            name="variantSize"
            onChange={(event) =>
              onChange({ ...variant, size: event.target.value })
            }
            type="text"
            value={variant.size}
          />
        </FormField>
        <FormField label="Color">
          <input
            className={inputClassName}
            name="variantColorName"
            onChange={(event) =>
              onChange({ ...variant, colorName: event.target.value })
            }
            type="text"
            value={variant.colorName}
          />
        </FormField>
        <FormField label="Color Value">
          <input
            className={inputClassName}
            name="variantColorValue"
            onChange={(event) =>
              onChange({ ...variant, colorValue: event.target.value })
            }
            type="text"
            value={variant.colorValue}
          />
        </FormField>
        <FormField label="SKU">
          <input
            className={inputClassName}
            name="variantSku"
            onChange={(event) =>
              onChange({ ...variant, sku: event.target.value })
            }
            type="text"
            value={variant.sku}
          />
        </FormField>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Stock">
          <input
            className={inputClassName}
            min="0"
            name="variantStock"
            onChange={(event) =>
              onChange({ ...variant, stock: event.target.value })
            }
            step="1"
            type="number"
            value={variant.stock}
          />
        </FormField>
        <FormField label="Low Stock Threshold">
          <input
            className={inputClassName}
            min="0"
            name="variantLowStockThreshold"
            onChange={(event) =>
              onChange({
                ...variant,
                lowStockThreshold: event.target.value,
              })
            }
            step="1"
            type="number"
            value={variant.lowStockThreshold}
          />
        </FormField>
        <FormField label="Inventory Status">
          <select
            className={inputClassName}
            name="variantStatus"
            onChange={(event) =>
              onChange({
                ...variant,
                status: event.target.value as ProductFormInventoryStatus,
              })
            }
            value={variant.status}
          >
            {inventoryStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "PRE_ORDER" ? "Preorder" : formatEnumLabel(status)}
              </option>
            ))}
          </select>
        </FormField>
        <div className="flex items-end">
          <button
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 shadow-sm shadow-black/5 transition hover:border-red-300 hover:bg-red-50"
            onClick={onRemove}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
      {isPreorder ? (
        <div className="grid gap-3 rounded-md border border-violet-200 bg-violet-50 p-3 md:grid-cols-2">
          <FormField label="Ships At">
            <input
              className={inputClassName}
              name="variantPreorderShipsAt"
              onChange={(event) =>
                onChange({
                  ...variant,
                  preorderShipsAt: event.target.value,
                })
              }
              type="date"
              value={variant.preorderShipsAt}
            />
          </FormField>
          <FormField label="Limit">
            <input
              className={inputClassName}
              min="0"
              name="variantPreorderLimit"
              onChange={(event) =>
                onChange({ ...variant, preorderLimit: event.target.value })
              }
              step="1"
              type="number"
              value={variant.preorderLimit}
            />
          </FormField>
        </div>
      ) : (
        <>
          <input name="variantPreorderShipsAt" type="hidden" value="" />
          <input name="variantPreorderLimit" type="hidden" value="" />
        </>
      )}
    </div>
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: ProductFormActionState }) {
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

function removeImageRow(images: ProductFormImage[], key: string) {
  const remaining = images.filter((image) => image.key !== key);

  if (!remaining.length) {
    return [createBlankImage(true)];
  }

  if (remaining.some((image) => image.isPrimary)) {
    return remaining;
  }

  return remaining.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
}

function createBlankImage(isPrimary = false): ProductFormImage {
  return {
    alt: "",
    isPrimary,
    key: createRowKey("image"),
    url: "",
  };
}

function createBlankVariant(): ProductFormVariant {
  return {
    colorName: "",
    colorValue: "#000000",
    id: "",
    key: createRowKey("variant"),
    lowStockThreshold: "",
    preorderLimit: "",
    preorderShipsAt: "",
    size: "",
    sku: "",
    status: "IN_STOCK",
    stock: "0",
  };
}

function createRowKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 sm:w-fit";
