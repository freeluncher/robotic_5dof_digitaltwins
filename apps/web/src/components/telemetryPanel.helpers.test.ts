import { describe, expect, it } from 'vitest';

import { formatTelemetryAge, getTelemetryState, toTelemetryJointRows } from './telemetryPanel.helpers';

describe('telemetry panel helpers', () => {
  it('returns offline state when hardware connection is down', () => {
    expect(getTelemetryState(false, 100)).toBe('offline');
  });

  it('returns waiting state when connected but no packet has arrived yet', () => {
    expect(getTelemetryState(true, null)).toBe('waiting');
  });

  it('returns live state for fresh telemetry packets', () => {
    expect(getTelemetryState(true, 320)).toBe('live');
  });

  it('returns stale state when telemetry is older than freshness threshold', () => {
    expect(getTelemetryState(true, 2001)).toBe('stale');
  });

  it('formats telemetry age in milliseconds for sub-second values', () => {
    expect(formatTelemetryAge(237)).toBe('237 ms');
  });

  it('formats telemetry age in seconds for larger values', () => {
    expect(formatTelemetryAge(2500)).toBe('2.50 s');
  });

  it('maps all joint labels including gripper row', () => {
    const rows = toTelemetryJointRows(
      {
        waist: 90,
        shoulder: 100,
        elbow: 110,
        wristRoll: 120,
        wrist: 130,
      },
      140,
    );

    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({ label: 'Waist (J1)', value: 90 });
    expect(rows[5]).toEqual({ label: 'Gripper', value: 140 });
  });
});
