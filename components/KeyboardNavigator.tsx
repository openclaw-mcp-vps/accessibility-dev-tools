"use client";

import { useEffect } from "react";

import { keyboardShortcuts } from "@/lib/accessibility-utils";
import { playNavigationCue } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

type KeyboardNavigatorProps = {
  className?: string;
  onFocusEditor?: () => void;
  onRunScan?: () => void;
  onReadLine?: () => void;
  onStartVoice?: () => void;
  onJumpDiagnostics?: () => void;
};

export function KeyboardNavigator({
  className,
  onFocusEditor,
  onRunScan,
  onReadLine,
  onStartVoice,
  onJumpDiagnostics
}: KeyboardNavigatorProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey) {
        return;
      }

      const key = event.key;
      if (!["1", "2", "3", "4", "5"].includes(key)) {
        return;
      }

      event.preventDefault();
      void playNavigationCue();

      if (key === "1") {
        onFocusEditor?.();
      }

      if (key === "2") {
        onRunScan?.();
      }

      if (key === "3") {
        onReadLine?.();
      }

      if (key === "4") {
        onStartVoice?.();
      }

      if (key === "5") {
        onJumpDiagnostics?.();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFocusEditor, onJumpDiagnostics, onReadLine, onRunScan, onStartVoice]);

  return (
    <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4", className)}>
      <h2 className="mb-3 text-base font-semibold">Keyboard Navigator</h2>
      <ul className="grid gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
        {keyboardShortcuts.map((shortcut) => (
          <li key={shortcut.keys} className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2">
            <span>{shortcut.action}</span>
            <kbd className="rounded bg-[#0d1117] px-2 py-1 font-[var(--font-plex-mono)] text-xs text-[#7ee787]">
              {shortcut.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
