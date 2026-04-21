"use client";

import { useMemo, useState } from "react";
import { Hand, Vibrate } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EventKey = "build_success" | "build_failure" | "test_failure" | "deployment_complete";
type AlertMode = "vibration" | "audio" | "both";

interface PatternConfig {
  mode: AlertMode;
  pattern: number[];
  frequency: number;
}

const initialConfig: Record<EventKey, PatternConfig> = {
  build_success: { mode: "both", pattern: [100, 60, 100], frequency: 880 },
  build_failure: { mode: "both", pattern: [260, 90, 260, 90, 260], frequency: 260 },
  test_failure: { mode: "audio", pattern: [180, 80, 180], frequency: 340 },
  deployment_complete: { mode: "vibration", pattern: [100, 40, 100, 40, 260], frequency: 700 }
};

function playTone(frequency: number, durationMs: number) {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  const now = context.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000 + 0.02);

  window.setTimeout(() => {
    void context.close();
  }, durationMs + 80);
}

export function TactileFeedbackConfig() {
  const [config, setConfig] = useState(initialConfig);
  const [selectedEvent, setSelectedEvent] = useState<EventKey>("build_failure");

  const current = config[selectedEvent];

  const updatePattern = (raw: string) => {
    const pattern = raw
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value >= 0);

    if (!pattern.length) {
      return;
    }

    setConfig((previous) => ({
      ...previous,
      [selectedEvent]: {
        ...previous[selectedEvent],
        pattern
      }
    }));
  };

  const triggerTest = () => {
    if ((current.mode === "vibration" || current.mode === "both") && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(current.pattern);
    }

    if (current.mode === "audio" || current.mode === "both") {
      playTone(current.frequency, current.pattern.reduce((total, value) => total + value, 0));
    }
  };

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tactile-feedback-config.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const patternText = useMemo(() => current.pattern.join(", "), [current.pattern]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-100">
          <Hand className="h-5 w-5" aria-hidden />
          Tactile Feedback Config
        </CardTitle>
        <CardDescription>
          Configure vibration and audio signatures for coding events so status changes are felt instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-300 md:col-span-1">
            Event
            <select
              value={selectedEvent}
              onChange={(event) => setSelectedEvent(event.target.value as EventKey)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
            >
              <option value="build_success">Build Success</option>
              <option value="build_failure">Build Failure</option>
              <option value="test_failure">Test Failure</option>
              <option value="deployment_complete">Deployment Complete</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-300 md:col-span-1">
            Mode
            <select
              value={current.mode}
              onChange={(event) =>
                setConfig((previous) => ({
                  ...previous,
                  [selectedEvent]: {
                    ...previous[selectedEvent],
                    mode: event.target.value as AlertMode
                  }
                }))
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
            >
              <option value="vibration">Vibration only</option>
              <option value="audio">Audio only</option>
              <option value="both">Vibration + audio</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-300 md:col-span-1">
            Tone Frequency ({current.frequency}Hz)
            <input
              type="range"
              min={160}
              max={1200}
              step={10}
              value={current.frequency}
              onChange={(event) =>
                setConfig((previous) => ({
                  ...previous,
                  [selectedEvent]: {
                    ...previous[selectedEvent],
                    frequency: Number(event.target.value)
                  }
                }))
              }
              className="w-full accent-cyan-400"
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm text-slate-300">
          Pattern (milliseconds, comma-separated)
          <input
            type="text"
            value={patternText}
            onChange={(event) => updatePattern(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={triggerTest}>
            <Vibrate className="mr-1 h-4 w-4" aria-hidden />
            Test Feedback Pattern
          </Button>
          <Button variant="secondary" onClick={downloadConfig}>
            Download Profile JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
