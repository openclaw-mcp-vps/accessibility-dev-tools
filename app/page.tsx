import Link from "next/link";
import { ArrowRight, Ear, Hand, ShieldCheck, Timer, TriangleAlert } from "lucide-react";

import { AccessibilityDemo } from "@/components/AccessibilityDemo";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import type { FAQItem } from "@/types/accessibility";

const faqs: FAQItem[] = [
  {
    question: "What happens right after checkout?",
    answer:
      "Stripe completes hosted checkout, your subscription is synced by webhook, and you unlock your dashboard using the same checkout email."
  },
  {
    question: "Do the tools only work with one editor?",
    answer:
      "No. The pack includes VS Code and JetBrains profiles plus a terminal bridge for tactile and audio alerts in any CLI workflow."
  },
  {
    question: "Can teams buy licenses for blind developers?",
    answer:
      "Yes. Accessibility leads can purchase seats and onboard each engineer through individual checkout emails."
  },
  {
    question: "Is this usable by students and consultants?",
    answer:
      "Yes. The same subscription unlocks the full dashboard, extension downloads, and configuration guidance for coursework or client work."
  }
];

const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="section-shell overflow-hidden p-8 lg:p-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mono mb-4 inline-flex items-center rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-2)]">
              accessibility-tools
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Development tools for <span className="text-gradient">blind programmers</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-soft)] sm:text-lg">
              Accessibility Dev Tools upgrades mainstream IDE workflows with reliable screen reader
              narration, audio-first navigation, and tactile feedback profiles so blind engineers can code
              faster without leaving professional toolchains.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={stripePaymentLink}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0c141d] transition hover:brightness-105"
              >
                Buy Access - $15/mo
                <ArrowRight size={16} />
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md border border-[var(--line)] px-5 py-3 text-sm font-medium transition hover:border-[var(--line-strong)]"
              >
                Open Dashboard
              </Link>
            </div>

            <UnlockAccessForm />
          </div>

          <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(13,17,23,0.6)] p-5">
            <h2 className="text-lg font-semibold">Why This Matters</h2>
            <p className="text-sm leading-relaxed text-[var(--text-soft)]">
              Blind developers are forced to fight their tools instead of writing software. This product
              removes that friction and keeps experienced engineers in the workforce where demand is highest.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--line)] p-3">
                <p className="text-2xl font-semibold">3x</p>
                <p className="text-xs text-[var(--text-soft)]">Faster issue navigation with spoken diagnostics</p>
              </div>
              <div className="rounded-lg border border-[var(--line)] p-3">
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-[var(--text-soft)]">Need to switch to limited legacy editors</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="problem" className="section-shell p-6 lg:p-8">
        <h2 className="text-2xl font-semibold">The Problem</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.55)] p-4">
            <TriangleAlert className="mb-2" size={18} />
            <h3 className="font-medium">Noisy, ambiguous screen reader output</h3>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Core editor actions frequently produce verbose output that hides critical navigation context.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.55)] p-4">
            <Timer className="mb-2" size={18} />
            <h3 className="font-medium">Slow code traversal under deadline pressure</h3>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Finding symbols, diagnostics, and references can take minutes instead of seconds in large repos.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.55)] p-4">
            <ShieldCheck className="mb-2" size={18} />
            <h3 className="font-medium">Talent lost to inaccessible tooling</h3>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Companies lose skilled engineers because modern IDEs still assume visual-first workflows.
            </p>
          </article>
        </div>
      </section>

      <section id="solution" className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell p-6 lg:p-8">
          <h2 className="text-2xl font-semibold">The Solution</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">
            Accessibility Dev Tools delivers practical improvements where blind developers lose time the most:
            code structure movement, diagnostics triage, and continuous feedback while coding and testing.
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Ear size={16} className="mt-0.5 text-[var(--accent)]" />
              <span>Speech-tuned keymaps that announce symbols, scope, and diagnostics without extra noise.</span>
            </li>
            <li className="flex items-start gap-2">
              <Hand size={16} className="mt-0.5 text-[var(--accent)]" />
              <span>Haptic bridge scripts that convert build and test events into tactile patterns instantly.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck size={16} className="mt-0.5 text-[var(--accent)]" />
              <span>Paid dashboard with downloadable configs and an audio player for code comprehension drills.</span>
            </li>
          </ul>
        </div>

        <AccessibilityDemo />
      </section>

      <section id="pricing" className="section-shell p-6 lg:p-8">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            <p className="text-sm leading-relaxed text-[var(--text-soft)]">
              Built for blind software engineers, accessibility consultants who code, and computer science
              students preparing for professional developer roles.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--text-soft)]">
              <li>Full dashboard access with extension downloads</li>
              <li>Audio Code Player for line-by-line spoken review</li>
              <li>Screen reader and tactile profile updates</li>
              <li>Continuous compatibility tuning for mainstream IDE releases</li>
            </ul>
          </div>

          <aside className="rounded-2xl border border-[var(--line-strong)] bg-[rgba(22,34,50,0.7)] p-5">
            <p className="text-sm uppercase tracking-wide text-[var(--accent-2)]">Single Plan</p>
            <p className="mt-1 text-4xl font-bold">$15</p>
            <p className="text-sm text-[var(--text-soft)]">per month</p>
            <a
              href={stripePaymentLink}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0c141d] transition hover:brightness-105"
            >
              Start Subscription
            </a>
          </aside>
        </div>
      </section>

      <section id="faq" className="section-shell p-6 lg:p-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-4 grid gap-3">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.55)] p-4">
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-soft)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
