"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  Boxes,
  Check,
  DollarSign,
  Image as ImageIcon,
  ImageOff,
  ImagePlus,
  Images,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Search,
  Tags,
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
const productStatuses: ProductFormStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const productGenders: ProductFormGender[] = ["MEN", "WOMEN", "KIDS", "UNISEX"];
const inventoryStatuses: ProductFormInventoryStatus[] = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "PRE_ORDER",
];

export function ProductFormPage({
  action,
  categories,
  mode,
  product,
}: ProductFormPageProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [images, setImages] = useState<ProductFormImage[]>(
    product.images.length ? product.images : [createBlankImage(true)],
  );
  const [variants, setVariants] = useState<ProductFormVariant[]>(
    product.variants.length ? product.variants : [createBlankVariant()],
  );
  const title = mode === "create" ? "Create Product" : "Edit Product";

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
            href="/admin/products"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Products
          </Link>
          <p className="mt-3 text-sm font-semibold text-sky-700">Products</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            {title}
          </h1>
        </div>
      </header>

      <form action={formAction} className="grid gap-6" noValidate>
        {product.id ? <input name="id" type="hidden" value={product.id} /> : null}

        <FormSection
          description="Core catalog fields used by admin workflows."
          icon={PackagePlus}
          title="Product Information"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Product Name">
              <input
                className={inputClassName}
                defaultValue={product.name}
                name="name"
                required
                type="text"
              />
            </FormField>
            <FormField label="Slug">
              <input
                className={inputClassName}
                defaultValue={product.slug}
                name="slug"
                required
                type="text"
              />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea
              className={cn(inputClassName, "min-h-28 py-3")}
              defaultValue={product.description}
              name="description"
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Status">
              <select
                className={inputClassName}
                defaultValue={product.status}
                name="status"
              >
                {productStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Gender">
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
            </FormField>
          </div>
        </FormSection>

        <FormSection
          description="BDT values are stored with two decimal places."
          icon={DollarSign}
          title="Pricing"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Price">
              <input
                className={inputClassName}
                defaultValue={product.price}
                min="0"
                name="price"
                required
                step="0.01"
                type="number"
              />
            </FormField>
            <FormField label="Compare Price">
              <input
                className={inputClassName}
                defaultValue={product.compareAtPrice}
                min="0"
                name="compareAtPrice"
                step="0.01"
                type="number"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          description="Primary category powers admin filtering and product ownership."
          icon={Tags}
          title="Category Assignment"
        >
          <FormField label="Primary Category">
            <select
              className={inputClassName}
              defaultValue={product.primaryCategoryId}
              name="primaryCategoryId"
              required
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {`${"- ".repeat(category.depth)}${category.label} (${category.pathKey})`}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Additional Categories
            </p>
            <div className="grid max-h-72 gap-2 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-2">
              {categories.map((category) => (
                <label
                  className="flex min-h-10 items-start gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5"
                  key={category.id}
                >
                  <input
                    className="mt-1 h-4 w-4 accent-zinc-950"
                    defaultChecked={product.additionalCategoryIds.includes(
                      category.id,
                    )}
                    name="additionalCategoryIds"
                    type="checkbox"
                    value={category.id}
                  />
                  <span className="min-w-0">
                    <span className="block text-zinc-950">{category.label}</span>
                    <span className="block break-words font-mono text-xs text-zinc-500">
                      {category.pathKey}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection
          description="Choose images from the Media Library or paste a direct URL when needed."
          icon={ImageIcon}
          title="Images"
        >
          <div className="grid gap-3">
            {images.map((image, index) => (
              <ImageRow
                image={image}
                index={index}
                key={image.key}
                onChange={(nextImage) =>
                  setImages((current) =>
                    current.map((item) =>
                      item.key === image.key ? nextImage : item,
                    ),
                  )
                }
                onMakePrimary={() =>
                  setImages((current) =>
                    current.map((item) => ({
                      ...item,
                      isPrimary: item.key === image.key,
                    })),
                  )
                }
                onRemove={() =>
                  setImages((current) => removeImageRow(current, image.key))
                }
              />
            ))}
          </div>
          <button
            className={secondaryButtonClassName}
            onClick={() =>
              setImages((current) => [
                ...current,
                createBlankImage(current.length === 0),
              ])
            }
            type="button"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Add image
          </button>
        </FormSection>

        <FormSection
          description="Create or update sellable options and stock state."
          icon={Boxes}
          title="Variants"
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
        </FormSection>

        <ActionMessage state={state} />

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200 bg-[#f4f6f8]/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <SubmitButton label={mode === "create" ? "Create product" : "Save product"} />
        </div>
      </form>
    </div>
  );
}

function ImageRow({
  image,
  index,
  onChange,
  onMakePrimary,
  onRemove,
}: {
  image: ProductFormImage;
  index: number;
  onChange: (image: ProductFormImage) => void;
  onMakePrimary: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto] md:items-end">
      <FormControl label="Image URL">
        <div className="grid gap-2">
          <div className="grid gap-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
            <ImagePreview image={image} />
            <input
              className={inputClassName}
              name="imageUrl"
              onChange={(event) => onChange({ ...image, url: event.target.value })}
              type="url"
              value={image.url}
            />
          </div>
          <MediaPickerButton
            onSelect={(file) =>
              onChange({
                ...image,
                alt: image.alt || file.filename,
                url: file.mediaUrl ?? file.url,
              })
            }
          />
        </div>
      </FormControl>
      <FormField label="Alt Text">
        <input
          className={inputClassName}
          name="imageAlt"
          onChange={(event) => onChange({ ...image, alt: event.target.value })}
          type="text"
          value={image.alt}
        />
      </FormField>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5">
          <input
            checked={image.isPrimary}
            className="h-4 w-4 accent-zinc-950"
            name="primaryImageIndex"
            onChange={onMakePrimary}
            type="radio"
            value={index}
          />
          Primary
        </label>
        <button
          aria-label="Remove image"
          className={dangerIconButtonClassName}
          onClick={onRemove}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ImagePreview({ image }: { image: ProductFormImage }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-400 sm:h-11 sm:w-20">
      {image.url ? (
        <Image
          alt={image.alt || "Selected product image"}
          className="h-full w-full object-cover"
          height={80}
          src={image.url}
          unoptimized
          width={80}
        />
      ) : (
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function MediaPickerButton({
  onSelect,
}: {
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
        <button className={secondaryButtonClassName} type="button">
          <Images className="h-4 w-4" aria-hidden="true" />
          Choose From Media Library
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

function FormSection({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof PackagePlus;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-black text-zinc-950">{title}</h2>
          <p className="text-sm leading-6 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
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

function FormControl({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      {children}
    </div>
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

const dangerIconButtonClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 shadow-sm shadow-black/5 transition hover:border-red-300 hover:bg-red-50";
