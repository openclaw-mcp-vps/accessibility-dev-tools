import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  DatabaseSchema,
  StoredSession,
  StoredSubscription,
  SubscriptionStatus
} from "@/types/accessibility";

const databaseDir = path.join(process.cwd(), "data");
const databasePath = path.join(databaseDir, "store.json");

const emptyDatabase: DatabaseSchema = {
  subscriptions: [],
  sessions: [],
  webhookEvents: []
};

async function ensureDatabaseFile(): Promise<void> {
  await fs.mkdir(databaseDir, { recursive: true });

  try {
    await fs.access(databasePath);
  } catch {
    await fs.writeFile(databasePath, JSON.stringify(emptyDatabase, null, 2), "utf8");
  }
}

function normalizeDatabaseShape(candidate: Partial<DatabaseSchema>): DatabaseSchema {
  return {
    subscriptions: Array.isArray(candidate.subscriptions) ? candidate.subscriptions : [],
    sessions: Array.isArray(candidate.sessions) ? candidate.sessions : [],
    webhookEvents: Array.isArray(candidate.webhookEvents) ? candidate.webhookEvents : []
  };
}

async function readDatabase(): Promise<DatabaseSchema> {
  await ensureDatabaseFile();
  const raw = await fs.readFile(databasePath, "utf8");

  try {
    return normalizeDatabaseShape(JSON.parse(raw) as Partial<DatabaseSchema>);
  } catch {
    return { ...emptyDatabase };
  }
}

async function writeDatabase(nextValue: DatabaseSchema): Promise<void> {
  await fs.writeFile(databasePath, JSON.stringify(nextValue, null, 2), "utf8");
}

async function updateDatabase<T>(updater: (state: DatabaseSchema) => T): Promise<T> {
  const state = await readDatabase();
  const result = updater(state);
  await writeDatabase(state);
  return result;
}

export async function findSubscriptionByEmail(email: string): Promise<StoredSubscription | null> {
  const state = await readDatabase();
  const normalized = email.trim().toLowerCase();
  return state.subscriptions.find((subscription) => subscription.email === normalized) ?? null;
}

export async function findSubscriptionByCustomerId(
  customerId: string
): Promise<StoredSubscription | null> {
  const state = await readDatabase();
  return (
    state.subscriptions.find((subscription) => subscription.customerId === customerId) ?? null
  );
}

export async function findActiveSubscriptionByEmail(
  email: string
): Promise<StoredSubscription | null> {
  const subscription = await findSubscriptionByEmail(email);
  if (!subscription || subscription.status !== "active") {
    return null;
  }

  return subscription;
}

interface SubscriptionUpsertInput {
  email: string;
  status: SubscriptionStatus;
  source: "stripe" | "manual";
  customerId?: string;
  eventId?: string;
}

export async function upsertSubscription(input: SubscriptionUpsertInput): Promise<StoredSubscription> {
  return updateDatabase((state) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const now = new Date().toISOString();

    const existingIndex = state.subscriptions.findIndex(
      (subscription) => subscription.email === normalizedEmail
    );

    const subscription: StoredSubscription = {
      email: normalizedEmail,
      status: input.status,
      source: input.source,
      customerId: input.customerId,
      lastEventId: input.eventId,
      updatedAt: now
    };

    if (existingIndex >= 0) {
      const current = state.subscriptions[existingIndex];
      state.subscriptions[existingIndex] = {
        ...current,
        ...subscription,
        customerId: input.customerId ?? current.customerId
      };
      return state.subscriptions[existingIndex];
    }

    state.subscriptions.push(subscription);
    return subscription;
  });
}

export async function updateSubscriptionStatusByCustomerId(
  customerId: string,
  status: SubscriptionStatus,
  eventId?: string
): Promise<StoredSubscription | null> {
  return updateDatabase((state) => {
    const target = state.subscriptions.find((subscription) => subscription.customerId === customerId);
    if (!target) {
      return null;
    }

    target.status = status;
    target.lastEventId = eventId;
    target.updatedAt = new Date().toISOString();
    return target;
  });
}

export async function createSession(input: StoredSession): Promise<void> {
  await updateDatabase((state) => {
    state.sessions = state.sessions.filter((session) => session.tokenHash !== input.tokenHash);
    state.sessions.push(input);
  });
}

export async function getSessionByTokenHash(tokenHash: string): Promise<StoredSession | null> {
  const state = await readDatabase();
  const now = Date.now();
  const session = state.sessions.find((entry) => entry.tokenHash === tokenHash);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= now) {
    await deleteSession(tokenHash);
    return null;
  }

  return session;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await updateDatabase((state) => {
    state.sessions = state.sessions.filter((session) => session.tokenHash !== tokenHash);
  });
}

export async function removeExpiredSessions(): Promise<void> {
  await updateDatabase((state) => {
    const now = Date.now();
    state.sessions = state.sessions.filter((session) => session.expiresAt > now);
  });
}

export async function rememberWebhookEvent(eventId: string): Promise<boolean> {
  return updateDatabase((state) => {
    if (state.webhookEvents.includes(eventId)) {
      return false;
    }

    state.webhookEvents.push(eventId);

    if (state.webhookEvents.length > 3000) {
      state.webhookEvents = state.webhookEvents.slice(-3000);
    }

    return true;
  });
}
