import crypto from "crypto";

export const ACCESS_COOKIE_NAME = "adt_access";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

interface AccessTokenPayload {
  sid: string;
  exp: number;
}

type CookieStoreLike = {
  get: (name: string) => { name: string; value: string } | undefined;
};

function getSigningSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-development-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(value).digest("hex");
}

function encodePayload(payload: AccessTokenPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string): AccessTokenPayload | null {
  try {
    const raw = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as AccessTokenPayload;

    if (typeof parsed.sid !== "string" || typeof parsed.exp !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createAccessToken(sessionId: string) {
  const payload: AccessTokenPayload = {
    sid: sessionId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
  };

  const encoded = encodePayload(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAccessToken(token: string | undefined | null): AccessTokenPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const providedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  const payload = decodePayload(encoded);
  if (!payload) {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function hasPaidAccess(cookieStore: CookieStoreLike) {
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token) !== null;
}

export const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ACCESS_TOKEN_TTL_SECONDS,
};
