import Link from "next/link";
import { ArrowRight, Ear, Laptop2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

const faqItems = [
  {
    question: "Does this replace my current IDE?",
    answer:
      "No. You keep VS Code, IntelliJ, or your existing editor. Accessibility Dev Tools adds overlays, audio navigation commands, and tactile mappings on top of the tools your team already uses.",
  },
  {
    question: "How quickly can I get productive?",
    answer:
      "Most users finish setup in under 15 minutes. The dashboard includes a default profile tuned for screen readers, then you can adjust keymaps and voice summaries to match your workflow.",
  },
  {
    question: "Is this suitable for students and consultants?",
    answer:
      "Yes. The same toolkit is used by enterprise engineers, freelance accessibility consultants, and computer science students who need parity with visual-first coding workflows.",
  },
  {
    question: "How is payment handled?",
    answer:
      "Checkout runs on Stripe hosted checkout. After purchase, your subscription email unlocks the downloads and configuration dashboard.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-20 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs tracking-wide text-blue-200">
            Accessibility tools for professional developers
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Development tools for blind programmers
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
            Accessibility Dev Tools removes the friction blind engineers face in mainstream IDEs with enhanced
            screen reader integration, audio code navigation, and tactile feedback profiles that work with modern
            software teams.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={paymentLink} className="inline-flex">
              <Button size="lg" className="gap-2">
                Start for $15/month
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </a>
            <Link href="/dashboard" className="inline-flex">
              <Button variant="outline" size="lg">
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-blue-500/20 bg-[#101827]/90">
          <CardHeader>
            <CardTitle className="text-slate-100">Who pays and why</CardTitle>
            <CardDescription>Built for teams that value output, not eyesight.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <p>
              Blind software engineers in tech companies use this to move at the same speed as visual-first peers.
            </p>
            <p>Accessibility consultants depend on it to audit, implement, and ship client code faster.</p>
            <p>
              Students with visual impairments use it to learn professional workflows they can carry into industry.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="problem" className="space-y-5">
        <h2 className="text-3xl font-semibold text-white">The problem is not talent, it is tooling friction</h2>
        <p className="max-w-4xl text-base leading-relaxed text-slate-300">
          Most editors are designed for sighted workflows. Blind developers lose time on unreliable focus handling,
          poor screen reader context, and hidden code structure. That friction compounds into slower delivery and
          reduced hiring confidence, despite a global shortage of experienced software engineers.
        </p>
      </section>

      <section id="solution" className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">A practical solution built for day-to-day coding</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                <Ear className="h-4 w-4 text-blue-300" aria-hidden="true" />
                Screen Reader Precision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-300">
              Enhanced context announcements expose symbol scopes, diagnostics, and file landmarks without forcing
              repeated cursor hunting.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                <Laptop2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Audio Code Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-300">
              Jump quickly between imports, classes, and functions with concise spoken summaries tuned for longer
              sessions.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                <Sparkles className="h-4 w-4 text-violet-300" aria-hidden="true" />
                Tactile Feedback Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-300">
              Optional cue patterns map code landmarks to braille display refresh states or vibration hardware
              events.
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="pricing" className="space-y-5">
        <h2 className="text-3xl font-semibold text-white">Simple pricing for professional use</h2>
        <Card className="max-w-xl border-emerald-500/30 bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-slate-100">Accessibility Dev Tools Pro</CardTitle>
            <CardDescription>
              $15 per month. Includes extension downloads, dashboard access, and ongoing updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-slate-200">
              <li>Unlimited access to IDE extension packages</li>
              <li>Audio navigation and tactile profile configuration dashboard</li>
              <li>Subscriber release notes for accessibility improvements</li>
            </ul>
            <a href={paymentLink} className="inline-flex">
              <Button size="lg">Buy with Stripe Hosted Checkout</Button>
            </a>
          </CardContent>
        </Card>
      </section>

      <section id="faq" className="space-y-5">
        <h2 className="text-3xl font-semibold text-white">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle className="text-base text-slate-100">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-300">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
