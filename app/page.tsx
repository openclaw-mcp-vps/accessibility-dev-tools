import Link from "next/link";
import {
  Code2,
  Hand,
  Keyboard,
  Monitor,
  ShieldCheck,
  Volume2,
  Zap
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

const painPoints = [
  {
    title: "Invisible interface state",
    detail:
      "Mainstream IDEs hide critical context in visual cues. Blind developers spend extra time probing focus, panes, and diagnostics."
  },
  {
    title: "No semantic audio navigation",
    detail:
      "Standard screen readers read linearly. Jumping across symbols, errors, and diffs is slow and mentally expensive."
  },
  {
    title: "Alert fatigue",
    detail:
      "Build failures, runtime errors, and test changes are often indistinguishable in plain speech output."
  }
];

const solutionHighlights = [
  {
    icon: Volume2,
    title: "Screen Reader Optimizer",
    detail:
      "Transforms raw code text into high-signal speech output with punctuation and verbosity profiles tuned for programming."
  },
  {
    icon: Code2,
    title: "Audio Code Navigator",
    detail:
      "Adds audible landmarks for functions, classes, and comment regions so users can jump through projects quickly."
  },
  {
    icon: Hand,
    title: "Tactile Feedback Engine",
    detail:
      "Maps build events to vibration and speaker patterns so developers can feel pass/fail state instantly."
  }
];

const faqs = [
  {
    q: "Which editors are supported?",
    a: "The starter bundle targets VS Code first, with keyboard maps and speech-tuned workflows that also transfer to Cursor and VSCodium."
  },
  {
    q: "How does access control work?",
    a: "After Stripe checkout, your purchase email is activated through webhook sync. Enter the same email once to set an access cookie on your device."
  },
  {
    q: "Is this only for enterprise teams?",
    a: "No. Individual developers and students can subscribe at $15/month, and teams can standardize their accessibility tooling with the same package."
  },
  {
    q: "Do I need proprietary hardware?",
    a: "No. Tactile feedback runs on devices with vibration support and can fall back to audio cues for desktop-only setups."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-20 pt-10 sm:px-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monitor className="h-7 w-7 text-cyan-300" aria-hidden />
          <p className="text-sm font-semibold tracking-wide text-slate-200">
            Accessibility Dev Tools
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-cyan-200 underline-offset-4 hover:underline">
          Open Dashboard
        </Link>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge>Accessibility Tools • $15/month</Badge>
          <h1 className="text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
            Development tools for blind programmers
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Ship faster with an IDE workflow designed around screen readers, audio landmarks,
            and tactile build signals. Accessibility Dev Tools turns mainstream editors into
            professional environments for blind developers.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={paymentLink} target="_blank" rel="noreferrer">
              <Button size="lg">Start Full Access</Button>
            </a>
            <Link href="/download">
              <Button size="lg" variant="secondary">
                Explore Downloads
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            Built for blind software engineers, accessibility consultants, and CS students who
            need production-grade tooling.
          </p>
        </div>

        <Card className="border-cyan-400/30 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-200">
              <ShieldCheck className="h-5 w-5" aria-hidden />
              What You Unlock
            </CardTitle>
            <CardDescription>
              A focused toolkit for coding speed, confidence, and independence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-200">
            <p className="rounded-md border border-slate-700 bg-slate-950/50 p-3">
              Screen-reader optimized code narration with punctuation-aware speech and semantic
              region summaries.
            </p>
            <p className="rounded-md border border-slate-700 bg-slate-950/50 p-3">
              Audio-first symbol navigation that reduces the need to scan line by line.
            </p>
            <p className="rounded-md border border-slate-700 bg-slate-950/50 p-3">
              Tactile and audio alert profiles for test, lint, and deployment outcomes.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="problem" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-slate-100">The Problem</h2>
          <p className="max-w-3xl text-slate-300">
            Blind developers face constant friction in mainstream IDEs that were built for visual
            workflows first. That friction translates into slower delivery, higher cognitive load,
            and lost engineering talent.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {painPoints.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="solution" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-slate-100">The Solution</h2>
          <p className="max-w-3xl text-slate-300">
            Accessibility Dev Tools layers practical, high-speed accessibility features on top of
            the editor stack your team already uses.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {solutionHighlights.map((item) => (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <item.icon className="h-5 w-5 text-cyan-300" aria-hidden />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="space-y-6">
        <h2 className="text-3xl font-semibold text-slate-100">Pricing</h2>
        <Card className="border-cyan-500/30 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-2xl">Professional Access</CardTitle>
            <CardDescription>Everything you need to code independently in modern IDEs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-4xl font-bold text-cyan-200">
              $15
              <span className="ml-2 text-base font-normal text-slate-300">/ month</span>
            </p>
            <ul className="space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <Keyboard className="mt-0.5 h-4 w-4 text-cyan-300" aria-hidden />
                Accessible keyboard mappings for navigation, diagnostics, and refactors
              </li>
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-cyan-300" aria-hidden />
                Audio code navigation utilities with semantic anchors
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" aria-hidden />
                Cookie-based paid access to dashboard, downloads, and updates
              </li>
            </ul>
            <a href={paymentLink} target="_blank" rel="noreferrer">
              <Button size="lg" className="w-full sm:w-auto">
                Buy With Stripe Checkout
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>

      <section id="faq" className="space-y-6">
        <h2 className="text-3xl font-semibold text-slate-100">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-200"
            >
              <summary className="cursor-pointer list-none text-base font-semibold">
                {item.q}
              </summary>
              <p className="mt-3 text-sm text-slate-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
