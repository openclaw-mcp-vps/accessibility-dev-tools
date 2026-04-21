import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ACCESS_COOKIE_NAME = "adt_access";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type AccessPayload = {
  email: string;
  exp: number;
};

function getSecret(): string {
  return process.env.ACCESS_COOKIE_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "dev-only-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function createAccessToken(email: string): string {
  const payload: AccessPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ACCESS_COOKIE_MAX_AGE * 1000
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined): AccessPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, receivedSignature] = token.split(".");
  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (!safeEqual(receivedSignature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AccessPayload;
    if (!payload.email || typeof payload.exp !== "number") {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function hasPaidAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token) !== null;
}

export async function getAccessIdentity(): Promise<AccessPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token);
}
