import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type SubscriptionRecord = {
  email: string;
  sessionId: string;
  status: "active";
  amountTotal?: number;
  currency?: string;
  purchasedAt: string;
  updatedAt: string;
};

type SubscriptionStore = {
  subscriptions: SubscriptionRecord[];
};

const storePath = path.join(process.cwd(), "data", "subscriptions.json");

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function readStore(): Promise<SubscriptionStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as SubscriptionStore;
    if (!Array.isArray(parsed.subscriptions)) {
      return { subscriptions: [] };
    }

    return parsed;
  } catch {
    return { subscriptions: [] };
  }
}

async function writeStore(data: SubscriptionStore): Promise<void> {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(data, null, 2), "utf8");
}

export function getStripePaymentLink(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";
}

export function verifyStripeSignature(payload: string, stripeSignatureHeader: string, secret: string): boolean {
  const pairs = stripeSignatureHeader.split(",").map((entry) => entry.trim());
  const timestamp = pairs.find((entry) => entry.startsWith("t="))?.slice(2);
  const signatures = pairs
    .filter((entry) => entry.startsWith("v1="))
    .map((entry) => entry.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const digest = createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((signature) => {
    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(digest, "hex");

    if (received.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(received, expected);
  });
}

export async function activateSubscription(input: {
  email: string;
  sessionId: string;
  amountTotal?: number;
  currency?: string;
}) {
  const email = normalizeEmail(input.email);
  const now = new Date().toISOString();

  const store = await readStore();
  const existingIndex = store.subscriptions.findIndex(
    (record) => normalizeEmail(record.email) === email || record.sessionId === input.sessionId
  );

  const nextRecord: SubscriptionRecord = {
    email,
    sessionId: input.sessionId,
    status: "active",
    amountTotal: input.amountTotal,
    currency: input.currency,
    purchasedAt: existingIndex >= 0 ? store.subscriptions[existingIndex].purchasedAt : now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    store.subscriptions[existingIndex] = nextRecord;
  } else {
    store.subscriptions.push(nextRecord);
  }

  await writeStore(store);
  return nextRecord;
}

export async function hasActiveSubscriptionByEmail(email: string): Promise<boolean> {
  const target = normalizeEmail(email);
  const store = await readStore();
  return store.subscriptions.some(
    (record) => normalizeEmail(record.email) === target && record.status === "active"
  );
}

export async function hasActiveSubscriptionBySessionId(sessionId: string): Promise<boolean> {
  const store = await readStore();
  return store.subscriptions.some((record) => record.sessionId === sessionId && record.status === "active");
}
