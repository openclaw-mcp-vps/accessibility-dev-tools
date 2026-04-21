import Link from "next/link";
import { BarChart3, Lock, ShieldCheck } from "lucide-react";

import { ClearAccessButton } from "@/components/ClearAccessButton";
import { ScreenReaderOptimized } from "@/components/ScreenReaderOptimized";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessIdentity, hasPaidAccess } from "@/lib/access-token";

export default async function DashboardPage() {
  const hasAccess = await hasPaidAccess();
  const identity = await getAccessIdentity();
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

  return (
    <ScreenReaderOptimized initialAnnouncement="Dashboard loaded. Subscription status is shown in the first panel.">
      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Manage access and launch accessibility-focused development tools.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </header>

        {!hasAccess ? (
          <section className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <Card className="border-[#f85149]/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-5 w-5 text-[#f85149]" aria-hidden="true" />
                  Paid Access Required
                </CardTitle>
                <CardDescription>
                  The editor, audio diagnostics, and keyboard navigation toolset are protected behind your active subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <p>
                  1. Complete checkout in Stripe.
                  <br />
                  2. Stripe webhook marks your purchase as active.
                  <br />
                  3. Enter your purchase email to issue your access cookie.
                </p>
                <a
                  href={stripePaymentLink}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[#24903b] sm:w-auto"
                >
                  Buy Access for $15/mo
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unlock After Purchase</CardTitle>
                <CardDescription>
                  Use the exact email address from your Stripe receipt to unlock your account on this browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnlockAccessForm />
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#7ee787]" aria-hidden="true" />
                  Access Active
                </CardTitle>
                <CardDescription>
                  Logged in as {identity?.email}. Your access cookie is active on this browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link href="/editor">
                  <Button>Open Accessible Editor</Button>
                </Link>
                <ClearAccessButton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  Weekly Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <Badge variant="secondary">Editor Time Saved: 4.5h</Badge>
                <p>Automated checks prevented 12 high-severity accessibility regressions in the last week.</p>
                <p>Shortcut adoption reached 91% among active sessions.</p>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </ScreenReaderOptimized>
  );
}
