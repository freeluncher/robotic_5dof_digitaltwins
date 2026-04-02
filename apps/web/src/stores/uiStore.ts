import { create } from 'zustand';

type ControlMode = 'manual' | 'live';

type UiState = {
  controlMode: ControlMode;
  panelOpen: boolean;
  setControlMode: (mode: ControlMode) => void;
  togglePanel: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  controlMode: 'manual',
  panelOpen: true,
  setControlMode: (mode) => set({ controlMode: mode }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
}));
