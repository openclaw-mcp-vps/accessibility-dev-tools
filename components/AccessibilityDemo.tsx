"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ear, Hand, Route } from "lucide-react";

import type { NavigationCue } from "@/types/accessibility";

const cuePresets: NavigationCue[] = [
  {
    gesture: "Ctrl + Alt + J",
    spokenFeedback: "Jumped to function buildAudioMap, line 128, two references.",
    tactileFeedback: "Single short pulse",
    useCase: "Move directly to the next top-level symbol"
  },
  {
    gesture: "Ctrl + Alt + E",
    spokenFeedback: "Next error in checkout.ts, line 42, null pointer guard missing.",
    tactileFeedback: "Double long pulse",
    useCase: "Traverse compiler and linter issues"
  },
  {
    gesture: "Ctrl + Alt + B",
    spokenFeedback: "Declaration opened for SubscriptionRecord interface.",
    tactileFeedback: "Single medium pulse",
    useCase: "Follow references and API definitions"
  }
];

export function AccessibilityDemo(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCue = useMemo(() => cuePresets[activeIndex], [activeIndex]);

  return (
    <section className="section-shell p-6 lg:p-8">
      <div className="mb-5 flex items-center gap-2 text-sm font-medium text-[var(--text-soft)]">
        <Route size={16} />
        <span>Audio + Tactile Navigation Demo</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {cuePresets.map((cue, index) => (
          <button
            key={cue.gesture}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-pressed={activeIndex === index}
            className={`rounded-xl border p-4 text-left transition ${
              activeIndex === index
                ? "border-[var(--accent)] bg-[rgba(86,212,165,0.1)]"
                : "border-[var(--line)] bg-[rgba(13,17,23,0.55)] hover:border-[var(--line-strong)]"
            }`}
          >
            <p className="mono text-sm text-[var(--accent-2)]">{cue.gesture}</p>
            <p className="mt-2 text-sm text-[var(--text-soft)]">{cue.useCase}</p>
          </button>
        ))}
      </div>

      <motion.div
        key={activeCue.gesture}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-5 grid gap-3 rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.6)] p-4 md:grid-cols-2"
      >
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-soft)]">
            <Ear size={16} /> Spoken Output
          </p>
          <p className="text-sm leading-relaxed">{activeCue.spokenFeedback}</p>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-soft)]">
            <Hand size={16} /> Tactile Pattern
          </p>
          <p className="text-sm leading-relaxed">{activeCue.tactileFeedback}</p>
        </div>
      </motion.div>
    </section>
  );
}
