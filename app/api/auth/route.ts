import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_OPTIONS,
  clearAccessToken,
  createAccessSession,
  getEmailFromAccessToken,
  isValidEmail,
  normalizeEmail
} from "@/lib/auth";
import { findActiveSubscriptionByEmail, removeExpiredSessions } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  await removeExpiredSessions();

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const email = await getEmailFromAccessToken(token);

  return NextResponse.json({
    authenticated: Boolean(email),
    email
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: { email?: string };

  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(payload.email ?? "");

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter the same email you used in Stripe checkout." },
      { status: 400 }
    );
  }

  const subscription = await findActiveSubscriptionByEmail(email);

  if (!subscription) {
    return NextResponse.json(
      {
        error:
          "No active subscription was found for that email yet. Complete checkout first, or wait up to one minute for webhook sync."
      },
      { status: 403 }
    );
  }

  const { token, expiresAt } = await createAccessSession(email);
  const response = NextResponse.json({
    authenticated: true,
    email,
    expiresAt
  });

  response.cookies.set(ACCESS_COOKIE_NAME, token, ACCESS_COOKIE_OPTIONS);
  return response;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  await clearAccessToken(token);

  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...ACCESS_COOKIE_OPTIONS,
    maxAge: 0
  });

  return response;
}
