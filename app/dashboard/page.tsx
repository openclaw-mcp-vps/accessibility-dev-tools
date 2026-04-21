import { cookies } from "next/headers";
import Link from "next/link";
import { AccessibilityDemo } from "@/components/AccessibilityDemo";
import { ScreenReaderOptimized } from "@/components/ScreenReaderOptimized";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, getSigningSecret, readAccessCookieValue } from "@/lib/lemonsqueezy";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const session = readAccessCookieValue(accessCookie, getSigningSecret());

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <ScreenReaderOptimized
          title="Subscriber dashboard locked"
          description="Purchase with Stripe and unlock using the same checkout email to access the configuration tools."
          announceOnMount="Dashboard access is currently locked. Purchase and unlock are required."
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-100">Unlock your accessibility toolkit</CardTitle>
              <CardDescription>
                This page contains the paid configuration tools. Buy your subscription first, then unlock with the
                same Stripe checkout email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <a href={paymentLink} className="inline-flex">
                <Button>Buy for $15/month</Button>
              </a>
              <UnlockAccessForm />
            </CardContent>
          </Card>
        </ScreenReaderOptimized>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <ScreenReaderOptimized
        title="Configuration dashboard"
        description="Tune audio navigation, keyboard landmarks, and tactile cues for your coding workflow."
        announceOnMount={`Welcome back. Dashboard unlocked for ${session.email}.`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-100">Subscription</CardTitle>
              <CardDescription>Active plan: {session.plan}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>Authorized account: {session.email}</p>
              <p>
                Cookie access expires on {new Date(session.expiresAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-100">Tool downloads</CardTitle>
              <CardDescription>Install the latest extension and desktop companion scripts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/downloads" className="inline-flex">
                <Button variant="outline">Open Downloads</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ScreenReaderOptimized>

      <AccessibilityDemo />
    </div>
  );
}
