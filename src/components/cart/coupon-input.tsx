"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useCartSummary } from "@/hooks/use-cart-summary";
import type { Coupon } from "@/types/coupon";

type CouponInputProps = {
  className?: string;
};

export function CouponInput({ className }: CouponInputProps) {
  const { subtotal, appliedCoupon } = useCartSummary();
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const [code, setCode] = useState(appliedCoupon?.code ?? "");
  const [message, setMessage] = useState(
    appliedCoupon ? `${appliedCoupon.code} applied.` : "",
  );
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!appliedCoupon) {
      return;
    }

    setCode(appliedCoupon.code);
    setMessage(`${appliedCoupon.code} applied.`);
    setError("");
  }, [appliedCoupon]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    setCode(normalizedCode);
    setMessage("");
    setError("");
    setIsApplying(true);

    const result = await validateCouponCode(normalizedCode, subtotal);
    setIsApplying(false);

    if (!result.isValid || !result.coupon) {
      setError(result.error ?? "Coupon could not be applied.");
      return;
    }

    applyCoupon({
      code: result.coupon.code,
      couponId: result.coupon.id,
      type: result.coupon.type,
      value: result.coupon.value,
      minimumOrder: result.coupon.minimumOrder,
      validUntil: result.coupon.validUntil,
    });
    setMessage(`${result.coupon.code} applied.`);
  }

  function handleRemove() {
    removeCoupon();
    setCode("");
    setMessage("");
    setError("");
  }

  return (
    <div
      className={cn(
        "rounded-md border border-zinc-200 bg-white p-3 text-black",
        className,
      )}
    >
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setError("");
            setMessage("");
          }}
          placeholder="Enter coupon code"
          className="h-10 min-h-10 flex-1 uppercase"
          aria-label="Coupon code"
        />
        <Button
          type="submit"
          className="h-10 min-h-10 shrink-0 px-3"
          disabled={!code.trim() || isApplying}
        >
          {isApplying ? "Applying" : "Apply"}
        </Button>
      </form>

      <div className="mt-2 flex min-h-5 items-start justify-between gap-2 text-xs">
        <div aria-live="polite">
          {error ? (
            <p className="font-medium text-red-600">{error}</p>
          ) : message ? (
            <p className="font-medium text-emerald-700">{message}</p>
          ) : null}
        </div>
        {appliedCoupon ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto min-h-0 shrink-0 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-black"
            onClick={handleRemove}
          >
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

async function validateCouponCode(code: string, subtotal: number) {
  try {
    const response = await fetch("/api/coupons/validate", {
      body: JSON.stringify({ code, subtotal }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return {
        error: "Coupon could not be applied.",
        isValid: false,
      } satisfies CouponValidationResponse;
    }

    return (await response.json()) as CouponValidationResponse;
  } catch {
    return {
      error: "Coupon could not be applied.",
      isValid: false,
    } satisfies CouponValidationResponse;
  }
}

type CouponValidationResponse = {
  coupon?: Coupon;
  error?: string;
  isValid: boolean;
};
