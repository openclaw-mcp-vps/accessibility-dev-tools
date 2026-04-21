import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  createAccessCookieValue,
  getSigningSecret,
  hasActiveEntitlement,
  normalizeEmail,
  readAccessCookieValue,
} from "@/lib/lemonsqueezy";

const THIRTY_ONE_DAYS = 60 * 60 * 24 * 31;

function readEmailFromBody(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const value = (payload as { email?: unknown }).email;
  return typeof value === "string" ? value : "";
}

export async function GET(request: NextRequest) {
  const value = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = readAccessCookieValue(value, getSigningSecret());

  return NextResponse.json({
    authenticated: Boolean(session),
    email: session?.email || null,
    plan: session?.plan || null,
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let email = "";

  if (contentType.includes("application/json")) {
    const payload = await request.json().catch(() => null);
    email = readEmailFromBody(payload);
  } else {
    const form = await request.formData().catch(() => null);
    const raw = form?.get("email");
    email = typeof raw === "string" ? raw : "";
  }

  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return NextResponse.json(
      {
        authorized: false,
        message: "Please provide the email address used at Stripe checkout.",
      },
      { status: 400 },
    );
  }

  if (!hasActiveEntitlement(normalized)) {
    return NextResponse.json(
      {
        authorized: false,
        message:
          "No active subscription found for that email. Complete checkout first, then try again with the same email.",
      },
      { status: 403 },
    );
  }

  const expiresAt = Date.now() + THIRTY_ONE_DAYS * 1000;
  const value = createAccessCookieValue(
    {
      email: normalized,
      plan: "Accessibility Dev Tools Pro",
      expiresAt,
    },
    getSigningSecret(),
  );

  const response = NextResponse.json({
    authorized: true,
    email: normalized,
    expiresAt,
  });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_ONE_DAYS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authorized: false });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
