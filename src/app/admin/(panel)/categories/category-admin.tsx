"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  ChevronDown,
  FolderTree,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/app/admin/(panel)/categories/actions";
import { cn } from "@/lib/utils";

export type CategoryAdminItem = {
  childCount: number;
  depth: number;
  id: string;
  isActive: boolean;
  label: string;
  parentId: string | null;
  parentLabel: string | null;
  path: string[];
  pathKey: string;
  productAssignmentCount: number;
  rootSlug: string;
  seoDescription: string | null;
  seoTitle: string | null;
  showInFilter: boolean;
  showInNav: boolean;
  slug: string;
  sortOrder: number;
};

type CategoryAdminPageProps = {
  categories: CategoryAdminItem[];
};

const initialActionState: CategoryActionState = {};

export function CategoryAdminPage({ categories }: CategoryAdminPageProps) {
  const parentOptions = useMemo(
    () =>
      categories.map((category) => ({
        depth: category.depth,
        id: category.id,
        label: category.label,
        path: category.path,
        pathKey: category.pathKey,
      })),
    [categories],
  );

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-semibold text-sky-700">Categories</p>
        <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
          Category Management
        </h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Total" value={String(categories.length)} />
          <StatTile
            label="Navigation"
            value={String(categories.filter((item) => item.showInNav).length)}
          />
          <StatTile
            label="Filters"
            value={String(categories.filter((item) => item.showInFilter).length)}
          />
        </div>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Create Category</h2>
            <p className="text-sm text-zinc-500">Add a root or child category.</p>
          </div>
        </div>
        <CategoryForm
          action={createCategoryAction}
          parentOptions={parentOptions}
          submitLabel="Create category"
          variant="create"
        />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Categories</h2>
            <p className="text-sm text-zinc-500">
              {categories.length
                ? `${categories.length} categories in the database`
                : "No categories in the database"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <FolderTree className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {categories.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Path Key</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Depth</th>
                    <th className="px-4 py-3">Sort</th>
                    <th className="px-4 py-3">Flags</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {categories.map((category) => (
                    <CategoryTableRow
                      category={category}
                      key={category.id}
                      parentOptions={parentOptions}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {categories.map((category) => (
                <CategoryMobileCard
                  category={category}
                  key={category.id}
                  parentOptions={parentOptions}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
              <FolderTree className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-black text-zinc-950">
              No categories yet
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Create the first root category above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
    </div>
  );
}

function CategoryTableRow({
  category,
  parentOptions,
}: {
  category: CategoryAdminItem;
  parentOptions: CategoryParentOption[];
}) {
  return (
    <tr className="align-top">
      <td className="px-4 py-4">
        <div style={{ paddingLeft: `${Math.min(category.depth, 5) * 16}px` }}>
          <p className="font-black text-zinc-950">{category.label}</p>
          <p className="mt-1 text-xs text-zinc-500">{category.rootSlug}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <code className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
          {category.slug}
        </code>
      </td>
      <td className="max-w-xs px-4 py-4">
        <p className="break-words font-mono text-xs text-zinc-600">
          {category.pathKey}
        </p>
      </td>
      <td className="px-4 py-4 text-zinc-600">
        {category.parentLabel ?? "Root"}
      </td>
      <td className="px-4 py-4 text-zinc-600">{category.depth}</td>
      <td className="px-4 py-4 text-zinc-600">{category.sortOrder}</td>
      <td className="px-4 py-4">
        <CategoryFlags category={category} />
      </td>
      <td className="px-4 py-4">
        <CategoryActions category={category} parentOptions={parentOptions} />
      </td>
    </tr>
  );
}

function CategoryMobileCard({
  category,
  parentOptions,
}: {
  category: CategoryAdminItem;
  parentOptions: CategoryParentOption[];
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-black text-zinc-950">{category.label}</p>
          <p className="mt-1 break-words font-mono text-xs text-zinc-500">
            {category.pathKey}
          </p>
        </div>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
          Depth {category.depth}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase text-zinc-500">Slug</dt>
          <dd className="mt-1 font-semibold text-zinc-950">{category.slug}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-zinc-500">Parent</dt>
          <dd className="mt-1 font-semibold text-zinc-950">
            {category.parentLabel ?? "Root"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-zinc-500">Sort</dt>
          <dd className="mt-1 font-semibold text-zinc-950">
            {category.sortOrder}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-zinc-500">Products</dt>
          <dd className="mt-1 font-semibold text-zinc-950">
            {category.productAssignmentCount}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <CategoryFlags category={category} />
      </div>
      <div className="mt-4">
        <CategoryActions category={category} parentOptions={parentOptions} />
      </div>
    </article>
  );
}

function CategoryFlags({ category }: { category: CategoryAdminItem }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusPill active={category.isActive} label="Active" />
      <StatusPill active={category.showInNav} label="Nav" />
      <StatusPill active={category.showInFilter} label="Filter" />
    </div>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
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
      {label}
    </span>
  );
}

type CategoryParentOption = {
  depth: number;
  id: string;
  label: string;
  path: string[];
  pathKey: string;
};

function CategoryActions({
  category,
  parentOptions,
}: {
  category: CategoryAdminItem;
  parentOptions: CategoryParentOption[];
}) {
  const availableParentOptions = parentOptions.filter(
    (option) =>
      option.id !== category.id && !isDescendantPath(category.path, option.path),
  );

  return (
    <div className="grid gap-2">
      <details className="group rounded-md border border-zinc-200 bg-zinc-50">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-semibold text-zinc-800">
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Edit
          </span>
          <ChevronDown
            className="h-4 w-4 text-zinc-500 transition group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-zinc-200 p-3">
          <CategoryForm
            action={updateCategoryAction}
            category={category}
            parentOptions={availableParentOptions}
            submitLabel="Save changes"
            variant="edit"
          />
        </div>
      </details>
      <CategoryDeleteForm category={category} />
    </div>
  );
}

function isDescendantPath(categoryPath: string[], optionPath: string[]) {
  return (
    categoryPath.length > 0 &&
    categoryPath.every((item, index) => optionPath[index] === item)
  );
}

function CategoryForm({
  action,
  category,
  parentOptions,
  submitLabel,
  variant,
}: {
  action: (
    state: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  category?: CategoryAdminItem;
  parentOptions: CategoryParentOption[];
  submitLabel: string;
  variant: "create" | "edit";
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values;

  useEffect(() => {
    if (variant === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, variant]);

  return (
    <form action={formAction} className="grid gap-4" noValidate ref={formRef}>
      {category ? <input name="id" type="hidden" value={category.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Label">
          <input
            className={inputClassName}
            defaultValue={values?.label ?? category?.label ?? ""}
            name="label"
            required
            type="text"
          />
        </FormField>
        <FormField label="Slug">
          <input
            className={inputClassName}
            defaultValue={values?.slug ?? category?.slug ?? ""}
            name="slug"
            type="text"
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Parent Category">
          <select
            className={inputClassName}
            defaultValue={values?.parentId ?? category?.parentId ?? ""}
            name="parentId"
          >
            <option value="">Root category</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {`${"- ".repeat(option.depth)}${option.label}`}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={values?.sortOrder ?? String(category?.sortOrder ?? 0)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <CheckboxField
          checked={values?.isActive ?? category?.isActive ?? true}
          label="Active"
          name="isActive"
        />
        <CheckboxField
          checked={values?.showInNav ?? category?.showInNav ?? true}
          label="Show in Navigation"
          name="showInNav"
        />
        <CheckboxField
          checked={values?.showInFilter ?? category?.showInFilter ?? true}
          label="Show in Filter"
          name="showInFilter"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="SEO Title">
          <input
            className={inputClassName}
            defaultValue={values?.seoTitle ?? category?.seoTitle ?? ""}
            name="seoTitle"
            type="text"
          />
        </FormField>
        <FormField label="SEO Description">
          <textarea
            className={cn(inputClassName, "min-h-24 py-3")}
            defaultValue={
              values?.seoDescription ?? category?.seoDescription ?? ""
            }
            name="seoDescription"
          />
        </FormField>
      </div>

      <ActionMessage state={state} />
      <SubmitButton icon={variant === "create" ? Plus : Pencil} label={submitLabel} />
    </form>
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

function CheckboxField({
  checked,
  label,
  name,
}: {
  checked: boolean;
  label: string;
  name: "isActive" | "showInFilter" | "showInNav";
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm shadow-black/5">
      <input
        className="h-4 w-4 accent-zinc-950"
        defaultChecked={checked}
        name={name}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function CategoryDeleteForm({ category }: { category: CategoryAdminItem }) {
  const [state, formAction] = useActionState(
    deleteCategoryAction,
    initialActionState,
  );
  const blockedReason =
    category.childCount > 0
      ? "Has child categories"
      : category.productAssignmentCount > 0
        ? "Has assigned products"
        : null;

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={category.id} />
      <button
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
          blockedReason
            ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
            : "border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50",
        )}
        disabled={Boolean(blockedReason)}
        type="submit"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>
      {blockedReason ? (
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          {blockedReason}
        </p>
      ) : null}
      <ActionMessage state={state} />
    </form>
  );
}

function SubmitButton({
  icon: Icon,
  label,
}: {
  icon: typeof Plus;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: CategoryActionState }) {
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

const inputClassName =
  "min-h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";
