import crypto from "crypto";
import { NextResponse } from "next/server";
import { recordStripeCheckout, revokeEntitlement } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const segments = signatureHeader.split(",").map((item) => item.trim());
  const timestamp = segments.find((part) => part.startsWith("t="))?.replace("t=", "");
  const signatures = segments
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.replace("v1=", ""))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((signature) => secureCompare(signature, expected));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ message: "STRIPE_WEBHOOK_SECRET is missing." }, { status: 500 });
  }

  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature") || "";

  if (!verifyStripeSignature(payload, signatureHeader, webhookSecret)) {
    return NextResponse.json({ message: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data?: {
      object?: {
        id?: string;
        customer_email?: string | null;
        customer_details?: {
          email?: string | null;
        };
      };
    };
  };

  const sessionId = event.data?.object?.id;
  const email = event.data?.object?.customer_details?.email || event.data?.object?.customer_email || null;

  if (event.type === "checkout.session.completed" && sessionId) {
    await recordStripeCheckout({ sessionId, email });
  }

  if ((event.type === "charge.refunded" || event.type === "checkout.session.expired") && sessionId) {
    await revokeEntitlement(sessionId);
  }

  return NextResponse.json({ received: true });
}
