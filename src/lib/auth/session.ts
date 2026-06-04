import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
  verifyAdminSessionToken,
  type AdminSessionPayload,
} from "@/lib/auth/session-token";

export async function createSession(adminId: string, roleId: string) {
  const issuedAt = Date.now();
  const payload: AdminSessionPayload = {
    adminId,
    roleId,
    issuedAt,
    expiresAt: issuedAt + adminSessionMaxAgeSeconds * 1000,
  };
  const token = await createAdminSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAgeSeconds,
  });

  return payload;
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;

  return verifyAdminSessionToken(token);
}
