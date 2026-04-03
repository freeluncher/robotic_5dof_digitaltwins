export type ControlMode = 'manual' | 'live';

export function getControlModeLabel(mode: ControlMode): string {
  return mode === 'manual' ? 'Manual Control' : 'Live Data';
}

export function getControlModeDescription(mode: ControlMode): string {
  return mode === 'manual'
    ? 'Operator can move the joints directly with the slider.'
    : 'The slider is locked and the model follows realtime telemetry data.';
}

export function getControlModeTone(mode: ControlMode): 'manual' | 'live' {
  return mode;
}

export function isLiveMode(mode: ControlMode): boolean {
  return mode === 'live';
}
