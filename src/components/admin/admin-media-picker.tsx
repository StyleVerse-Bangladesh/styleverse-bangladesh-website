"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Check,
  ImageOff,
  Images,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminMediaPickerItem = {
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

export function AdminMediaPicker({
  buttonLabel = "Choose From Media Library",
  onSelect,
}: {
  buttonLabel?: string;
  onSelect: (file: AdminMediaPickerItem) => void;
}) {
  const [error, setError] = useState("");
  const [files, setFiles] = useState<AdminMediaPickerItem[]>([]);
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

        const data = (await response.json()) as {
          files: AdminMediaPickerItem[];
        };
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
          {buttonLabel}
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
                Select an image from uploaded media.
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
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
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

function MediaSourcePill({ file }: { file: AdminMediaPickerItem }) {
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

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 sm:w-fit";
