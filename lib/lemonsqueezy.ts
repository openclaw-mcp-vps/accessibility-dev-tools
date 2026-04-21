import "server-only";

import fs from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "adt_access";

type EntitlementStatus = "active" | "inactive";

interface Entitlement {
  email: string;
  plan: string;
  status: EntitlementStatus;
  sourceEventId: string;
  provider: "stripe";
  updatedAt: string;
  currentPeriodEnd: string | null;
}

interface EntitlementStore {
  entitlements: Entitlement[];
}

interface AccessCookiePayload {
  email: string;
  plan: string;
  expiresAt: number;
}

const ENTITLEMENTS_PATH = path.join(process.cwd(), "data", "entitlements.json");

function readEntitlementStore(): EntitlementStore {
  try {
    const raw = fs.readFileSync(ENTITLEMENTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<EntitlementStore>;
    if (!Array.isArray(parsed.entitlements)) {
      return { entitlements: [] };
    }
    return { entitlements: parsed.entitlements };
  } catch {
    return { entitlements: [] };
  }
}

function writeEntitlementStore(store: EntitlementStore): void {
  fs.mkdirSync(path.dirname(ENTITLEMENTS_PATH), { recursive: true });
  fs.writeFileSync(ENTITLEMENTS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function upsertEntitlement(nextRecord: Entitlement): void {
  const store = readEntitlementStore();
  const index = store.entitlements.findIndex((entry) => entry.email === nextRecord.email);

  if (index >= 0) {
    store.entitlements[index] = nextRecord;
  } else {
    store.entitlements.push(nextRecord);
  }

  writeEntitlementStore(store);
}

export function hasActiveEntitlement(email: string): boolean {
  const normalized = normalizeEmail(email);
  const store = readEntitlementStore();
  const match = store.entitlements.find((entry) => entry.email === normalized);

  if (!match || match.status !== "active") {
    return false;
  }

  if (!match.currentPeriodEnd) {
    return true;
  }

  const end = Date.parse(match.currentPeriodEnd);
  return Number.isNaN(end) ? false : end > Date.now();
}

export function getSigningSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-signing-secret-change-me";
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signPayload(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAccessCookieValue(payload: AccessCookiePayload, secret: string): string {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function readAccessCookieValue(value: string | undefined, secret: string): AccessCookiePayload | null {
  if (!value || !value.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = signPayload(encodedPayload, secret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decodedJson = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(decodedJson) as AccessCookiePayload;
    if (!payload.email || payload.expiresAt <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function parseStripeSignatureHeader(header: string): { timestamp: string; signatures: string[] } | null {
  const chunks = header.split(",").map((part) => part.trim());
  const timestamp = chunks.find((chunk) => chunk.startsWith("t="))?.replace("t=", "");
  const signatures = chunks
    .filter((chunk) => chunk.startsWith("v1="))
    .map((chunk) => chunk.replace("v1=", ""));

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

export function verifyStripeWebhookSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) {
    return false;
  }

  const parsed = parseStripeSignatureHeader(header);
  if (!parsed) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  return parsed.signatures.some((sig) => {
    const signatureBuffer = Buffer.from(sig);
    const expectedBuffer = Buffer.from(expected);
    return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
  });
}

export function extractEmailFromStripeEvent(event: unknown): string | null {
  if (!event || typeof event !== "object") {
    return null;
  }

  const data = (event as { data?: { object?: Record<string, unknown> } }).data?.object;
  if (!data || typeof data !== "object") {
    return null;
  }

  const customerEmail = data.customer_email;
  if (typeof customerEmail === "string" && customerEmail.length > 0) {
    return normalizeEmail(customerEmail);
  }

  const customerDetails = data.customer_details;
  if (customerDetails && typeof customerDetails === "object") {
    const detailsEmail = (customerDetails as Record<string, unknown>).email;
    if (typeof detailsEmail === "string" && detailsEmail.length > 0) {
      return normalizeEmail(detailsEmail);
    }
  }

  return null;
}

export function resolveEntitlementFromEvent(event: unknown): {
  email: string | null;
  status: EntitlementStatus;
  periodEnd: string | null;
  eventId: string;
} {
  const email = extractEmailFromStripeEvent(event);

  const eventObj = event as {
    id?: string;
    type?: string;
    data?: {
      object?: {
        status?: string;
        current_period_end?: number;
      };
    };
  };

  const eventType = eventObj.type || "unknown";
  const statusText = eventObj.data?.object?.status || "";
  const isDeleted = eventType === "customer.subscription.deleted";
  const inactiveByStatus = ["canceled", "incomplete_expired", "unpaid"].includes(statusText);

  const periodEndUnix = eventObj.data?.object?.current_period_end;
  const periodEnd =
    typeof periodEndUnix === "number" && periodEndUnix > 0
      ? new Date(periodEndUnix * 1000).toISOString()
      : null;

  return {
    email,
    status: isDeleted || inactiveByStatus ? "inactive" : "active",
    periodEnd,
    eventId: eventObj.id || `evt_${Date.now()}`,
  };
}

export function recordStripeEntitlement(event: unknown): { recorded: boolean; email: string | null } {
  const resolved = resolveEntitlementFromEvent(event);
  if (!resolved.email) {
    return { recorded: false, email: null };
  }

  upsertEntitlement({
    email: resolved.email,
    plan: "Accessibility Dev Tools Pro",
    status: resolved.status,
    sourceEventId: resolved.eventId,
    provider: "stripe",
    updatedAt: new Date().toISOString(),
    currentPeriodEnd: resolved.periodEnd,
  });

  return { recorded: true, email: resolved.email };
}
