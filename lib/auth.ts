import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { cookies } from "next/headers";

export const ACCESS_COOKIE_NAME = "adt_access";
const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;
const PAID_EMAILS_FILE = path.join(process.cwd(), ".data", "paid-emails.json");

interface PaidStore {
  emails: string[];
}

export interface AccessSession {
  email: string;
  expiresAt: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function readPaidStore(): Promise<PaidStore> {
  try {
    const raw = await readFile(PAID_EMAILS_FILE, "utf8");
    const parsed = JSON.parse(raw) as PaidStore;

    if (!Array.isArray(parsed.emails)) {
      return { emails: [] };
    }

    return {
      emails: parsed.emails.map((email) => normalizeEmail(email)).filter(Boolean)
    };
  } catch {
    return { emails: [] };
  }
}

async function writePaidStore(store: PaidStore): Promise<void> {
  await mkdir(path.dirname(PAID_EMAILS_FILE), { recursive: true });
  await writeFile(PAID_EMAILS_FILE, JSON.stringify(store, null, 2), "utf8");
}

function signingSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-accessibility-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export async function markEmailAsPaid(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return false;
  }

  const store = await readPaidStore();
  if (!store.emails.includes(normalized)) {
    store.emails.push(normalized);
    await writePaidStore(store);
  }

  return true;
}

export async function isPaidEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return false;
  }

  const store = await readPaidStore();
  return store.emails.includes(normalized);
}

export function createAccessToken(email: string): string {
  const expiresAt = Date.now() + ACCESS_COOKIE_TTL_SECONDS * 1000;
  const payload = Buffer.from(
    JSON.stringify({ email: normalizeEmail(email), expiresAt }),
    "utf8"
  ).toString("base64url");

  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAccessToken(token: string | null | undefined): AccessSession | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  if (!safeCompare(signature, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      expiresAt: number;
    };

    if (!parsed?.email || !parsed?.expiresAt) {
      return null;
    }

    if (parsed.expiresAt < Date.now()) {
      return null;
    }

    return {
      email: normalizeEmail(parsed.email),
      expiresAt: parsed.expiresAt
    };
  } catch {
    return null;
  }
}

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_COOKIE_TTL_SECONDS
  };
}

export async function getAccessSessionFromCookie(): Promise<AccessSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token);
}

export async function hasActiveAccessCookie(): Promise<boolean> {
  const session = await getAccessSessionFromCookie();
  return Boolean(session);
}
