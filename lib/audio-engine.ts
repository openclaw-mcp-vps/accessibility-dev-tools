export type SpeechSettings = {
  rate: number;
  pitch: number;
  volume: number;
};

const defaultSettings: SpeechSettings = {
  rate: 1,
  pitch: 1,
  volume: 1
};

export async function speakText(text: string, settings: Partial<SpeechSettings> = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const merged = { ...defaultSettings, ...settings };
  utterance.rate = merged.rate;
  utterance.pitch = merged.pitch;
  utterance.volume = merged.volume;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export async function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
}

async function playToneNote(note: string, duration = "8n") {
  if (typeof window === "undefined") {
    return;
  }

  const Tone = await import("tone");
  await Tone.start();

  const synth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.1,
      release: 0.3
    }
  }).toDestination();

  synth.triggerAttackRelease(note, duration);
  setTimeout(() => synth.dispose(), 350);
}

export async function playSuccessCue() {
  await playToneNote("C5", "16n");
  setTimeout(() => {
    void playToneNote("E5", "16n");
  }, 80);
}

export async function playErrorCue() {
  await playToneNote("D3", "8n");
}

export async function playNavigationCue() {
  await playToneNote("G4", "32n");
}
