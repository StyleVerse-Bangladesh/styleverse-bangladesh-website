import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from "@/lib/auth/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/bms")) {
    return NextResponse.next();
  }

  const session = await verifyAdminSessionToken(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (pathname === "/bms/login") {
    if (session) {
      return NextResponse.redirect(new URL("/bms", request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/bms/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bms/:path*"],
};
