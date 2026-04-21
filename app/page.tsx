import Link from "next/link";
import { ArrowRight, AudioLines, Ear, Hand, ShieldCheck } from "lucide-react";

const faqs = [
  {
    question: "Will this work with the IDE I already use at work?",
    answer:
      "Yes. The starter packs include profiles for VS Code and JetBrains products, plus command-line utilities that work in any terminal. You do not need to switch away from your team’s standard tooling.",
  },
  {
    question: "How does purchase verification work?",
    answer:
      "After Stripe checkout completes, we receive a signed webhook, register your paid session, and unlock your account with a secure cookie when you confirm the session ID on the download page.",
  },
  {
    question: "Do you support screen readers beyond VoiceOver?",
    answer:
      "Yes. The toolset is tested with NVDA, JAWS, VoiceOver, and Narrator. Profiles include speech pacing defaults, keyboard-focused navigation maps, and semantic alerts tuned per reader.",
  },
  {
    question: "Can teams buy this for multiple developers?",
    answer:
      "Yes. Accessibility consultants and engineering managers can provision seats and share deployment scripts for standardized onboarding across teams.",
  },
];

export default function HomePage() {
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="surface relative overflow-hidden rounded-2xl p-8 sm:p-12">
        <div className="absolute -right-24 -top-16 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
        <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100">
          Development tools for blind programmers
        </p>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Accessible coding, without compromise on speed or professional tooling.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
          Accessibility Dev Tools removes the constant friction blind engineers face in mainstream IDEs by delivering
          optimized screen reader integration, audio code navigation cues, and tactile feedback workflows.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={stripePaymentLink}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Buy Access - $15/month
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </a>
          <Link
            href="/download"
            className="inline-flex items-center justify-center rounded-lg border border-slate-500/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-300"
          >
            Open Download & Unlock Portal
          </Link>
        </div>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Core outcomes">
        <article className="surface rounded-xl p-5">
          <h2 className="text-sm font-medium text-cyan-100">Faster code scanning</h2>
          <p className="mt-2 text-sm text-slate-300">
            Navigate classes, functions, and TODO regions by semantic landmark, not raw line-by-line reading.
          </p>
        </article>
        <article className="surface rounded-xl p-5">
          <h2 className="text-sm font-medium text-cyan-100">Consistent IDE behavior</h2>
          <p className="mt-2 text-sm text-slate-300">
            Ship proven keyboard profiles that normalize shortcuts and announcements across editors.
          </p>
        </article>
        <article className="surface rounded-xl p-5">
          <h2 className="text-sm font-medium text-cyan-100">Lower cognitive load</h2>
          <p className="mt-2 text-sm text-slate-300">
            Audio and tactile cues communicate context changes instantly, reducing mental overhead during debugging.
          </p>
        </article>
      </section>

      <section className="mt-14" aria-labelledby="problem-heading">
        <h2 id="problem-heading" className="text-2xl font-semibold text-white">
          The problem in mainstream IDEs
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="surface rounded-xl p-6">
            <p className="text-base text-slate-200">
              Blind developers are expected to compete in environments where plugin ecosystems, code navigation, and
              debugger views were designed visually first. Even when screen readers technically work, output is noisy,
              focus order is inconsistent, and critical context is hidden in non-semantic UI patterns.
            </p>
          </article>
          <article className="surface rounded-xl p-6">
            <p className="text-base text-slate-200">
              That friction pushes strong engineers toward inferior tooling or out of software roles entirely. Teams lose
              proven contributors, and the industry loses talent at a time when experienced developers are in short
              supply.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="solution-heading">
        <h2 id="solution-heading" className="text-2xl font-semibold text-white">
          Purpose-built solution
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="surface rounded-xl p-6">
            <Ear className="h-6 w-6 text-cyan-200" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold text-white">Screen-reader-first extensions</h3>
            <p className="mt-2 text-sm text-slate-300">
              Preconfigured extension bundles add predictable announcements for diagnostics, file changes, and symbol
              jumps.
            </p>
          </article>
          <article className="surface rounded-xl p-6">
            <AudioLines className="h-6 w-6 text-cyan-200" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold text-white">Audio code navigation</h3>
            <p className="mt-2 text-sm text-slate-300">
              Earcons and spoken summaries map structure changes in real time so you can traverse large files quickly.
            </p>
          </article>
          <article className="surface rounded-xl p-6">
            <Hand className="h-6 w-6 text-cyan-200" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold text-white">Tactile feedback profiles</h3>
            <p className="mt-2 text-sm text-slate-300">
              Optional haptic patterns reinforce navigation milestones, errors, and breakpoints on supported devices.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-2xl font-semibold text-white">
          Pricing
        </h2>
        <article className="surface mt-5 rounded-xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100">
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden />
                Professional accessibility toolkit
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-white">$15/month</h3>
              <p className="mt-2 max-w-2xl text-slate-300">
                Includes downloadable IDE packs, the interactive accessibility dashboard, monthly update drops, and
                priority support for working developers and accessibility consultants.
              </p>
            </div>
            <a
              href={stripePaymentLink}
              className="inline-flex items-center rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Buy Subscription
            </a>
          </div>
        </article>
      </section>

      <section className="mt-14 pb-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-semibold text-white">
          FAQ
        </h2>
        <div className="mt-5 space-y-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="surface rounded-xl p-6">
              <h3 className="text-base font-semibold text-white">{faq.question}</h3>
              <p className="mt-2 text-sm text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
