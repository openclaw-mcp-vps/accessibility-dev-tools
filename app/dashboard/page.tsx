import Link from "next/link";
import { LayoutDashboard, LockKeyhole, LogOut, Sparkles } from "lucide-react";

import { AudioCodePlayer } from "@/components/AudioCodePlayer";
import { ScreenReaderOptimizer } from "@/components/ScreenReaderOptimizer";
import { TactileFeedbackConfig } from "@/components/TactileFeedbackConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessSessionFromCookie } from "@/lib/auth";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function authMessage(value: string | string[] | undefined): string | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === "invalid-email") {
    return "Enter the email used for checkout so your access cookie can be issued.";
  }
  if (normalized === "not-found") {
    return "That email is not activated yet. Retry after Stripe webhook processing completes.";
  }
  return null;
}

function LockedDashboard({ message }: { message: string | null }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-20">
      <Card className="w-full border-cyan-500/30 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-100">
            <LockKeyhole className="h-5 w-5" aria-hidden />
            Dashboard Locked
          </CardTitle>
          <CardDescription>
            This workspace is available to active subscribers only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-slate-200">
          <p>
            Use Stripe Checkout to subscribe, then unlock this device by entering the same email
            address you used at purchase.
          </p>

          {message ? (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <a href={paymentLink} target="_blank" rel="noreferrer">
              <Button>Start $15/mo Subscription</Button>
            </a>
            <Link href="/">
              <Button variant="secondary">View Product Details</Button>
            </Link>
          </div>

          <form action="/api/auth" method="post" className="space-y-3">
            <input type="hidden" name="redirectTo" value="/dashboard" />
            <label className="block space-y-1">
              <span className="text-slate-300">Purchase email</span>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
              />
            </label>
            <Button type="submit" variant="secondary">
              Unlock Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const [session, params] = await Promise.all([getAccessSessionFromCookie(), searchParams]);

  if (!session) {
    return <LockedDashboard message={authMessage(params.auth)} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-20 pt-10 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge>Subscriber session: {session.email}</Badge>
          <h1 className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-100">
            <LayoutDashboard className="h-7 w-7 text-cyan-300" aria-hidden />
            Accessibility Command Center
          </h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Tune narration, navigate code by sound, and configure tactile cues for build and test feedback.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/download">
            <Button variant="secondary">Download Bundles</Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-cyan-500/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <Sparkles className="h-5 w-5" aria-hidden />
              Daily Workflow
            </CardTitle>
            <CardDescription>
              Recommended sequence for maximum productivity and lower cognitive load.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-slate-200">
              <li>1. Start with Screen Reader Optimizer to set punctuation and verbosity.</li>
              <li>2. Load the active file in Audio Code Player for fast semantic scanning.</li>
              <li>3. Trigger Tactile Feedback test before running builds or full test suites.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <LogOut className="h-5 w-5" aria-hidden />
              Session Security
            </CardTitle>
            <CardDescription>
              Access persists in an HTTP-only cookie scoped to this browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-200">
            <p>
              If you share this machine, clear your site cookies or use a separate browser profile to
              protect access.
            </p>
            <p className="text-slate-400">
              Webhook-based activation ensures only paid emails can receive access tokens.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <ScreenReaderOptimizer />
        <AudioCodePlayer />
        <TactileFeedbackConfig />
      </section>
    </main>
  );
}
