"use client";

import { useMemo, useState } from "react";
import { Copy, Ear } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildLineAnnouncement,
  summarizeCodeForAudio,
  type PunctuationMode,
  type VerbosityMode
} from "@/lib/screen-reader-api";

const defaultSnippet = `export async function runAccessibilityAudit(files: string[]) {
  const failures = await Promise.all(files.map(scanFile));
  return failures.filter((issue) => issue.severity === "high");
}`;

export function ScreenReaderOptimizer() {
  const [source, setSource] = useState(defaultSnippet);
  const [verbosity, setVerbosity] = useState<VerbosityMode>("standard");
  const [punctuation, setPunctuation] = useState<PunctuationMode>("speak");
  const [copied, setCopied] = useState(false);

  const lines = useMemo(
    () => source.replace(/\r\n/g, "\n").split("\n"),
    [source]
  );

  const announcements = useMemo(
    () =>
      lines.map((line, index) =>
        buildLineAnnouncement(index + 1, line, verbosity, punctuation)
      ),
    [lines, punctuation, verbosity]
  );

  const summary = useMemo(
    () => summarizeCodeForAudio(source, verbosity),
    [source, verbosity]
  );

  const copyNarration = async () => {
    const text = announcements.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-100">
          <Ear className="h-5 w-5" aria-hidden />
          Screen Reader Optimizer
        </CardTitle>
        <CardDescription>
          Generate narration-ready code output tuned for screen-reader speed and clarity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Verbosity
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              value={verbosity}
              onChange={(event) => setVerbosity(event.target.value as VerbosityMode)}
            >
              <option value="concise">Concise</option>
              <option value="standard">Standard</option>
              <option value="verbose">Verbose</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Punctuation Mode
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              value={punctuation}
              onChange={(event) => setPunctuation(event.target.value as PunctuationMode)}
            >
              <option value="speak">Speak symbols</option>
              <option value="minimal">Minimal symbols</option>
            </select>
          </label>
        </div>

        <label className="block space-y-2 text-sm text-slate-300">
          Source Code
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="h-44 w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring"
          />
        </label>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <p className="text-sm font-semibold text-slate-200">Audio Summary</p>
          <p className="mt-1 text-sm text-cyan-100">{summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={copyNarration}>
            <Copy className="mr-1 h-4 w-4" aria-hidden />
            {copied ? "Copied" : "Copy Narration Script"}
          </Button>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-200">Narration Preview</p>
          <ul className="max-h-60 space-y-2 overflow-auto text-sm text-slate-300">
            {announcements.map((line) => (
              <li key={line} className="rounded bg-slate-900/70 px-2 py-1">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
