import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_MAX_AGE, ACCESS_COOKIE_NAME, createAccessToken } from "@/lib/access-token";
import { hasActiveSubscriptionByEmail, hasActiveSubscriptionBySessionId } from "@/lib/lemon-squeezy";

function normalizeEmail(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = (body ?? {}) as {
    email?: unknown;
    sessionId?: unknown;
  };

  const email = normalizeEmail(payload.email);
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.trim() : "";

  if (!email && !sessionId) {
    return NextResponse.json({ error: "Provide purchase email or checkout session ID." }, { status: 400 });
  }

  let hasAccess = false;
  if (email) {
    hasAccess = await hasActiveSubscriptionByEmail(email);
  }

  if (!hasAccess && sessionId) {
    hasAccess = await hasActiveSubscriptionBySessionId(sessionId);
  }

  if (!hasAccess) {
    return NextResponse.json(
      {
        error: "No active subscription found for that purchase data. Complete checkout and wait for webhook confirmation."
      },
      { status: 403 }
    );
  }

  const token = createAccessToken(email || `session:${sessionId}`);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  return response;
}
