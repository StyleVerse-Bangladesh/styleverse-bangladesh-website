"use client";

import { useState, useTransition } from "react";
import { Loader2, PlugZap } from "lucide-react";
import {
  testPathaoConnectionAction,
  type PathaoConnectionActionState,
} from "@/app/admin/(panel)/settings/courier/actions";
import { cn } from "@/lib/utils";

type PathaoConnectionTestProps = {
  accountId: string;
  initialTokenExpiresAt: string | null;
  provider: string;
};

type TokenStatus = "Connected" | "Failed" | "Not Connected";

export function PathaoConnectionTest({
  accountId,
  initialTokenExpiresAt,
  provider,
}: PathaoConnectionTestProps) {
  const [result, setResult] = useState<PathaoConnectionActionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const tokenExpiresAt = result?.tokenExpiresAt ?? initialTokenExpiresAt;
  const status = getTokenStatus(result, tokenExpiresAt);

  if (provider !== "PATHAO") {
    return null;
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TokenStatusBadge status={status} />
        {tokenExpiresAt ? (
          <span className="text-xs font-semibold text-zinc-500">
            Token expires at {tokenExpiresAt}
          </span>
        ) : null}
      </div>

      <button
        className={secondaryButtonClassName}
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setResult(await testPathaoConnectionAction(accountId));
          });
        }}
        type="button"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <PlugZap className="h-4 w-4" aria-hidden="true" />
        )}
        {isPending ? "Testing..." : "Test Connection"}
      </button>

      {result ? <ConnectionResultMessage result={result} /> : null}
    </div>
  );
}

function getTokenStatus(
  result: PathaoConnectionActionState | null,
  tokenExpiresAt: string | null,
): TokenStatus {
  if (result) {
    return result.ok ? "Connected" : "Failed";
  }

  return tokenExpiresAt ? "Connected" : "Not Connected";
}

function TokenStatusBadge({ status }: { status: TokenStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center rounded-md border px-2 text-xs font-semibold",
        status === "Connected" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "Failed" && "border-red-200 bg-red-50 text-red-700",
        status === "Not Connected" &&
          "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      {status}
    </span>
  );
}

function ConnectionResultMessage({
  result,
}: {
  result: PathaoConnectionActionState;
}) {
  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-semibold",
        result.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={result.ok ? "status" : "alert"}
    >
      {result.ok ? result.message : result.error}
    </p>
  );
}

const secondaryButtonClassName =
  "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit";
