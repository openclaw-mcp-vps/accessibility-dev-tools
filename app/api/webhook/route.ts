import { NextRequest, NextResponse } from "next/server";

import { activateSubscription, verifyStripeSignature } from "@/lib/lemon-squeezy";

type CheckoutSessionLike = {
  id?: string;
  customer_email?: string;
  customer_details?: {
    email?: string;
  };
  amount_total?: number;
  currency?: string;
};

type StripeEventLike = {
  type?: string;
  data?: {
    object?: CheckoutSessionLike;
  };
};

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  const isValid = verifyStripeSignature(payload, signature, secret);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeEventLike;
  try {
    event = JSON.parse(payload) as StripeEventLike;
  } catch {
    return NextResponse.json({ error: "Invalid Stripe event payload." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sessionId = session?.id;
    const email = session?.customer_details?.email ?? session?.customer_email;

    if (!email || !sessionId) {
      return NextResponse.json({ error: "Missing session email or id." }, { status: 400 });
    }

    const record = await activateSubscription({
      email,
      sessionId,
      amountTotal: session.amount_total,
      currency: session.currency
    });

    return NextResponse.json({ received: true, activatedFor: record.email });
  }

  return NextResponse.json({ received: true, ignored: event.type ?? "unknown" });
}
