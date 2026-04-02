import { create } from 'zustand';

type Transport = 'serial' | 'wifi' | 'simulator';

type ConnectivityState = {
  isConnected: boolean;
  transport: Transport;
  lastReason?: string;
  setConnected: (isConnected: boolean, reason?: string) => void;
  setTransport: (transport: Transport) => void;
};

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  isConnected: false,
  transport: 'simulator',
  lastReason: 'not-connected-yet',
  setConnected: (isConnected, reason) => set({ isConnected, lastReason: reason }),
  setTransport: (transport) => set({ transport }),
}));
