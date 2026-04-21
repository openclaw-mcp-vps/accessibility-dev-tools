import { createHmac, timingSafeEqual } from "crypto";

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function getStripePaymentLink(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string | undefined
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const values = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => part.trim().split("="))
      .filter((pair): pair is [string, string] => pair.length === 2)
  );

  const timestamp = values.t;
  const signature = values.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return safeCompare(signature, expected);
}

export function parseStripeWebhookEvent(payload: string): StripeWebhookEvent | null {
  try {
    const parsed = JSON.parse(payload) as StripeWebhookEvent;
    if (!parsed?.type || !parsed?.data?.object) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function extractEmailFromCheckoutEvent(event: StripeWebhookEvent): string | null {
  const object = event.data.object;

  if (!object) {
    return null;
  }

  const emailFromCustomer = object.customer_email;
  if (typeof emailFromCustomer === "string" && emailFromCustomer.includes("@")) {
    return emailFromCustomer;
  }

  const customerDetails = object.customer_details;
  if (
    typeof customerDetails === "object" &&
    customerDetails !== null &&
    "email" in customerDetails
  ) {
    const email = customerDetails.email;
    if (typeof email === "string" && email.includes("@")) {
      return email;
    }
  }

  return null;
}
