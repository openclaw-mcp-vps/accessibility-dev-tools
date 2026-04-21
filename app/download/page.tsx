import Link from "next/link";
import { Download, LockKeyhole, PackageCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessSessionFromCookie } from "@/lib/auth";
import { getVSCodeAccessibilityBundle } from "@/lib/ide-extensions/vscode-accessibility";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function authMessage(value: string | string[] | undefined): string | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === "invalid-email") {
    return "Enter the same email address used in Stripe checkout.";
  }
  if (normalized === "not-found") {
    return "No payment found for that email yet. Webhook sync can take a few seconds.";
  }
  return null;
}

function LockedDownloadPage({ message }: { message: string | null }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-20">
      <Card className="w-full border-cyan-500/30 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-100">
            <LockKeyhole className="h-5 w-5" aria-hidden />
            Paid Access Required
          </CardTitle>
          <CardDescription>
            Complete checkout, then unlock this device with your purchase email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-slate-200">
          <ol className="space-y-2">
            <li>1. Complete checkout with Stripe.</li>
            <li>2. Return here and submit the same email.</li>
            <li>3. Access downloads instantly with a secure cookie session.</li>
          </ol>

          {message ? (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <a href={paymentLink} target="_blank" rel="noreferrer">
              <Button>Buy Access on Stripe</Button>
            </a>
            <Link href="/">
              <Button variant="secondary">Back to Landing Page</Button>
            </Link>
          </div>

          <form action="/api/auth" method="post" className="space-y-3">
            <input type="hidden" name="redirectTo" value="/download" />
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
              Unlock Downloads
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default async function DownloadPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const [session, params] = await Promise.all([getAccessSessionFromCookie(), searchParams]);

  if (!session) {
    return <LockedDownloadPage message={authMessage(params.auth)} />;
  }

  const bundle = getVSCodeAccessibilityBundle();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-20 pt-10 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge>Subscription active for {session.email}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-slate-100">Download Accessibility Bundles</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Install the CodeSense Access Pack to activate screen-reader-first navigation and tactile
            status profiles in your editor workflow.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary">Open Dashboard</Button>
        </Link>
      </header>

      <Card className="border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-100">
            <PackageCheck className="h-5 w-5" aria-hidden />
            {bundle.bundleName}
          </CardTitle>
          <CardDescription>
            {bundle.targetIDE} {bundle.minimumVersion}+ • Includes keymap, audio workflow guide, and tactile profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-slate-200">
            {bundle.highlights.map((item) => (
              <li key={item} className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
                {item}
              </li>
            ))}
          </ul>

          <div className="grid gap-3 md:grid-cols-2">
            {bundle.assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-sm"
              >
                <p className="font-semibold text-slate-100">{asset.title}</p>
                <p className="mt-1 text-slate-300">{asset.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{asset.format}</p>
                <p className="mt-1 break-all text-[11px] text-slate-500">{asset.checksum}</p>
                <a href={asset.href} download>
                  <Button variant="secondary" size="sm" className="mt-3">
                    <Download className="mr-1 h-4 w-4" aria-hidden />
                    Download
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
