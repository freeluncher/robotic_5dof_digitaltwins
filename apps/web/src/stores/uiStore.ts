import { create } from 'zustand';

type ControlMode = 'manual' | 'live';
type SystemState = 'loading' | 'ready' | 'fallback' | 'error';

type UiState = {
  controlMode: ControlMode;
  panelOpen: boolean;
  systemState: SystemState;
  systemMessage: string;
  setControlMode: (mode: ControlMode) => void;
  togglePanel: () => void;
  setSystemLoading: (message?: string) => void;
  setSystemReady: (message?: string) => void;
  setSystemFallback: (message?: string) => void;
  setSystemError: (message: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  controlMode: 'manual',
  panelOpen: true,
  systemState: 'loading',
  systemMessage: 'Initializing digital twin...',
  setControlMode: (mode) => set({ controlMode: mode }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  setSystemLoading: (message = 'Loading digital twin...') =>
    set({ systemState: 'loading', systemMessage: message }),
  setSystemReady: (message = 'Digital twin ready.') =>
    set({ systemState: 'ready', systemMessage: message }),
  setSystemFallback: (message = 'Fallback mode active.') =>
    set({ systemState: 'fallback', systemMessage: message }),
  setSystemError: (message) => set({ systemState: 'error', systemMessage: message }),
}));
