import { NextResponse } from "next/server";
import { validateCouponForStorefront } from "@/lib/coupons-db";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
    subtotal?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code : "";
  const subtotal =
    typeof body?.subtotal === "number" && Number.isFinite(body.subtotal)
      ? body.subtotal
      : 0;
  const result = await validateCouponForStorefront(code, subtotal);

  return NextResponse.json(result);
}
