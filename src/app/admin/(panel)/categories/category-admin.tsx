"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Folder,
  FolderOpen,
  ImageOff,
  Info,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/app/admin/(panel)/categories/actions";
import { AdminMediaPicker } from "@/components/admin/admin-media-picker";
import { cn } from "@/lib/utils";

export type CategoryAdminItem = {
  childCount: number;
  depth: number;
  featureInBanner: boolean;
  featured: boolean;
  icon: string | null;
  id: string;
  image: string | null;
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
  tone: string | null;
};

type CategoryAdminPageProps = {
  categories: CategoryAdminItem[];
};

type CategoryTreeNode = CategoryAdminItem & {
  children: CategoryTreeNode[];
};

type EditorMode =
  | { kind: "create"; parentId: string | null }
  | { categoryId: string; kind: "edit" };

type CategoryParentOption = {
  depth: number;
  id: string;
  label: string;
  path: string[];
  pathKey: string;
};

const initialActionState: CategoryActionState = {};

export function CategoryAdminPage({ categories }: CategoryAdminPageProps) {
  const router = useRouter();
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const firstCategory = categories[0] ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(
    firstCategory?.id ?? null,
  );
  const [mode, setMode] = useState<EditorMode>(
    firstCategory
      ? { categoryId: firstCategory.id, kind: "edit" }
      : { kind: "create", parentId: null },
  );
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(categories.map((category) => category.id)),
  );
  const searchActive = search.trim().length > 0;
  const visibleTree = useMemo(
    () => filterCategoryTree(tree, search),
    [search, tree],
  );
  const selectedCategory = selectedId ? categoriesById.get(selectedId) : null;
  const editorCategory =
    mode.kind === "edit" ? categoriesById.get(mode.categoryId) ?? null : null;
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
  const allExpanded = expandedIds.size >= categories.length && categories.length > 0;
  const handleCategorySaved = useCallback(() => {
    router.refresh();
  }, [router]);
  const handleCategoryDeleted = useCallback(() => {
    setSelectedId(null);
    setMode({ kind: "create", parentId: null });
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedId(null);
      setMode({ kind: "create", parentId: null });
      return;
    }

    if (mode.kind === "create") {
      if (mode.parentId && !categoriesById.has(mode.parentId)) {
        setSelectedId(null);
        setMode({ kind: "create", parentId: null });
      }

      return;
    }

    if (categoriesById.has(mode.categoryId)) {
      if (selectedId !== mode.categoryId) {
        setSelectedId(mode.categoryId);
      }

      return;
    }

    setSelectedId(categories[0].id);
    setMode({ categoryId: categories[0].id, kind: "edit" });
  }, [categories, categoriesById, mode, selectedId]);

  function selectCategory(category: CategoryAdminItem) {
    setSelectedId(category.id);
    setMode({ categoryId: category.id, kind: "edit" });
  }

  function addRootCategory() {
    setSelectedId(null);
    setMode({ kind: "create", parentId: null });
  }

  function addChildCategory() {
    if (!selectedId) {
      return;
    }

    setMode({ kind: "create", parentId: selectedId });
  }

  function toggleExpanded(categoryId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  }

  function toggleExpandAll() {
    setExpandedIds(
      allExpanded ? new Set() : new Set(categories.map((category) => category.id)),
    );
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            All Categories
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Manage category hierarchy, storefront visibility, media, and SEO
            from one protected admin workspace.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-400 opacity-70 sm:w-fit"
          disabled
          title="Category trash is not available yet."
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Trashed
        </button>
      </header>

      <section className="grid gap-4 xl:grid-cols-[24.5rem_minmax(0,1fr)]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm shadow-black/5 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <button className={secondaryButtonClassName} onClick={addRootCategory} type="button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Root Category
            </button>
            <button
              className={secondaryButtonClassName}
              disabled={!selectedId}
              onClick={addChildCategory}
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Child
            </button>
            <SelectedDeleteForm
              category={selectedCategory ?? null}
              onDeleted={handleCategoryDeleted}
            />
          </div>

          <div className="mt-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                className={cn(inputClassName, "pl-9")}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                type="search"
                value={search}
              />
            </div>
          </div>

          <button
            className="mt-3 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
            onClick={toggleExpandAll}
            type="button"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>

          <div className="mt-2 max-h-[34rem] overflow-y-auto rounded-md border border-zinc-100 bg-zinc-50/40 p-2">
            {visibleTree.length ? (
              <div className="grid gap-0.5">
                {visibleTree.map((node) => (
                  <CategoryTreeItem
                    expandedIds={expandedIds}
                    key={node.id}
                    node={node}
                    onSelect={selectCategory}
                    onToggle={toggleExpanded}
                    selectedId={selectedId}
                    showDescendants={searchActive}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-zinc-200 bg-white p-6 text-center">
                <Folder className="mx-auto h-6 w-6 text-zinc-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-zinc-600">
                  No categories found
                </p>
              </div>
            )}
          </div>
        </aside>

        <CategoryEditor
          category={editorCategory}
          key={mode.kind === "edit" ? `edit-${mode.categoryId}` : `create-${mode.parentId ?? "root"}`}
          mode={mode}
          onSaved={handleCategorySaved}
          parentOptions={parentOptions}
        />
      </section>
    </div>
  );
}

function CategoryTreeItem({
  expandedIds,
  node,
  onSelect,
  onToggle,
  selectedId,
  showDescendants,
}: {
  expandedIds: Set<string>;
  node: CategoryTreeNode;
  onSelect: (category: CategoryAdminItem) => void;
  onToggle: (categoryId: string) => void;
  selectedId: string | null;
  showDescendants: boolean;
}) {
  const hasChildren = node.children.length > 0;
  const expanded = showDescendants || expandedIds.has(node.id);
  const selected = selectedId === node.id;

  return (
    <div className="relative">
      <div
        className="relative flex items-center gap-1"
        style={{ paddingLeft: `${node.depth * 18}px` }}
      >
        {node.depth > 0 ? (
          <span
            className="absolute bottom-1/2 top-[-0.35rem] w-px border-l border-dotted border-zinc-300"
            style={{ left: `${(node.depth - 1) * 18 + 7}px` }}
            aria-hidden="true"
          />
        ) : null}
        {node.depth > 0 ? (
          <span
            className="absolute h-px w-3 border-t border-dotted border-zinc-300"
            style={{ left: `${(node.depth - 1) * 18 + 7}px` }}
            aria-hidden="true"
          />
        ) : null}
        <button
          aria-label={expanded ? "Collapse category" : "Expand category"}
          className={cn(
            "flex h-6 w-5 shrink-0 items-center justify-center rounded-sm text-zinc-500",
            !hasChildren && "invisible",
          )}
          onClick={() => onToggle(node.id)}
          type="button"
        >
          <ChevronRight
            className={cn("h-4 w-4 transition", expanded && "rotate-90")}
            aria-hidden="true"
          />
        </button>
        <button
          className={cn(
            "flex min-h-7 min-w-0 flex-1 items-center gap-2 rounded px-2 text-left text-sm font-semibold transition",
            selected
              ? "bg-[#6d5dfc] text-white shadow-sm shadow-indigo-950/10"
              : "text-zinc-600 hover:bg-white hover:text-zinc-950",
          )}
          onClick={() => onSelect(node)}
          type="button"
        >
          {expanded && hasChildren ? (
            <FolderOpen
              className={cn("h-4 w-4 shrink-0", selected ? "text-white" : "text-amber-500")}
              aria-hidden="true"
            />
          ) : (
            <Folder
              className={cn("h-4 w-4 shrink-0", selected ? "text-white" : "text-amber-500")}
              aria-hidden="true"
            />
          )}
          <span className="min-w-0 truncate">{node.label}</span>
        </button>
      </div>
      {hasChildren && expanded ? (
        <div className="mt-0.5 grid gap-0.5">
          {node.children.map((child) => (
            <CategoryTreeItem
              expandedIds={expandedIds}
              key={child.id}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedId={selectedId}
              showDescendants={showDescendants}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryEditor({
  category,
  mode,
  onSaved,
  parentOptions,
}: {
  category: CategoryAdminItem | null;
  mode: EditorMode;
  onSaved: () => void;
  parentOptions: CategoryParentOption[];
}) {
  const isEdit = mode.kind === "edit";
  const action = isEdit ? updateCategoryAction : createCategoryAction;
  const [state, formAction] = useActionState(action, initialActionState);
  const handledSuccessStateRef = useRef<CategoryActionState | null>(null);

  useEffect(() => {
    if (state.status !== "success" || handledSuccessStateRef.current === state) {
      return;
    }

    handledSuccessStateRef.current = state;
    onSaved();
  }, [onSaved, state]);

  if (isEdit && !category) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm shadow-black/5">
        <Folder className="mx-auto h-8 w-8 text-zinc-400" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-zinc-600">
          Select a category to edit.
        </p>
      </section>
    );
  }

  const title = isEdit ? category?.label ?? "Edit Category" : "New Category";
  const parentId = isEdit ? category?.parentId ?? null : mode.parentId;
  const availableParentOptions = isEdit && category
    ? parentOptions.filter(
        (option) =>
          option.id !== category.id && !isDescendantPath(category.path, option.path),
      )
    : parentOptions;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-zinc-950">{title}</h2>
          <p className="text-sm text-zinc-500">
            {isEdit ? "Update selected category details." : "Create a root or child category."}
          </p>
        </div>
      </div>
      <CategoryEditorForm
        category={category}
        formAction={formAction}
        mode={mode}
        parentId={parentId}
        parentOptions={availableParentOptions}
        state={state}
      />
    </section>
  );
}

function CategoryEditorForm({
  category,
  formAction,
  mode,
  parentId,
  parentOptions,
  state,
}: {
  category: CategoryAdminItem | null;
  formAction: (payload: FormData) => void;
  mode: EditorMode;
  parentId: string | null;
  parentOptions: CategoryParentOption[];
  state: CategoryActionState;
}) {
  const [label, setLabel] = useState(state.values?.label ?? category?.label ?? "");
  const [slug, setSlug] = useState(state.values?.slug ?? category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [image, setImage] = useState(state.values?.image ?? category?.image ?? "");
  const [icon, setIcon] = useState(state.values?.icon ?? category?.icon ?? "");
  const [selectedParentId, setSelectedParentId] = useState(
    state.values?.parentId ?? parentId ?? "",
  );
  const [sortOrder, setSortOrder] = useState(
    state.values?.sortOrder ?? String(category?.sortOrder ?? 0),
  );

  function handleLabelChange(value: string) {
    setLabel(value);

    if (!slugTouched || !slug) {
      setSlug(slugifyCategory(value));
    }
  }

  function resetForm() {
    setLabel(category?.label ?? "");
    setSlug(category?.slug ?? "");
    setSlugTouched(Boolean(category?.slug));
    setImage(category?.image ?? "");
    setIcon(category?.icon ?? "");
    setSelectedParentId(parentId ?? "");
    setSortOrder(String(category?.sortOrder ?? 0));
  }

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {category ? <input name="id" type="hidden" value={category.id} /> : null}

      <MediaField
        helper="Image will be resized into 200x200 px"
        label="Image"
        name="image"
        onChange={setImage}
        previewClassName="h-44 w-44"
        value={image}
      />
      <MediaField
        helper="Image will be resized into 40x40 px"
        label="Icon"
        name="icon"
        onChange={setIcon}
        previewClassName="h-12 w-12"
        value={icon}
      />

      <div className="grid gap-4 lg:grid-cols-[8rem_minmax(0,1fr)] lg:items-start">
        <RequiredLabel>Name</RequiredLabel>
        <input
          className={inputClassName}
          name="label"
          onChange={(event) => handleLabelChange(event.target.value)}
          required
          type="text"
          value={label}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[8rem_minmax(0,1fr)] lg:items-start">
        <RequiredLabel>Slug</RequiredLabel>
        <div className="grid gap-1.5">
          <input
            className={inputClassName}
            name="slug"
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugifyCategory(event.target.value));
            }}
            required
            type="text"
            value={slug}
          />
          <p className="text-xs italic text-zinc-500">Use Category Name in Slug</p>
        </div>
      </div>
      <FormRow label="Meta Title">
        <input
          className={inputClassName}
          defaultValue={state.values?.seoTitle ?? category?.seoTitle ?? ""}
          name="seoTitle"
          type="text"
        />
      </FormRow>
      <FormRow label="Meta Description">
        <textarea
          className={cn(inputClassName, "min-h-24 py-3")}
          defaultValue={
            state.values?.seoDescription ?? category?.seoDescription ?? ""
          }
          name="seoDescription"
        />
      </FormRow>
      <FormRow label="Meta Keywords">
        <div className="grid gap-1.5">
          <input
            className="min-h-11 rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm font-medium text-zinc-500"
            disabled
            type="text"
          />
          <p className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            Coming later. Category keyword storage is not in the schema yet.
          </p>
        </div>
      </FormRow>

      <FormRow label="Hierarchy">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem]">
          <select
            className={inputClassName}
            name="parentId"
            onChange={(event) => setSelectedParentId(event.target.value)}
            value={selectedParentId}
          >
            <option value="">Root category</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {`${"- ".repeat(option.depth)}${option.label}`}
              </option>
            ))}
          </select>
          <input
            className={inputClassName}
            name="sortOrder"
            onChange={(event) => setSortOrder(event.target.value)}
            type="number"
            value={sortOrder}
          />
        </div>
      </FormRow>

      {/* The featured field controls header and mobile category navigation. */}
      <FormRow label="Is Featured">
        <Toggle
          defaultChecked={state.values?.featured ?? category?.featured ?? false}
          name="featured"
        />
      </FormRow>
      <FormRow label="Feature In Banner">
        <div className="grid gap-1.5">
          <Toggle
            defaultChecked={
              state.values?.featureInBanner ??
              category?.featureInBanner ??
              false
            }
            name="featureInBanner"
          />
          <p className="text-xs text-zinc-500">
            Legacy homepage banner flag. Shop By Category is now managed from
            Product Config &rarr; Shop By Categories.
          </p>
        </div>
      </FormRow>

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Visibility
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <CheckboxField
            checked={state.values?.isActive ?? category?.isActive ?? true}
            label="Active"
            name="isActive"
          />
          <CheckboxField
            checked={state.values?.showInNav ?? category?.showInNav ?? true}
            label="Show in Navigation"
            name="showInNav"
          />
          <CheckboxField
            checked={state.values?.showInFilter ?? category?.showInFilter ?? true}
            label="Show in Filter"
            name="showInFilter"
          />
        </div>
      </div>

      <ActionMessage state={state} />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <SubmitButton label={mode.kind === "edit" ? "Submit" : "Create Category"} />
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#11183f] px-4 text-white shadow-sm shadow-black/10 transition hover:bg-[#1a2459]"
          onClick={resetForm}
          type="button"
          aria-label="Reset category form"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

function MediaField({
  helper,
  label,
  name,
  onChange,
  previewClassName,
  value,
}: {
  helper: string;
  label: string;
  name: "icon" | "image";
  onChange: (value: string) => void;
  previewClassName: string;
  value: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[8rem_minmax(0,1fr)] lg:items-start">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div
            className={cn(
              "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-400",
              previewClassName,
            )}
          >
            {value ? (
              <Image
                alt={`${label} preview`}
                className="h-full w-full object-cover"
                height={200}
                src={value}
                unoptimized
                width={200}
              />
            ) : (
              <ImageOff className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
          <div className="grid min-w-0 flex-1 gap-2">
            <input name={name} type="hidden" value={value} />
            <input
              className={inputClassName}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Image URL"
              type="url"
              value={value}
            />
            <div className="flex flex-wrap gap-2">
              <AdminMediaPicker
                buttonLabel="Choose Media"
                onSelect={(file) => onChange(file.mediaUrl ?? file.url)}
              />
              {value ? (
                <button
                  className={secondaryButtonClassName}
                  onClick={() => onChange("")}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-500">{helper}</p>
      </div>
    </div>
  );
}

function SelectedDeleteForm({
  category,
  onDeleted,
}: {
  category: CategoryAdminItem | null;
  onDeleted: () => void;
}) {
  const [state, formAction] = useActionState(
    deleteCategoryAction,
    initialActionState,
  );
  const handledSuccessStateRef = useRef<CategoryActionState | null>(null);
  const blockedReason = category
    ? category.childCount > 0
      ? "Has child categories"
      : category.productAssignmentCount > 0
        ? "Has assigned products"
        : null
    : "Select a category";

  useEffect(() => {
    if (state.status !== "success" || handledSuccessStateRef.current === state) {
      return;
    }

    handledSuccessStateRef.current = state;
    onDeleted();
  }, [onDeleted, state]);

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!category || blockedReason) {
      event.preventDefault();
      return;
    }

    if (!window.confirm(`Delete ${category.label}? This cannot be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="grid gap-1" onSubmit={confirmDelete}>
      <input name="id" type="hidden" value={category?.id ?? ""} />
      <button
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
          blockedReason
            ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
            : "border-red-500 bg-red-600 text-white shadow-sm shadow-red-950/10 hover:bg-red-700",
        )}
        disabled={Boolean(blockedReason)}
        type="submit"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete Selected
      </button>
      {state.message ? (
        <p
          className={cn(
            "text-xs font-semibold",
            state.status === "success" ? "text-emerald-700" : "text-red-700",
          )}
        >
          {state.message}
        </p>
      ) : blockedReason && category ? (
        <p className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          {blockedReason}
        </p>
      ) : null}
    </form>
  );
}

function FormRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[8rem_minmax(0,1fr)] lg:items-start">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <FieldLabel>
      {children} <span className="text-red-600">*</span>
    </FieldLabel>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="pt-3 text-sm font-black text-zinc-800">{children}</span>
  );
}

function Toggle({
  defaultChecked = false,
  disabled = false,
  name,
}: {
  defaultChecked?: boolean;
  disabled?: boolean;
  name: string;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-5 w-10 items-center rounded-full transition",
        disabled
          ? "cursor-not-allowed bg-zinc-300"
          : "cursor-pointer has-[:checked]:bg-[#6d5dfc] bg-zinc-300",
      )}
    >
      <input
        className="peer sr-only"
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        type="checkbox"
      />
      <span className="ml-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f2350d] px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/10 transition hover:bg-[#d92e0b] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
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
      {state.status === "success" ? (
        <CheckCircle2 className="mr-1 inline h-4 w-4" aria-hidden="true" />
      ) : (
        <XCircle className="mr-1 inline h-4 w-4" aria-hidden="true" />
      )}
      {state.message}
    </p>
  );
}

function buildCategoryTree(categories: CategoryAdminItem[]): CategoryTreeNode[] {
  const nodeById = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    nodeById.set(category.id, {
      ...category,
      children: [],
    });
  }

  for (const node of nodeById.values()) {
    if (node.parentId) {
      const parent = nodeById.get(node.parentId);

      if (parent) {
        parent.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  sortTree(roots);

  return roots;
}

function sortTree(nodes: CategoryTreeNode[]) {
  nodes.sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
  );

  for (const node of nodes) {
    sortTree(node.children);
  }
}

function filterCategoryTree(
  nodes: CategoryTreeNode[],
  search: string,
): CategoryTreeNode[] {
  const term = search.trim().toLowerCase();

  if (!term) {
    return nodes;
  }

  return nodes.flatMap<CategoryTreeNode>((node) => {
    const children = filterCategoryTree(node.children, term);
    const matches =
      node.label.toLowerCase().includes(term) ||
      node.slug.toLowerCase().includes(term) ||
      node.pathKey.toLowerCase().includes(term);

    if (!matches && !children.length) {
      return [];
    }

    return [
      {
        ...node,
        children,
      },
    ];
  });
}

function isDescendantPath(categoryPath: string[], optionPath: string[]) {
  return (
    categoryPath.length > 0 &&
    categoryPath.every((item, index) => optionPath[index] === item)
  );
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400";
