import { create } from "zustand";

type AudioState = {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  enabled: true,
  rate: 1,
  pitch: 1,
  volume: 1,
  setEnabled: (enabled) => set({ enabled }),
  setRate: (rate) => set({ rate }),
  setPitch: (pitch) => set({ pitch }),
  setVolume: (volume) => set({ volume })
}));
