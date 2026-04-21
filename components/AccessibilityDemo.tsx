"use client";

import { useMemo, useState } from "react";
import FocusTrap from "focus-trap-react";
import { Headphones, Keyboard, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildAudioSummary,
  defaultDemoSnippet,
  extractCodeLandmarks,
  tactileCueForType,
} from "@/lib/accessibility-utils";

export function AccessibilityDemo() {
  const [sourceCode, setSourceCode] = useState(defaultDemoSnippet());
  const [isShortcutDialogOpen, setIsShortcutDialogOpen] = useState(false);
  const [statusText, setStatusText] = useState("Analyze a file to generate screen-reader landmarks.");

  const landmarks = useMemo(() => extractCodeLandmarks(sourceCode), [sourceCode]);
  const summary = useMemo(
    () => buildAudioSummary(landmarks, sourceCode.split(/\r?\n/).length),
    [landmarks, sourceCode],
  );

  function speakSummary() {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      setStatusText("Speech synthesis is unavailable in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(summary));
    setStatusText("Audio summary sent to your screen reader and system speech channel.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Headphones className="h-5 w-5 text-blue-400" aria-hidden="true" />
            Audio Code Navigation Sandbox
          </CardTitle>
          <CardDescription>
            Paste a source file and instantly generate structural landmarks that are easy to navigate with a
            screen reader.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label htmlFor="source-code" className="text-sm font-medium text-slate-200">
            Source code input
          </label>
          <textarea
            id="source-code"
            value={sourceCode}
            onChange={(event) => setSourceCode(event.target.value)}
            className="input-dark min-h-64 w-full rounded-md p-3 text-sm leading-relaxed"
            aria-describedby="analysis-status"
          />

          <div className="flex flex-wrap gap-3">
            <Button onClick={speakSummary}>Speak Summary</Button>
            <Button variant="outline" onClick={() => setIsShortcutDialogOpen(true)}>
              <Keyboard className="mr-2 h-4 w-4" aria-hidden="true" />
              Keyboard Shortcuts
            </Button>
          </div>

          <p id="analysis-status" role="status" aria-live="polite" className="text-sm text-slate-300">
            {statusText}
          </p>
          <p className="rounded-md border border-blue-700/40 bg-blue-950/30 p-3 text-sm leading-relaxed text-blue-100">
            {summary}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Vibrate className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            Tactile Output Map
          </CardTitle>
          <CardDescription>
            Each landmark maps to a tactile cue pattern so refreshable displays or vibration hardware can mirror
            code structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" aria-label="Landmarks detected in code sample">
            {landmarks.map((landmark) => (
              <li
                key={`${landmark.type}-${landmark.line}-${landmark.label}`}
                className="rounded-md border border-slate-700 bg-slate-950/40 px-3 py-2"
              >
                <p className="text-sm font-semibold text-slate-100">
                  Line {landmark.line}: {landmark.label}
                </p>
                <p className="text-xs text-slate-300">Tactile cue: {tactileCueForType(landmark.type)}</p>
                <code className="mt-1 block text-xs text-slate-400">{landmark.context.trim()}</code>
              </li>
            ))}
            {landmarks.length === 0 && (
              <li className="rounded-md border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-300">
                No landmarks found. Add imports, classes, functions, TODOs, or explicit error handling.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {isShortcutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" role="dialog" aria-modal>
          <FocusTrap
            focusTrapOptions={{
              clickOutsideDeactivates: true,
              escapeDeactivates: true,
              onDeactivate: () => setIsShortcutDialogOpen(false),
            }}
          >
            <section className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#111827] p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white">Keyboard shortcut profile</h3>
              <p className="mt-2 text-sm text-slate-300">
                Use this profile in your editor extension to keep core actions one key combo away.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-100">
                <li>
                  <kbd className="rounded border border-slate-600 px-1 py-0.5">Alt</kbd> +
                  <kbd className="ml-1 rounded border border-slate-600 px-1 py-0.5">Shift</kbd> +
                  <kbd className="ml-1 rounded border border-slate-600 px-1 py-0.5">L</kbd>
                  : Read current line with context.
                </li>
                <li>
                  <kbd className="rounded border border-slate-600 px-1 py-0.5">Alt</kbd> +
                  <kbd className="ml-1 rounded border border-slate-600 px-1 py-0.5">Shift</kbd> +
                  <kbd className="ml-1 rounded border border-slate-600 px-1 py-0.5">F</kbd>
                  : Jump to next function landmark.
                </li>
                <li>
                  <kbd className="rounded border border-slate-600 px-1 py-0.5">Alt</kbd> +
                  <kbd className="ml-1 rounded border border-slate-600 px-1 py-0.5">Shift</kbd> +
                  <kbd className="ml-1 rounded border border-slate-600 px-1 py-0.5">D</kbd>
                  : Announce diagnostics with severity.
                </li>
              </ul>
              <div className="mt-5 flex justify-end">
                <Button variant="secondary" onClick={() => setIsShortcutDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </section>
          </FocusTrap>
        </div>
      )}
    </div>
  );
}
