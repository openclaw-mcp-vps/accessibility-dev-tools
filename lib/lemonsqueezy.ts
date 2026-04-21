import crypto from "node:crypto";

import LemonSqueezy from "@lemonsqueezy/lemonsqueezy.js";

let lemonConfigured = false;
let lemonClient: LemonSqueezy | null = null;

export function configureLemonSqueezyClient(): void {
  if (lemonConfigured) {
    return;
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return;
  }

  lemonClient = new LemonSqueezy(apiKey);

  lemonConfigured = true;
}

function parseStripeSignatureHeader(headerValue: string): {
  timestamp: string;
  signatures: string[];
} {
  const parts = headerValue.split(",").map((part) => part.trim());

  let timestamp = "";
  const signatures: string[] = [];

  for (const part of parts) {
    if (part.startsWith("t=")) {
      timestamp = part.replace("t=", "");
      continue;
    }

    if (part.startsWith("v1=")) {
      signatures.push(part.replace("v1=", ""));
    }
  }

  return { timestamp, signatures };
}

function safeCompareHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyStripeWebhookSignature(input: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
}): boolean {
  const { payload, signatureHeader, secret } = input;

  if (!signatureHeader) {
    return false;
  }

  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((candidate) => safeCompareHex(candidate, expectedSignature));
}

export interface StripeWebhookEvent {
  id?: string;
  type?: string;
  data?: {
    object?: Record<string, unknown>;
  };
}

export function extractCustomerEmail(event: StripeWebhookEvent): string | null {
  const object = event.data?.object;
  if (!object) {
    return null;
  }

  const directEmail = object.customer_email;
  if (typeof directEmail === "string") {
    return directEmail.trim().toLowerCase();
  }

  const customerDetails = object.customer_details;
  if (customerDetails && typeof customerDetails === "object") {
    const maybeEmail = (customerDetails as { email?: unknown }).email;
    if (typeof maybeEmail === "string") {
      return maybeEmail.trim().toLowerCase();
    }
  }

  return null;
}

export function extractCustomerId(event: StripeWebhookEvent): string | undefined {
  const object = event.data?.object;
  if (!object) {
    return undefined;
  }

  return typeof object.customer === "string" ? object.customer : undefined;
}
