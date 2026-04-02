export type TelemetryState = 'offline' | 'waiting' | 'live' | 'stale';

const TELEMETRY_STALE_AFTER_MS = 1500;

export function getTelemetryState(isConnected: boolean, telemetryAgeMs: number | null): TelemetryState {
  if (!isConnected) {
    return 'offline';
  }

  if (telemetryAgeMs === null) {
    return 'waiting';
  }

  if (telemetryAgeMs > TELEMETRY_STALE_AFTER_MS) {
    return 'stale';
  }

  return 'live';
}

export function formatTelemetryAge(telemetryAgeMs: number | null): string {
  if (telemetryAgeMs === null) {
    return '-';
  }

  if (telemetryAgeMs < 1000) {
    return `${Math.max(0, Math.round(telemetryAgeMs))} ms`;
  }

  return `${(telemetryAgeMs / 1000).toFixed(2)} s`;
}

export function toTelemetryJointRows(hardware: Record<string, number>, gripper: number) {
  return [
    { label: 'Waist (J1)', value: hardware.waist },
    { label: 'Shoulder (J2)', value: hardware.shoulder },
    { label: 'Elbow (J3)', value: hardware.elbow },
    { label: 'Wrist Roll (J4)', value: hardware.wristRoll },
    { label: 'Wrist Pitch (J5)', value: hardware.wrist },
    { label: 'Gripper', value: gripper },
  ];
}
