import Link from "next/link";

import { AccessibleCodeEditor } from "@/components/AccessibleCodeEditor";
import { AudioFeedback } from "@/components/AudioFeedback";
import { ScreenReaderOptimized } from "@/components/ScreenReaderOptimized";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPaidAccess } from "@/lib/access-token";

export default async function EditorPage() {
  const hasAccess = await hasPaidAccess();
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

  if (!hasAccess) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Card className="border-[#f85149]/40">
          <CardHeader>
            <CardTitle>Editor Locked</CardTitle>
            <CardDescription>
              Purchase access and unlock this browser with your payment email to use the accessibility editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href={stripePaymentLink}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[#24903b]"
            >
              Buy Access for $15/mo
            </a>
            <UnlockAccessForm />
            <Link href="/dashboard" className="text-sm text-[#58a6ff] underline-offset-4 hover:underline">
              Return to dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <ScreenReaderOptimized initialAnnouncement="Editor loaded. Use Alt plus number keys for shortcuts.">
      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Accessibility Editor</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Code with spoken cues, keyboard shortcuts, and instant accessibility diagnostics.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </header>

        <AudioFeedback />
        <AccessibleCodeEditor />
      </main>
    </ScreenReaderOptimized>
  );
}
