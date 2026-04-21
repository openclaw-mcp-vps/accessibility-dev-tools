"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

const seedCode = `async function loadWorkspace(userId: string) {
  const workspace = await getWorkspace(userId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return workspace.projects.filter((project) => project.enabled);
}`;

function expandSymbols(line: string): string {
  return line
    .replace(/=>/g, " arrow ")
    .replace(/===/g, " strictly equals ")
    .replace(/!==/g, " not strictly equals ")
    .replace(/&&/g, " and ")
    .replace(/\|\|/g, " or ")
    .replace(/[{}]/g, " brace ")
    .replace(/[()]/g, " parenthesis ");
}

export function AudioCodePlayer(): React.JSX.Element {
  const [code, setCode] = useState(seedCode);
  const [playbackRate, setPlaybackRate] = useState(1.05);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const lines = useMemo(() => code.split("\n"), [code]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakFrom = (lineIndex: number): void => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.speechSynthesis) {
      return;
    }

    if (lineIndex >= lines.length) {
      setIsPlaying(false);
      setCurrentLine(null);
      return;
    }

    const spokenLine = expandSymbols(lines[lineIndex].trim() || "blank line");
    const utterance = new SpeechSynthesisUtterance(`Line ${lineIndex + 1}. ${spokenLine}`);
    utterance.rate = playbackRate;
    utterance.pitch = 1;
    utterance.onend = () => speakFrom(lineIndex + 1);
    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentLine(null);
    };

    setCurrentLine(lineIndex + 1);
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = (): void => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.speechSynthesis) {
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentLine(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    speakFrom(0);
  };

  return (
    <section className="section-shell p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">Audio Code Player</h3>
        <button
          type="button"
          onClick={handlePlayPause}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--bg-emphasis)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? "Stop Playback" : "Play Code"}
        </button>
      </div>

      <p className="mt-3 text-sm text-[var(--text-soft)]">
        Reads code line-by-line with symbol expansion so punctuation-heavy lines are understandable in one pass.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.65)] p-4">
        <label htmlFor="audio-code" className="mb-2 block text-sm font-medium">
          Code Snippet
        </label>
        <textarea
          id="audio-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mono h-56 w-full resize-y rounded-md border border-[var(--line)] bg-[#0b1320] p-3 text-sm leading-relaxed outline-none focus:border-[var(--accent)]"
          spellCheck={false}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.6)] p-4">
          <p className="mb-2 text-sm font-medium text-[var(--text-soft)]">Live Playback Status</p>
          <p className="text-sm">
            {currentLine
              ? `Currently speaking line ${currentLine}.`
              : "Idle. Start playback to hear line-by-line narration."}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[rgba(13,17,23,0.6)] p-4">
          <label htmlFor="playback-rate" className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Volume2 size={16} /> Speech Rate
          </label>
          <input
            id="playback-rate"
            type="range"
            min="0.8"
            max="1.6"
            step="0.05"
            value={playbackRate}
            onChange={(event) => setPlaybackRate(Number(event.target.value))}
            className="w-full"
          />
          <p className="mt-2 text-sm text-[var(--text-soft)]">{playbackRate.toFixed(2)}x</p>
        </div>
      </div>
    </section>
  );
}
