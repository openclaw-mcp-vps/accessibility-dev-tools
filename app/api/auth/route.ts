import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, accessCookieOptions, createAccessToken } from "@/lib/auth";
import { getEntitlementBySession } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

interface AuthRequestBody {
  sessionId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AuthRequestBody;
  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return NextResponse.json({ message: "Missing Stripe checkout session ID." }, { status: 400 });
  }

  const entitlement = await getEntitlementBySession(sessionId);

  if (!entitlement || entitlement.status !== "active") {
    return NextResponse.json(
      {
        message:
          "This checkout session is not paid yet. Wait a moment for the webhook or confirm the correct session ID.",
      },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken(sessionId), accessCookieOptions);

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...accessCookieOptions,
    maxAge: 0,
  });
  return response;
}
