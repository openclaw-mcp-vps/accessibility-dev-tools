import crypto from "node:crypto";

import { createSession, deleteSession, getSessionByTokenHash } from "@/lib/database";

export const ACCESS_COOKIE_NAME = "adt_access_session";

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function createRawSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createAccessSession(email: string): Promise<{
  token: string;
  expiresAt: number;
}> {
  const token = createRawSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

  await createSession({
    tokenHash,
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
    expiresAt
  });

  return { token, expiresAt };
}

export async function getEmailFromAccessToken(rawToken: string | undefined): Promise<string | null> {
  if (!rawToken) {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const session = await getSessionByTokenHash(tokenHash);

  if (!session) {
    return null;
  }

  return session.email;
}

export async function clearAccessToken(rawToken: string | undefined): Promise<void> {
  if (!rawToken) {
    return;
  }

  const tokenHash = hashSessionToken(rawToken);
  await deleteSession(tokenHash);
}
