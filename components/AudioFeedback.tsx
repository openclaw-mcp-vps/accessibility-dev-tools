"use client";

import { Volume2, VolumeX } from "lucide-react";

import { playErrorCue, playSuccessCue, speakText, stopSpeaking } from "@/lib/audio-engine";
import { useAudioStore } from "@/stores/audio-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AudioFeedback() {
  const { enabled, rate, pitch, volume, setEnabled, setRate, setPitch, setVolume } = useAudioStore();

  async function previewSpeech() {
    if (!enabled) {
      return;
    }

    await speakText("Accessibility check complete. Two high severity issues were detected.", {
      rate,
      pitch,
      volume
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          Audio Feedback Engine
        </CardTitle>
        <CardDescription>
          Tune spoken feedback and alert tones so your editor communicates state changes without visual context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={enabled ? "secondary" : "default"} onClick={() => setEnabled(!enabled)}>
            {enabled ? "Mute Spoken Feedback" : "Enable Spoken Feedback"}
          </Button>
          <Button variant="outline" onClick={() => void previewSpeech()} disabled={!enabled}>
            Preview Speech
          </Button>
          <Button variant="outline" onClick={() => void playSuccessCue()} disabled={!enabled}>
            Success Cue
          </Button>
          <Button variant="outline" onClick={() => void playErrorCue()} disabled={!enabled}>
            Error Cue
          </Button>
          <Button variant="ghost" onClick={() => void stopSpeaking()}>
            Stop Voice
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm">
            Speech Rate
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="accent-[#58a6ff]"
            />
            <span className="font-[var(--font-plex-mono)] text-xs text-[var(--muted-foreground)]">{rate.toFixed(1)}x</span>
          </label>

          <label className="grid gap-2 text-sm">
            Voice Pitch
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(event) => setPitch(Number(event.target.value))}
              className="accent-[#58a6ff]"
            />
            <span className="font-[var(--font-plex-mono)] text-xs text-[var(--muted-foreground)]">{pitch.toFixed(1)}</span>
          </label>

          <label className="grid gap-2 text-sm">
            Volume
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="accent-[#58a6ff]"
            />
            <span className="font-[var(--font-plex-mono)] text-xs text-[var(--muted-foreground)]">
              {(volume * 100).toFixed(0)}%
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
