import type { ControlMode } from '../stores/uiStore';

export type SystemState = 'loading' | 'ready' | 'fallback' | 'error';

type SystemStatusInput = {
  controlMode: ControlMode;
  isConnected: boolean;
  transport: string;
  telemetrySampleCount: number;
  lastReason?: string;
};

function isErrorReason(reason?: string): boolean {
  if (!reason) {
    return false;
  }

  return /error|failed|timeout|disconnect/i.test(reason);
}

export function deriveSystemState(input: SystemStatusInput): SystemState {
  if (isErrorReason(input.lastReason)) {
    return 'error';
  }

  if (input.telemetrySampleCount === 0 && input.lastReason === 'not-connected-yet') {
    return 'loading';
  }

  if (!input.isConnected && (input.controlMode === 'live' || input.transport === 'simulator')) {
    return 'fallback';
  }

  return 'ready';
}

export function getSystemStateLabel(state: SystemState): string {
  switch (state) {
    case 'loading':
      return 'Loading';
    case 'ready':
      return 'Ready';
    case 'fallback':
      return 'Fallback';
    case 'error':
      return 'Error';
  }
}

export function getSystemStateDescription(state: SystemState, input: SystemStatusInput): string {
  switch (state) {
    case 'loading':
      return 'Menunggu inisialisasi data dan koneksi awal.';
    case 'fallback':
      return input.controlMode === 'live'
        ? 'Live data belum tersedia, sistem memakai fallback view.'
        : 'Simulator aktif sebagai sumber data sementara.';
    case 'error':
      return input.lastReason ?? 'Terjadi error pada status sistem.';
    case 'ready':
    default:
      return input.isConnected
        ? 'Sistem siap dan mengikuti telemetry realtime.'
        : 'Sistem siap dalam mode lokal.';
  }
}
