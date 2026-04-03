export type ControlMode = 'manual' | 'live';

export function getControlModeLabel(mode: ControlMode): string {
  return mode === 'manual' ? 'Manual Control' : 'Live Data';
}

export function getControlModeDescription(mode: ControlMode): string {
  return mode === 'manual'
    ? 'Operator dapat menggerakkan joint secara langsung dengan slider.'
    : 'Slider dikunci dan model mengikuti data telemetry realtime.';
}

export function getControlModeTone(mode: ControlMode): 'manual' | 'live' {
  return mode;
}

export function isLiveMode(mode: ControlMode): boolean {
  return mode === 'live';
}
