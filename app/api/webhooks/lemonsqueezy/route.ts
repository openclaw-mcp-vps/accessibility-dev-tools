import { NextRequest, NextResponse } from "next/server";
import {
  getSigningSecret,
  recordStripeEntitlement,
  verifyStripeWebhookSignature,
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const SUPPORTED_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "invoice.paid",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = getSigningSecret();

  const isValidSignature = verifyStripeWebhookSignature(payload, signature, secret);
  if (!isValidSignature) {
    return NextResponse.json({ received: false, error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { type?: string };
  if (!event.type || !SUPPORTED_EVENT_TYPES.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const outcome = recordStripeEntitlement(event);
  return NextResponse.json({ received: true, recorded: outcome.recorded, email: outcome.email });
}
