export const adminSessionCookieName = "styleverse_admin_session";
export const adminSessionMaxAgeSeconds = 60 * 60 * 8;

export type AdminSessionPayload = {
  adminId: string;
  roleId: string;
  issuedAt: number;
  expiresAt: number;
};

export async function createAdminSessionToken(
  payload: AdminSessionPayload,
) {
  const encodedPayload = base64UrlEncodeText(JSON.stringify(payload));
  const signature = await signSessionValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signSessionValue(encodedPayload);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64UrlDecodeText(encodedPayload),
    ) as AdminSessionPayload;

    if (
      typeof payload.adminId !== "string" ||
      typeof payload.roleId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function signSessionValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );

  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function getSessionSecret() {
  return (
    process.env.STYLEVERSE_ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "styleverse-development-admin-session-secret"
  );
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function base64UrlEncodeText(value: string) {
  return base64UrlEncodeBytes(textEncoder.encode(value));
}

function base64UrlDecodeText(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return textDecoder.decode(bytes);
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}
