import { NextRequest, NextResponse } from "next/server";

import {
  extractCustomerEmail,
  extractCustomerId,
  type StripeWebhookEvent,
  verifyStripeWebhookSignature
} from "@/lib/lemonsqueezy";
import {
  rememberWebhookEvent,
  upsertSubscription,
  updateSubscriptionStatusByCustomerId
} from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawPayload = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signatureHeader = request.headers.get("stripe-signature");
    const isValid = verifyStripeWebhookSignature({
      payload: rawPayload,
      signatureHeader,
      secret: webhookSecret
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(rawPayload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Webhook payload is not valid JSON." }, { status: 400 });
  }

  if (!event.id || !event.type) {
    return NextResponse.json({ error: "Webhook is missing required event fields." }, { status: 400 });
  }

  const isNewEvent = await rememberWebhookEvent(event.id);
  if (!isNewEvent) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  const customerEmail = extractCustomerEmail(event);
  const customerId = extractCustomerId(event);

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    if (!customerEmail) {
      return NextResponse.json({ received: true, skipped: "Missing customer email." });
    }

    const subscription = await upsertSubscription({
      email: customerEmail,
      status: "active",
      source: "stripe",
      customerId,
      eventId: event.id
    });

    return NextResponse.json({ received: true, subscription });
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "invoice.payment_failed"
  ) {
    if (customerEmail) {
      const subscription = await upsertSubscription({
        email: customerEmail,
        status: "canceled",
        source: "stripe",
        customerId,
        eventId: event.id
      });

      return NextResponse.json({ received: true, subscription });
    }

    if (customerId) {
      await updateSubscriptionStatusByCustomerId(customerId, "canceled", event.id);
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, ignoredType: event.type });
}
