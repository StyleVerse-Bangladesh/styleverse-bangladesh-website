"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import {
  saveCustomerNotesAction,
  updateCustomerStatusAction,
  type CustomerActionState,
} from "@/app/admin/(panel)/customers/actions";
import { cn } from "@/lib/utils";

type CustomerStatusFormProps = {
  customerId: string;
  isActive: boolean;
};

type CustomerNotesFormProps = {
  adminNotes: string | null;
  customerId: string;
};

const initialActionState: CustomerActionState = {};

export function CustomerStatusForm({
  customerId,
  isActive,
}: CustomerStatusFormProps) {
  const [state, formAction] = useActionState(
    updateCustomerStatusAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input name="customerId" type="hidden" value={customerId} />
      <FormField label="Customer Status">
        <select
          className={inputClassName}
          defaultValue={isActive ? "ACTIVE" : "BLOCKED"}
          name="status"
        >
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </FormField>
      <ActionMessage state={state} />
      <SubmitButton icon={ShieldCheck} label="Save status" />
    </form>
  );
}

export function CustomerNotesForm({
  adminNotes,
  customerId,
}: CustomerNotesFormProps) {
  const [state, formAction] = useActionState(
    saveCustomerNotesAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input name="customerId" type="hidden" value={customerId} />
      <FormField label="Internal Notes">
        <textarea
          className={cn(inputClassName, "min-h-40 resize-y py-3")}
          defaultValue={adminNotes ?? ""}
          name="adminNotes"
          placeholder="Private support notes"
        />
      </FormField>
      <p className="text-xs font-semibold text-zinc-500">
        Internal only. Customers cannot see these notes.
      </p>
      <ActionMessage state={state} />
      <SubmitButton icon={Save} label="Save notes" />
    </form>
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

function ActionMessage({ state }: { state: CustomerActionState }) {
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit";
