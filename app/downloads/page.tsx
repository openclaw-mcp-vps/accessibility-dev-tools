import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, getSigningSecret, readAccessCookieValue } from "@/lib/lemonsqueezy";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

export default async function DownloadsPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const session = readAccessCookieValue(accessCookie, getSigningSecret());

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-100">Downloads are available to subscribers</CardTitle>
            <CardDescription>
              Purchase the monthly plan and unlock your account in the dashboard to access extension and desktop
              tooling downloads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href={paymentLink} className="inline-flex">
              <Button>Buy for $15/month</Button>
            </a>
            <Link href="/dashboard" className="inline-flex">
              <Button variant="outline">Go to Unlock Page</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Downloads</h1>
        <p className="text-sm text-slate-300">Signed in as {session.email}. Choose a package below.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-100">VS Code Accessibility Extension</CardTitle>
            <CardDescription>
              Adds audio-first navigation commands, diagnostic announcements, and structural jump shortcuts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/api/download?target=vscode" className="inline-flex">
              <Button>Download extension.js</Button>
            </a>
            <p className="text-xs leading-relaxed text-slate-400">
              Install as part of your extension workspace and bind commands to your preferred screen reader profile.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-100">Audio Navigator Desktop Tool</CardTitle>
            <CardDescription>
              Python assistant that scans files and reads key landmarks for quick orientation outside the editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/api/download?target=audio-navigator" className="inline-flex">
              <Button>Download main.py</Button>
            </a>
            <p className="text-xs leading-relaxed text-slate-400">
              Run this tool in terminals to inspect large files and produce speech-friendly structural summaries.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
