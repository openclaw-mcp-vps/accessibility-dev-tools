import { NextRequest, NextResponse } from "next/server";

import { markEmailAsPaid } from "@/lib/auth";
import {
  extractEmailFromCheckoutEvent,
  parseStripeWebhookEvent,
  verifyStripeWebhookSignature
} from "@/lib/lemon-squeezy";

const ACCEPTED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded"
]);

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const verified = verifyStripeWebhookSignature(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (!verified) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 400 });
  }

  const event = parseStripeWebhookEvent(payload);
  if (!event) {
    return NextResponse.json({ ok: false, message: "Malformed webhook payload" }, { status: 400 });
  }

  if (!ACCEPTED_EVENTS.has(event.type)) {
    return NextResponse.json({ ok: true, ignored: true, type: event.type });
  }

  const email = extractEmailFromCheckoutEvent(event);
  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        message: "Checkout event did not include a customer email."
      },
      { status: 422 }
    );
  }

  const stored = await markEmailAsPaid(email);
  if (!stored) {
    return NextResponse.json(
      { ok: false, message: "Unable to activate subscription email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, activatedEmail: email.toLowerCase() });
}
