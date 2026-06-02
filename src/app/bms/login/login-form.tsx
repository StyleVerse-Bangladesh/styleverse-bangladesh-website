"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LockKeyhole } from "lucide-react";
import {
  loginAdminAction,
  type AdminLoginState,
} from "@/app/bms/login/actions";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <label
          htmlFor="admin-email"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500"
        >
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          className="h-12 rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
          required
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="admin-password"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-12 rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
          required
        />
      </div>

      {state.error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LockKeyhole className="h-4 w-4" aria-hidden="true" />
      {pending ? "Signing in..." : "Login"}
    </button>
  );
}
