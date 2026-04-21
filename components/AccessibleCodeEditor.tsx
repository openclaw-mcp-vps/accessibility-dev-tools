"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Play, ScanSearch, Type } from "lucide-react";

import {
  getLineText,
  parseLineCommand,
  scanCodeForAccessibility,
  summarizeAccessibilityIssues
} from "@/lib/accessibility-utils";
import { playErrorCue, playSuccessCue, speakText } from "@/lib/audio-engine";
import { useAudioStore } from "@/stores/audio-store";
import { KeyboardNavigator } from "@/components/KeyboardNavigator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), {
  ssr: false
});

type EditorRef = {
  focus: () => void;
  getValue: () => string;
  setPosition: (position: { lineNumber: number; column: number }) => void;
  revealLineInCenter: (lineNumber: number) => void;
  getPosition: () => { lineNumber: number; column: number } | null;
};

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

const starterCode = `import React from "react";

export function ProfileCard() {
  return (
    <div onClick={() => console.log("clicked")}> 
      <img src="/avatar.png" />
      <input placeholder="Search" />
      <h3>Developer Profile</h3>
      <button style={{ outline: "none" }}>Open</button>
    </div>
  );
}`;

export function AccessibleCodeEditor() {
  const editorRef = useRef<EditorRef | null>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);
  const diagnosticsRef = useRef<HTMLElement | null>(null);

  const [code, setCode] = useState(starterCode);
  const [message, setMessage] = useState("Editor ready. Use Alt+2 to run a scan.");
  const [listening, setListening] = useState(false);

  const { enabled, rate, pitch, volume } = useAudioStore();

  const issues = useMemo(() => scanCodeForAccessibility(code), [code]);

  const announce = useCallback(
    async (text: string) => {
      setMessage(text);
      if (enabled) {
        await speakText(text, { rate, pitch, volume });
      }
    },
    [enabled, pitch, rate, volume]
  );

  const handleScan = useCallback(async () => {
    const summary = summarizeAccessibilityIssues(issues);
    await announce(summary);
    if (issues.length === 0) {
      await playSuccessCue();
    } else {
      await playErrorCue();
    }
  }, [announce, issues]);

  const handleReadCurrentLine = useCallback(async () => {
    const currentLine = editorRef.current?.getPosition()?.lineNumber ?? 1;
    const lineText = getLineText(code, currentLine);
    await announce(`Line ${currentLine}. ${lineText}`);
  }, [announce, code]);

  const handleGoToLine = useCallback(
    async (lineNumber: number) => {
      if (!editorRef.current) {
        await announce("Editor is still loading.");
        return;
      }

      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.revealLineInCenter(lineNumber);
      await announce(`Moved to line ${lineNumber}.`);
    },
    [announce]
  );

  const handleVoiceCommand = useCallback(
    async (transcript: string) => {
      const normalized = transcript.toLowerCase();

      if (normalized.includes("run check") || normalized.includes("run scan")) {
        await handleScan();
        return;
      }

      if (normalized.includes("read line")) {
        await handleReadCurrentLine();
        return;
      }

      if (normalized.includes("go to line")) {
        const line = parseLineCommand(normalized);
        if (line) {
          await handleGoToLine(line);
          return;
        }
      }

      if (normalized.includes("insert alt text")) {
        const nextCode = `${code}\n<img src=\"/example.png\" alt=\"Project screenshot\" />`;
        setCode(nextCode);
        await announce("Inserted an image with alt text at the end of the file.");
        return;
      }

      await announce(`Command not recognized: ${transcript}`);
    },
    [announce, code, handleGoToLine, handleReadCurrentLine, handleScan]
  );

  const toggleVoiceMode = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognitionCtor =
      (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      await announce("Speech recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognitionCtor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
        void handleVoiceCommand(transcript);
      };
      recognitionRef.current.onerror = () => {
        setListening(false);
      };
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      await announce("Voice command mode stopped.");
    } else {
      recognitionRef.current.start();
      setListening(true);
      await announce("Voice command mode started. Say run scan, read line, or go to line number.");
    }
  }, [announce, handleVoiceCommand, listening]);

  function mountEditor(editor: EditorRef) {
    editorRef.current = editor;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Screen Reader First</Badge>
            <Badge variant="secondary">Keyboard Native</Badge>
            <Badge variant="outline">Voice Commands</Badge>
          </div>
          <CardTitle className="text-xl">Accessible Code Editor</CardTitle>
          <CardDescription>
            Run focused accessibility diagnostics, jump by line, and receive spoken feedback while editing TypeScript.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <KeyboardNavigator
            onFocusEditor={() => {
              editorRef.current?.focus();
              void announce("Editor focused.");
            }}
            onRunScan={() => {
              void handleScan();
            }}
            onReadLine={() => {
              void handleReadCurrentLine();
            }}
            onStartVoice={() => {
              void toggleVoiceMode();
            }}
            onJumpDiagnostics={() => {
              diagnosticsRef.current?.focus();
              diagnosticsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />

          <div className="rounded-lg border border-[var(--border)] bg-[#0d1117] p-2">
            <MonacoEditor
              width="100%"
              height="420"
              language="typescript"
              theme="vs-dark"
              value={code}
              onChange={(value: string) => setCode(value)}
              editorDidMount={mountEditor}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                lineHeight: 24,
                fontFamily: "var(--font-plex-mono)",
                accessibilitySupport: "on",
                ariaLabel: "Code editor for blind developers",
                wordWrap: "on"
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleScan()}>
              <ScanSearch className="mr-2 h-4 w-4" aria-hidden="true" />
              Run Accessibility Scan
            </Button>
            <Button variant="secondary" onClick={() => void handleReadCurrentLine()}>
              <Type className="mr-2 h-4 w-4" aria-hidden="true" />
              Read Current Line
            </Button>
            <Button variant={listening ? "default" : "outline"} onClick={() => void toggleVoiceMode()}>
              {listening ? (
                <MicOff className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {listening ? "Stop Voice Commands" : "Start Voice Commands"}
            </Button>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3">
            <p className="text-sm font-medium">Live announcement</p>
            <p className="text-sm text-[var(--muted-foreground)]" aria-live="polite" aria-atomic="true">
              {message}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Play className="h-4 w-4" aria-hidden="true" />
            Diagnostics
          </CardTitle>
          <CardDescription>Actionable checks to catch common screen reader blockers before shipping.</CardDescription>
        </CardHeader>
        <CardContent>
          <section
            ref={diagnosticsRef}
            tabIndex={-1}
            aria-label="Accessibility diagnostics"
            className="space-y-3 focus:outline-none"
          >
            {issues.length === 0 ? (
              <p className="rounded-md border border-[#2ea043] bg-[color:rgba(46,160,67,0.12)] p-3 text-sm text-[#7ee787]">
                No obvious issues detected. Keep testing with real assistive tech.
              </p>
            ) : (
              issues.map((issue) => (
                <article key={issue.id} className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
                  <p className="text-sm font-semibold">
                    Line {issue.line} · {issue.severity.toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm">{issue.message}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Fix: {issue.recommendation}</p>
                </article>
              ))
            )}
          </section>

          <div className="mt-4 rounded-md border border-[var(--border)] bg-[color:rgba(88,166,255,0.12)] p-3 text-sm text-[#c9d1d9]">
            Voice command examples: "run scan", "read line", "go to line 12", "insert alt text".
          </div>

          <div className="mt-4">
            <label htmlFor="fallback-editor" className="mb-2 block text-sm font-medium">
              Plain text fallback editor
            </label>
            <Textarea
              id="fallback-editor"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="min-h-40 font-[var(--font-plex-mono)]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
