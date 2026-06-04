"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Download, Loader2 } from "lucide-react";
import {
  downloadInvoicePdfPlaceholderAction,
  type InvoiceDownloadActionState,
} from "@/app/admin/(panel)/orders/[id]/invoice/actions";
import { cn } from "@/lib/utils";

const initialActionState: InvoiceDownloadActionState = {};

export function InvoiceDownloadControl({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(
    downloadInvoicePdfPlaceholderAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input name="orderId" type="hidden" value={orderId} />
      <SubmitButton />
      {state.message ? (
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
      ) : null}
    </form>
  );
}

function SubmitButton() {
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
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Preparing..." : "Download PDF"}
    </button>
  );
}
