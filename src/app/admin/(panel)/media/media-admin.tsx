"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Check,
  Copy,
  Image as ImageIcon,
  ImageOff,
  Loader2,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  deleteMediaAction,
  uploadMediaAction,
  type MediaActionState,
} from "@/app/admin/(panel)/media/actions";
import { cn } from "@/lib/utils";

export type MediaAdminItem = {
  filename: string;
  id: string;
  isCloudinary: boolean;
  isLegacyLocal: boolean;
  isLegacyLocalMissing: boolean;
  mediaUrl: string | null;
  mimeType: string;
  previewUrl: string | null;
  productUsageCount: number;
  sizeLabel: string;
  sourceLabel: string;
  uploadedAt: string;
  url: string;
  warning: string | null;
};

export type MediaAdminFilters = {
  search: string;
};

type MediaAdminPageProps = {
  files: MediaAdminItem[];
  filters: MediaAdminFilters;
  summary: {
    storageLabel: string;
    total: number;
  };
};

const initialActionState: MediaActionState = {};

export function MediaAdminPage({
  files,
  filters,
  summary,
}: MediaAdminPageProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-700">Media</p>
            <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
              Media Library
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Upload high-quality product imagery to Cloudinary, copy public
              URLs, and keep track of product usage before removing files.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-80">
            <StatTile label="Active Files" value={String(summary.total)} />
            <StatTile label="Storage" value={summary.storageLabel} />
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Upload Image</h2>
            <p className="text-sm leading-6 text-zinc-500">
              JPG, PNG, and WEBP files up to 10 MB.
            </p>
          </div>
        </div>
        <MediaUploadForm />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <FormField label="Search">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                className={cn(inputClassName, "pl-9")}
                defaultValue={filters.search}
                name="search"
                placeholder="Filename"
                type="search"
              />
            </div>
          </FormField>
          <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
            <button className={primaryButtonClassName} type="submit">
              <Search className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
            <Link className={secondaryButtonClassName} href="/admin/media">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-950">Files</h2>
            <p className="text-sm text-zinc-500">
              {files.length
                ? `${files.length} files match the current view`
                : "No files match the current view"}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {files.length ? <MediaList files={files} /> : <EmptyMedia />}
      </section>
    </div>
  );
}

function MediaUploadForm() {
  const [state, formAction] = useActionState(
    uploadMediaAction,
    initialActionState,
  );
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.ok) {
      setFormKey((value) => value + 1);
    }
  }, [state.ok]);

  return (
    <form action={formAction} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <FormField label="Image File">
        <input
          key={formKey}
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className={cn(inputClassName, "py-2 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white")}
          name="file"
          required
          type="file"
        />
      </FormField>
      <UploadButton />
      <div className="lg:col-span-2">
        <ActionMessage state={state} />
      </div>
    </form>
  );
}

function MediaList({ files }: { files: MediaAdminItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Filename</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {files.map((file) => (
              <tr className="align-top" key={file.id}>
                <td className="px-4 py-4">
                  <MediaThumb file={file} />
                </td>
                <td className="max-w-[24rem] px-4 py-4">
                  <FileIdentity file={file} />
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-700">
                  {file.sizeLabel}
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-700">
                  {file.uploadedAt}
                </td>
                <td className="px-4 py-4">
                  <UsagePill count={file.productUsageCount} />
                </td>
                <td className="px-4 py-4">
                  <MediaActions file={file} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 xl:hidden">
        {files.map((file) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5"
            key={file.id}
          >
            <div className="flex items-start gap-3">
              <MediaThumb file={file} />
              <div className="min-w-0 flex-1">
                <FileIdentity file={file} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <UsagePill count={file.productUsageCount} />
                  <SourcePill file={file} />
                  <span className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-600">
                    {file.sizeLabel}
                  </span>
                  <span className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-600">
                    {file.uploadedAt}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-zinc-200 pt-4">
              <MediaActions file={file} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function MediaActions({ file }: { file: MediaAdminItem }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
      <CopyUrlButton file={file} />
      <MediaDeleteForm file={file} />
    </div>
  );
}

function CopyUrlButton({ file }: { file: MediaAdminItem }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(file.mediaUrl ?? file.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className={secondaryButtonClassName} onClick={copyUrl} type="button">
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy URL"}
    </button>
  );
}

function MediaDeleteForm({ file }: { file: MediaAdminItem }) {
  const [state, formAction] = useActionState(
    deleteMediaAction,
    initialActionState,
  );
  const inUse = file.productUsageCount > 0;

  return (
    <form action={formAction} className="grid gap-2">
      <input name="id" type="hidden" value={file.id} />
      <button
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
          inUse
            ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
            : "border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50",
        )}
        disabled={inUse}
        type="submit"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {inUse ? "In Use" : "Delete"}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

function FileIdentity({ file }: { file: MediaAdminItem }) {
  return (
    <div className="grid gap-1">
      <p className="break-words font-black text-zinc-950">{file.filename}</p>
      <p className="break-all font-mono text-xs text-zinc-500">{file.url}</p>
      <div className="flex flex-wrap gap-2">
        <SourcePill file={file} />
        {file.warning ? <WarningPill label={file.warning} /> : null}
      </div>
      <p className="text-xs font-semibold uppercase text-zinc-400">
        {file.mimeType}
      </p>
    </div>
  );
}

function MediaThumb({ file }: { file: MediaAdminItem }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-zinc-400">
      {file.previewUrl ? (
        <Image
          alt={file.filename}
          className="h-full w-full object-cover"
          height={64}
          src={file.previewUrl}
          unoptimized
          width={64}
        />
      ) : (
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function SourcePill({ file }: { file: MediaAdminItem }) {
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

function WarningPill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-7 w-fit items-center rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700">
      {label}
    </span>
  );
}

function UsagePill({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2 text-xs font-semibold",
        count
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {count ? `${count} product${count === 1 ? "" : "s"}` : "Unused"}
    </span>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={primaryButtonClassName}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Upload className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Uploading..." : "Upload"}
    </button>
  );
}

function ActionMessage({ state }: { state: MediaActionState }) {
  const message = state.message;

  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-semibold",
        state.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={state.ok ? "status" : "alert"}
    >
      {message}
    </p>
  );
}

function EmptyMedia() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
        <ImageIcon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-base font-black text-zinc-950">No media found</p>
      <p className="mt-2 text-sm text-zinc-500">
        Upload an image or adjust the current search.
      </p>
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

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70";

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";
