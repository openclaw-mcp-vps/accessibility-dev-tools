import { promises as fs } from "fs";
import path from "path";

export interface EntitlementRecord {
  sessionId: string;
  email: string | null;
  purchasedAt: string;
  source: "stripe_payment_link";
  status: "active" | "refunded";
}

interface EntitlementStore {
  records: EntitlementRecord[];
}

const entitlementFilePath = path.join(process.cwd(), "data", "entitlements.json");

async function ensureStore() {
  const directory = path.dirname(entitlementFilePath);
  await fs.mkdir(directory, { recursive: true });

  try {
    await fs.access(entitlementFilePath);
  } catch {
    const initialState: EntitlementStore = { records: [] };
    await fs.writeFile(entitlementFilePath, JSON.stringify(initialState, null, 2), "utf8");
  }
}

async function readStore(): Promise<EntitlementStore> {
  await ensureStore();
  const raw = await fs.readFile(entitlementFilePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as EntitlementStore;
    if (!Array.isArray(parsed.records)) {
      return { records: [] };
    }
    return parsed;
  } catch {
    return { records: [] };
  }
}

async function writeStore(store: EntitlementStore) {
  await fs.writeFile(entitlementFilePath, JSON.stringify(store, null, 2), "utf8");
}

export async function recordStripeCheckout({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string | null;
}) {
  const store = await readStore();
  const existingIndex = store.records.findIndex((record) => record.sessionId === sessionId);

  const nextRecord: EntitlementRecord = {
    sessionId,
    email,
    purchasedAt: new Date().toISOString(),
    source: "stripe_payment_link",
    status: "active",
  };

  if (existingIndex >= 0) {
    store.records[existingIndex] = {
      ...store.records[existingIndex],
      ...nextRecord,
    };
  } else {
    store.records.push(nextRecord);
  }

  await writeStore(store);
  return nextRecord;
}

export async function getEntitlementBySession(sessionId: string): Promise<EntitlementRecord | null> {
  const store = await readStore();
  return store.records.find((record) => record.sessionId === sessionId) ?? null;
}

export async function revokeEntitlement(sessionId: string) {
  const store = await readStore();
  const index = store.records.findIndex((record) => record.sessionId === sessionId);

  if (index === -1) {
    return null;
  }

  store.records[index] = {
    ...store.records[index],
    status: "refunded",
  };

  await writeStore(store);
  return store.records[index];
}
