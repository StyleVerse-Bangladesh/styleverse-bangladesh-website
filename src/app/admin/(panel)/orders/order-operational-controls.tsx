"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Loader2,
  RefreshCw,
  Save,
  SearchCheck,
  Send,
  type LucideIcon,
} from "lucide-react";
import {
  checkFraudRiskAction,
  createPathaoShipmentAction,
  saveOrderAdminNotesAction,
  syncCourierStatusAction,
  syncPaymentStatusAction,
  type OrderActionState,
} from "@/app/admin/(panel)/orders/actions";
import { cn } from "@/lib/utils";

type OperationalAction = (
  state: OrderActionState,
  formData: FormData,
) => Promise<OrderActionState>;

const initialActionState: OrderActionState = {};

export function FraudRiskCheckForm({ orderId }: { orderId: string }) {
  return (
    <OperationalActionForm
      action={checkFraudRiskAction}
      icon={SearchCheck}
      label="Check Fraud/Risk"
      orderId={orderId}
      pendingLabel="Checking..."
    />
  );
}

export function PaymentSyncForm({ orderId }: { orderId: string }) {
  return (
    <OperationalActionForm
      action={syncPaymentStatusAction}
      icon={RefreshCw}
      label="Sync Payment Status"
      orderId={orderId}
      pendingLabel="Syncing..."
    />
  );
}

export function PathaoShipmentForm({ orderId }: { orderId: string }) {
  return (
    <OperationalActionForm
      action={createPathaoShipmentAction}
      icon={Send}
      label="Create Pathao Shipment"
      orderId={orderId}
      pendingLabel="Creating..."
    />
  );
}

export function CourierSyncForm({ orderId }: { orderId: string }) {
  return (
    <OperationalActionForm
      action={syncCourierStatusAction}
      icon={RefreshCw}
      label="Sync Courier Status"
      orderId={orderId}
      pendingLabel="Syncing..."
    />
  );
}

export function OrderAdminNotesForm({
  adminNotes,
  orderId,
}: {
  adminNotes: string | null;
  orderId: string;
}) {
  const [state, formAction] = useActionState(
    saveOrderAdminNotesAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input name="orderId" type="hidden" value={orderId} />
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase text-zinc-500">
          Internal Order Notes
        </span>
        <textarea
          className={cn(inputClassName, "min-h-36 resize-y py-3")}
          defaultValue={adminNotes ?? ""}
          maxLength={2000}
          name="adminNotes"
          placeholder="Private fulfillment, payment, or support notes"
        />
      </label>
      <p className="text-xs font-semibold text-zinc-500">
        Internal only. Customers cannot see these notes.
      </p>
      <ActionMessage state={state} />
      <SubmitButton icon={Save} label="Save Note" pendingLabel="Saving..." />
    </form>
  );
}

function OperationalActionForm({
  action,
  icon,
  label,
  orderId,
  pendingLabel,
}: {
  action: OperationalAction;
  icon: LucideIcon;
  label: string;
  orderId: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="grid gap-3">
      <input name="orderId" type="hidden" value={orderId} />
      <ActionMessage state={state} />
      <SubmitButton icon={icon} label={label} pendingLabel={pendingLabel} />
    </form>
  );
}

function SubmitButton({
  icon: Icon,
  label,
  pendingLabel,
}: {
  icon: LucideIcon;
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={primaryButtonClassName} disabled={pending} type="submit">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}

function ActionMessage({ state }: { state: OrderActionState }) {
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

function FormActions({ children }: { children: ReactNode }) {
  return <div className="grid gap-2 sm:grid-cols-2">{children}</div>;
}

export function CourierActionGroup({ orderId }: { orderId: string }) {
  return (
    <FormActions>
      <PathaoShipmentForm orderId={orderId} />
      <CourierSyncForm orderId={orderId} />
    </FormActions>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70";
