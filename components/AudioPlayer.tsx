"use client";

import { Howl } from "howler";
import { Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type AudioCue = "next" | "previous" | "success" | null;

interface AudioPlayerProps {
  cue?: AudioCue;
}

export default function AudioPlayer({ cue = null }: AudioPlayerProps) {
  const [enabled, setEnabled] = useState(true);

  const cues = useMemo(
    () => ({
      next: new Howl({ src: ["/audio/nav-up.wav"], volume: 0.35 }),
      previous: new Howl({ src: ["/audio/nav-down.wav"], volume: 0.35 }),
      success: new Howl({ src: ["/audio/confirm.wav"], volume: 0.4 }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(cues).forEach((sound) => sound.unload());
    };
  }, [cues]);

  useEffect(() => {
    if (!enabled || !cue) {
      return;
    }

    cues[cue].play();
  }, [cue, cues, enabled]);

  return (
    <Card aria-label="Audio cue controls">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-cyan-200" aria-hidden />
          Audio Navigation Cues
        </CardTitle>
        <CardDescription>
          Hear directional earcons when moving between code landmarks. This is useful when your screen reader verbosity is
          intentionally low.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => cues.previous.play()}>
            Preview Previous Cue
          </Button>
          <Button type="button" variant="secondary" onClick={() => cues.next.play()}>
            Preview Next Cue
          </Button>
          <Button type="button" variant="secondary" onClick={() => cues.success.play()}>
            Preview Confirmation Cue
          </Button>
        </div>
        <Button type="button" variant={enabled ? "default" : "secondary"} onClick={() => setEnabled((state) => !state)}>
          {enabled ? "Disable Automatic Cues" : "Enable Automatic Cues"}
        </Button>
      </CardContent>
    </Card>
  );
}
