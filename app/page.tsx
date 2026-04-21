import Link from "next/link";
import { ArrowRight, AudioLines, Command, Ear, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { estimateReadingTime } from "@/lib/accessibility-utils";

const faqs = [
  {
    question: "How does payment unlock the product?",
    answer:
      "After checkout, Stripe sends a webhook to activate your subscription. Use your purchase email in the unlock form and the app issues a secure access cookie for instant tool access."
  },
  {
    question: "Will this work with VoiceOver, NVDA, and JAWS?",
    answer:
      "Yes. The editor layout and interactions are optimized for keyboard-first navigation and live announcements that pair well with major screen readers."
  },
  {
    question: "What can I use this for day-to-day?",
    answer:
      "Review pull requests, scan JSX for common accessibility regressions, navigate line-by-line with shortcuts, and receive spoken cues while coding."
  },
  {
    question: "Is this only for React projects?",
    answer:
      "No. The editor supports TypeScript workflows broadly, and accessibility checks can be adapted for framework-specific rules as your team standards evolve."
  }
];

const problemPoints = [
  "Code editors often expose rich visual context but weak non-visual structure, making fast orientation difficult.",
  "Accessibility regressions are usually discovered late, after visual QA, instead of during active coding.",
  "Blind developers still need auditory cues and keyboard shortcuts that communicate status without guesswork."
];

const solutionPoints = [
  {
    title: "Screen Reader Optimized Editing",
    description:
      "Semantic landmarks, live region updates, and editor announcements are designed to reduce friction during focused coding sessions.",
    icon: Ear
  },
  {
    title: "Keyboard-Native Navigation",
    description:
      "Dedicated shortcut map for focusing the editor, running checks, reading active lines, and jumping directly to diagnostics.",
    icon: Command
  },
  {
    title: "Audio Feedback Diagnostics",
    description:
      "Run immediate code scans and hear severity summaries with configurable speech rate, pitch, and tone cues.",
    icon: AudioLines
  }
];

export default function HomePage() {
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <header className="reveal flex items-center justify-between rounded-xl border border-[var(--border)] bg-[color:rgba(17,25,35,0.7)] px-4 py-3 backdrop-blur sm:px-6">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#7ee787]">Accessibility Dev Tools</p>
          <p className="text-xs text-[var(--muted-foreground)]">Development tools for blind programmers</p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-[var(--muted-foreground)] hover:text-white">
            Dashboard
          </Link>
          <a href={stripePaymentLink} className="rounded-md bg-[var(--accent)] px-3 py-2 font-medium text-[var(--accent-foreground)]">
            Buy for $15/mo
          </a>
        </nav>
      </header>

      <section className="reveal mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center" style={{ animationDelay: "90ms" }}>
        <div className="space-y-6">
          <Badge className="w-fit">Built for Non-Visual Coding</Badge>
          <h1 className="font-[var(--font-space-grotesk)] text-4xl font-bold leading-tight sm:text-5xl">
            Accessible coding tools that speak your workflow, not just your screen.
          </h1>
          <p className="max-w-xl text-lg text-[var(--muted-foreground)]">
            Accessibility Dev Tools gives blind programmers a practical workspace for coding, scanning, and navigating source
            with confidence. Every core interaction is keyboard-first, speech-aware, and tuned for real development loops.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={stripePaymentLink}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-8 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[#24903b]"
            >
              Start For $15/month
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] px-8 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
            >
              Open Dashboard
            </Link>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Fast onboarding guide included • {estimateReadingTime("audio keyboard diagnostics blind developers workflow")}
          </p>
        </div>

        <Card className="border-[#2ea043]/40 bg-[color:rgba(15,23,32,0.9)]">
          <CardHeader>
            <CardTitle className="text-xl">What You Get Immediately</CardTitle>
            <CardDescription>Everything needed to ship accessible UI without losing engineering speed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
              <strong>Audible status cues:</strong> hear check results, line context, and state changes while editing.
            </p>
            <p className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
              <strong>Shortcut-driven workflow:</strong> focus, scan, read, and jump diagnostics without leaving the keyboard.
            </p>
            <p className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
              <strong>Paywalled production features:</strong> secure cookie-based access after confirmed Stripe purchase.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="reveal mt-16" style={{ animationDelay: "160ms" }}>
        <h2 className="text-2xl font-semibold">The Problem</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {problemPoints.map((point) => (
            <Card key={point}>
              <CardContent className="p-5 text-sm text-[var(--muted-foreground)]">{point}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="reveal mt-16" style={{ animationDelay: "220ms" }}>
        <h2 className="text-2xl font-semibold">The Solution</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {solutionPoints.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-[#58a6ff]" aria-hidden="true" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-[var(--muted-foreground)]">{description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="reveal mt-16" style={{ animationDelay: "280ms" }}>
        <Card className="border-[#58a6ff]/40 bg-[color:rgba(17,25,35,0.9)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-5 w-5 text-[#58a6ff]" aria-hidden="true" />
              Pricing
            </CardTitle>
            <CardDescription>Simple monthly plan. No tier maze.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold">$15<span className="text-lg text-[var(--muted-foreground)]">/month</span></p>
            <ul className="grid gap-2 text-sm text-[var(--muted-foreground)]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#7ee787]" aria-hidden="true" />
                Full access to the accessible editor and audio diagnostics suite
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#7ee787]" aria-hidden="true" />
                Ongoing keyboard and voice-command improvements
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#7ee787]" aria-hidden="true" />
                Direct support for setup and workflow tuning
              </li>
            </ul>
            <a
              href={stripePaymentLink}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[var(--accent)] px-8 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[#24903b] sm:w-auto"
            >
              Subscribe With Stripe
            </a>
          </CardContent>
        </Card>
      </section>

      <section className="reveal mt-16" style={{ animationDelay: "340ms" }}>
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-base">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-[var(--muted-foreground)]">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mt-16 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
        <p>Accessibility Dev Tools helps blind programmers move faster while shipping inclusive software.</p>
      </footer>
    </main>
  );
}
