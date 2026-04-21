"use client";

import FocusTrap from "focus-trap-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import AudioPlayer, { type AudioCue } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extractCodeLandmarks, summarizeCodeForScreenReader, triggerTactileFeedback } from "@/lib/accessibility";

const starterCode = `export class EditorAnnouncer {
  private queue: string[] = [];

  announce(message: string) {
    this.queue.push(message);
    console.log(message);
  }
}

export async function jumpToNextError() {
  // TODO: Skip diagnostics in generated files
  return "Moved to next compiler error";
}

// region Symbol Search
export const buildSymbolSummary = (symbolName: string) => {
  return 'Symbol ' + symbolName + ' includes tests and type definitions.';
};
`;

export default function ScreenReaderOptimized() {
  const [code, setCode] = useState(starterCode);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [useSpeech, setUseSpeech] = useState(true);
  const [focusLocked, setFocusLocked] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("Code navigation ready.");
  const [cue, setCue] = useState<AudioCue>(null);

  const landmarks = useMemo(() => extractCodeLandmarks(code), [code]);
  const summary = useMemo(() => summarizeCodeForScreenReader(code, landmarks), [code, landmarks]);
  const active = landmarks[selectedIndex];

  useEffect(() => {
    if (selectedIndex < landmarks.length) {
      return;
    }

    setSelectedIndex(0);
  }, [landmarks.length, selectedIndex]);

  const announce = useCallback(
    (message: string) => {
      setLiveAnnouncement(message);

      if (!useSpeech || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    [useSpeech],
  );

  const move = useCallback(
    (direction: "next" | "previous") => {
      if (landmarks.length === 0) {
        return;
      }

      const delta = direction === "next" ? 1 : -1;
      const nextIndex = (selectedIndex + delta + landmarks.length) % landmarks.length;
      const nextLandmark = landmarks[nextIndex];

      setSelectedIndex(nextIndex);
      setCue(direction === "next" ? "next" : "previous");
      triggerTactileFeedback([10, 40, 10]);
      announce(`${nextLandmark.label}. Line ${nextLandmark.line}.`);
    },
    [announce, landmarks, selectedIndex],
  );

  const readCurrentSelection = useCallback(() => {
    if (!active) {
      return;
    }

    setCue("success");
    triggerTactileFeedback([20, 30, 20]);
    announce(`Selected ${active.label}. Source: ${active.snippet || "No snippet available."}`);
  }, [active, announce]);

  const handleKeyNavigation = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        move("next");
      }

      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        move("previous");
      }

      if (event.key === "Enter") {
        event.preventDefault();
        readCurrentSelection();
      }
    },
    [move, readCurrentSelection],
  );

  return (
    <section aria-labelledby="screen-reader-workbench" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle id="screen-reader-workbench">Screen Reader Optimized Workbench</CardTitle>
          <CardDescription>
            Paste source code and navigate by landmarks using `j` and `k`. Press Enter to hear the selected symbol.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm font-medium text-slate-200" htmlFor="source-code-input">
            Source code
          </label>
          <textarea
            id="source-code-input"
            className="min-h-56 w-full rounded-lg border border-slate-600 bg-[#0b0f14] p-3 font-mono text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={useSpeech ? "default" : "secondary"} onClick={() => setUseSpeech((prev) => !prev)}>
              {useSpeech ? "Speech Announcements: On" : "Speech Announcements: Off"}
            </Button>
            <Button
              type="button"
              variant={focusLocked ? "default" : "secondary"}
              onClick={() => setFocusLocked((prev) => !prev)}
            >
              {focusLocked ? "Navigation Focus: Locked" : "Navigation Focus: Unlocked"}
            </Button>
            <Button type="button" variant="secondary" onClick={readCurrentSelection}>
              Read Selected Landmark
            </Button>
          </div>

          <p className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 p-3 text-sm text-cyan-100" aria-live="polite">
            {summary}
          </p>

          <FocusTrap active={focusLocked}>
            <div
              className="rounded-lg border border-slate-600 bg-[#0b0f14] p-3"
              onKeyDown={handleKeyNavigation}
              tabIndex={0}
              aria-label="Landmark navigation region"
            >
              <p className="text-sm text-slate-300">Landmarks ({landmarks.length})</p>
              <ul className="mt-2 space-y-2">
                {landmarks.map((landmark, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <motion.li
                      key={landmark.id}
                      initial={{ opacity: 0.6, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        type="button"
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "border-cyan-300 bg-cyan-500/15 text-cyan-100"
                            : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500"
                        }`}
                        onClick={() => {
                          setSelectedIndex(index);
                          announce(`${landmark.label}. Line ${landmark.line}.`);
                        }}
                        aria-current={isActive}
                      >
                        <span className="block font-medium">{landmark.label}</span>
                        <span className="block text-xs text-slate-400">Line {landmark.line}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </FocusTrap>

          <p className="sr-only" aria-live="polite">
            {liveAnnouncement}
          </p>
        </CardContent>
      </Card>
      <AudioPlayer cue={cue} />
    </section>
  );
}
