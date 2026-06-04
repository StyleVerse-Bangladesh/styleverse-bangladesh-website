import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type PathaoConnectionResult =
  | {
      ok: true;
      message: string;
      tokenExpiresAt: string | null;
    }
  | {
      ok: false;
      error: string;
      tokenExpiresAt: string | null;
    };

type PathaoCredentialAccount = {
  clientIdPlaceholder: string | null;
  clientSecretPlaceholder: string | null;
  id: string;
  passwordPlaceholder: string | null;
  provider: string;
  publicConfig: Prisma.JsonValue;
  tokenExpiresAt: Date | null;
  usernamePlaceholder: string | null;
};

type PathaoTokenResponse = {
  accessToken: string;
  expiresAt: Date | null;
  refreshToken: string | null;
};

type PathaoCredentials = {
  clientId: string;
  clientSecret: string;
  password: string;
  storeId: string | null;
  username: string;
};

const pathaoProvider = "PATHAO";
const defaultAuthPath = "/aladdin/api/v1/issue-token";
const placeholderBaseUrl = "https://pathao-api-base-url-not-configured.invalid";
const realCredentialsMissingError = "Real Pathao credentials are not configured yet.";

export async function testPathaoConnection(
  accountId: string,
): Promise<PathaoConnectionResult> {
  const account = await db.courierAccount.findUnique({
    where: { id: accountId },
    select: {
      clientIdPlaceholder: true,
      clientSecretPlaceholder: true,
      id: true,
      passwordPlaceholder: true,
      provider: true,
      publicConfig: true,
      tokenExpiresAt: true,
      usernamePlaceholder: true,
    },
  });

  if (!account) {
    return {
      error: "Courier account no longer exists.",
      ok: false,
      tokenExpiresAt: null,
    };
  }

  if (account.provider !== pathaoProvider) {
    return {
      error: "Pathao connection test is only available for PATHAO accounts.",
      ok: false,
      tokenExpiresAt: toIsoString(account.tokenExpiresAt),
    };
  }

  try {
    const tokenResponse = await requestPathaoAccessToken(account);
    const tokenPlaceholder = buildConfiguredPlaceholder();

    await db.courierAccount.update({
      where: { id: account.id },
      data: {
        accessTokenPlaceholder: tokenPlaceholder,
        refreshTokenPlaceholder: tokenResponse.refreshToken
          ? buildConfiguredPlaceholder()
          : undefined,
        tokenExpiresAt: tokenResponse.expiresAt,
      },
    });

    return {
      message: "Pathao connection test succeeded.",
      ok: true,
      tokenExpiresAt: toIsoString(tokenResponse.expiresAt),
    };
  } catch (error) {
    return {
      error: normalizePathaoError(error),
      ok: false,
      tokenExpiresAt: toIsoString(account.tokenExpiresAt),
    };
  }
}

export async function requestPathaoAccessToken(
  account: PathaoCredentialAccount,
): Promise<PathaoTokenResponse> {
  const credentials = readCredentials(account);

  if (!credentials) {
    throw new PathaoConnectionError(realCredentialsMissingError);
  }

  const configuredBaseUrl = process.env.PATHAO_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl || placeholderBaseUrl;

  if (!configuredBaseUrl || baseUrl === placeholderBaseUrl) {
    throw new PathaoConnectionError("PATHAO_API_BASE_URL is not configured yet.");
  }

  const response = await fetch(buildAuthUrl(baseUrl, account.publicConfig), {
    body: JSON.stringify({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: "password",
      password: credentials.password,
      username: credentials.username,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new PathaoConnectionError(
      `Pathao authentication failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as unknown;
  const tokenResponse = parseTokenResponse(payload);

  if (!tokenResponse) {
    throw new PathaoConnectionError("Pathao token response was invalid.");
  }

  return tokenResponse;
}

function readCredentials(account: PathaoCredentialAccount): PathaoCredentials | null {
  const envCredentials = readEnvCredentials();

  if (envCredentials) {
    return envCredentials;
  }

  return readDatabasePlaceholderCredentials(account);
}

function readEnvCredentials(): PathaoCredentials | null {
  const clientId = readEnvValue("PATHAO_CLIENT_ID");
  const clientSecret = readEnvValue("PATHAO_CLIENT_SECRET");
  const username = readEnvValue("PATHAO_USERNAME");
  const password = readEnvValue("PATHAO_PASSWORD");
  const storeId = readEnvValue("PATHAO_STORE_ID");

  if (!clientId || !clientSecret || !username || !password) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    password,
    storeId,
    username,
  };
}

function readDatabasePlaceholderCredentials(
  account: PathaoCredentialAccount,
): PathaoCredentials | null {
  const clientId = readRealCredential(account.clientIdPlaceholder);
  const clientSecret = readRealCredential(account.clientSecretPlaceholder);
  const username = readRealCredential(account.usernamePlaceholder);
  const password = readRealCredential(account.passwordPlaceholder);

  if (!clientId || !clientSecret || !username || !password) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    password,
    storeId: null,
    username,
  };
}

function readEnvValue(key: string) {
  const value = process.env[key]?.trim();

  return value || null;
}

function readRealCredential(value: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("CONFIGURED_")) {
    return null;
  }

  if (/placeholder|not configured|todo/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function buildAuthUrl(baseUrl: string, publicConfig: Prisma.JsonValue) {
  const authPath = readPublicConfigString(publicConfig, "authPath") || defaultAuthPath;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/g, "");
  const normalizedAuthPath = authPath.startsWith("/") ? authPath : `/${authPath}`;

  return `${normalizedBaseUrl}${normalizedAuthPath}`;
}

function readPublicConfigString(value: Prisma.JsonValue, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const candidate = (value as Record<string, unknown>)[key];

  return typeof candidate === "string" ? candidate.trim() : "";
}

function parseTokenResponse(payload: unknown): PathaoTokenResponse | null {
  const record = readRecord(payload);
  const data = readRecord(record?.data) ?? record;
  const accessToken = readString(data, "access_token") || readString(data, "accessToken");

  if (!accessToken) {
    return null;
  }

  const refreshToken =
    readString(data, "refresh_token") || readString(data, "refreshToken") || null;
  const expiresAt = parseExpiresAt(
    readNumber(data, "expires_in") ?? readNumber(data, "expiresIn"),
    readString(data, "expires_at") || readString(data, "expiresAt"),
  );

  return {
    accessToken,
    expiresAt,
    refreshToken,
  };
}

function readRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];

  return typeof value === "string" ? value : "";
}

function readNumber(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseExpiresAt(expiresInSeconds: number | null, expiresAtValue: string) {
  if (expiresInSeconds !== null) {
    return new Date(Date.now() + expiresInSeconds * 1000);
  }

  if (!expiresAtValue) {
    return null;
  }

  const date = new Date(expiresAtValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePathaoError(error: unknown) {
  if (error instanceof PathaoConnectionError) {
    return error.message;
  }

  return "Pathao connection test failed.";
}

function buildConfiguredPlaceholder() {
  return `CONFIGURED_${new Date().toISOString()}`;
}

function toIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

class PathaoConnectionError extends Error {}
