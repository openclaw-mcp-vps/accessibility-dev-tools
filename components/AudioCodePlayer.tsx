"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, PauseCircle, PlayCircle, SkipBack, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildSpokenLines,
  clampLine,
  estimateSpeechDurationMs,
  extractNavigationAnchors
} from "@/lib/audio-navigation";

const starterSnippet = `class SymbolNavigator {
  constructor(private readonly symbols: string[]) {}

  next(currentIndex: number): string {
    const nextIndex = (currentIndex + 1) % this.symbols.length;
    return this.symbols[nextIndex];
  }
}

export function announceBuildStatus(failed: boolean) {
  return failed ? "Build failed with 3 errors" : "Build passed";
}`;

function speak(text: string, rate: number, voiceName: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;

  if (voiceName) {
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.name === voiceName);
    if (voice) {
      utterance.voice = voice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

export function AudioCodePlayer() {
  const [code, setCode] = useState(starterSnippet);
  const [currentLine, setCurrentLine] = useState(1);
  const [rate, setRate] = useState(1.05);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const spokenLines = useMemo(() => buildSpokenLines(code), [code]);
  const anchors = useMemo(() => extractNavigationAnchors(code), [code]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (!selectedVoice && available.length > 0) {
        setSelectedVoice(available[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  useEffect(() => {
    const bounded = clampLine(currentLine, code);
    if (bounded !== currentLine) {
      setCurrentLine(bounded);
    }
  }, [code, currentLine]);

  const activeLine = spokenLines[currentLine - 1];

  const playCurrent = () => {
    if (!activeLine) {
      return;
    }
    const intro = `Line ${activeLine.lineNumber}. `;
    speak(`${intro}${activeLine.spoken}`, rate, selectedVoice);
  };

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const jump = (next: number) => {
    setCurrentLine(clampLine(next, code));
  };

  return (
    <Card className="border-cyan-500/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-100">
          <Headphones className="h-5 w-5" aria-hidden />
          Audio Code Player
        </CardTitle>
        <CardDescription>
          Listen to code by line with semantic landmarks for fast navigation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Code Snippet</span>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-52 w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring"
            aria-label="Editable code snippet for audio playback"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => jump(currentLine - 1)}>
            <SkipBack className="mr-1 h-4 w-4" aria-hidden />
            Previous
          </Button>
          <Button onClick={playCurrent}>
            <PlayCircle className="mr-1 h-4 w-4" aria-hidden />
            Speak Line {currentLine}
          </Button>
          <Button variant="secondary" onClick={stop}>
            <PauseCircle className="mr-1 h-4 w-4" aria-hidden />
            Stop
          </Button>
          <Button variant="secondary" onClick={() => jump(currentLine + 1)}>
            <SkipForward className="mr-1 h-4 w-4" aria-hidden />
            Next
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Speech Rate ({rate.toFixed(2)}x)
            <input
              type="range"
              min={0.75}
              max={1.8}
              step={0.05}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="w-full accent-cyan-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Voice
            <select
              value={selectedVoice}
              onChange={(event) => setSelectedVoice(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-200">Navigation Landmarks</p>
            <ul className="space-y-2 text-sm text-slate-300">
              {anchors.length === 0 ? (
                <li>No landmarks detected yet.</li>
              ) : (
                anchors.map((anchor) => (
                  <li key={`${anchor.kind}-${anchor.line}`}>
                    <button
                      type="button"
                      onClick={() => setCurrentLine(anchor.line)}
                      className="w-full rounded px-2 py-1 text-left hover:bg-slate-800"
                    >
                      Line {anchor.line}: {anchor.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-200">Current Spoken Line</p>
            <p className="text-sm text-cyan-100">
              {activeLine
                ? `Line ${activeLine.lineNumber}: ${activeLine.spoken}`
                : "No line selected."}
            </p>
            {activeLine ? (
              <p className="mt-2 text-xs text-slate-400">
                Estimated speech duration: {Math.ceil(estimateSpeechDurationMs(activeLine.spoken) / 1000)}
                s
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
