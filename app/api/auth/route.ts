import { NextRequest, NextResponse } from "next/server";

import {
  accessCookieOptions,
  ACCESS_COOKIE_NAME,
  createAccessToken,
  getAccessSessionFromCookie,
  isPaidEmail
} from "@/lib/auth";

function normalizeRedirectPath(value: string | undefined): string {
  if (!value) {
    return "/dashboard";
  }

  return value.startsWith("/") ? value : "/dashboard";
}

export async function GET() {
  const session = await getAccessSessionFromCookie();

  return NextResponse.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
    expiresAt: session?.expiresAt ?? null
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  let email = "";
  let redirectTo = "/dashboard";
  let expectsRedirect = false;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: string; redirectTo?: string };
    email = body.email ?? "";
    redirectTo = normalizeRedirectPath(body.redirectTo);
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") ?? "");
    redirectTo = normalizeRedirectPath(String(formData.get("redirectTo") ?? "/dashboard"));
    expectsRedirect = true;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    if (expectsRedirect) {
      return NextResponse.redirect(new URL(`${redirectTo}?auth=invalid-email`, request.url));
    }

    return NextResponse.json(
      { authenticated: false, message: "A valid purchase email is required." },
      { status: 400 }
    );
  }

  const paid = await isPaidEmail(normalizedEmail);

  if (!paid) {
    if (expectsRedirect) {
      return NextResponse.redirect(new URL(`${redirectTo}?auth=not-found`, request.url));
    }

    return NextResponse.json(
      {
        authenticated: false,
        message:
          "No active subscription found for this email yet. Complete checkout and retry in 15-30 seconds."
      },
      { status: 402 }
    );
  }

  const token = createAccessToken(normalizedEmail);

  if (expectsRedirect) {
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.set(ACCESS_COOKIE_NAME, token, accessCookieOptions());
    return response;
  }

  const response = NextResponse.json({
    authenticated: true,
    email: normalizedEmail
  });
  response.cookies.set(ACCESS_COOKIE_NAME, token, accessCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...accessCookieOptions(),
    maxAge: 0
  });
  return response;
}
