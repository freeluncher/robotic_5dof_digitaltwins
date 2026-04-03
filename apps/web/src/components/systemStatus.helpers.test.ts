import { describe, expect, it } from 'vitest';

import { deriveSystemState, getSystemStateDescription, getSystemStateLabel } from './systemStatus.helpers';

describe('system status helpers', () => {
  it('returns loading during initial startup', () => {
    expect(
      deriveSystemState({
        controlMode: 'manual',
        isConnected: false,
        transport: 'simulator',
        telemetrySampleCount: 0,
        lastReason: 'not-connected-yet',
      }),
    ).toBe('loading');
  });

  it('returns fallback when live mode has no active connection', () => {
    expect(
      deriveSystemState({
        controlMode: 'live',
        isConnected: false,
        transport: 'wifi',
        telemetrySampleCount: 4,
        lastReason: 'waiting-for-telemetry',
      }),
    ).toBe('fallback');
  });

  it('returns error when reason contains failure keywords', () => {
    expect(
      deriveSystemState({
        controlMode: 'manual',
        isConnected: false,
        transport: 'serial',
        telemetrySampleCount: 1,
        lastReason: 'hardware-error-timeout',
      }),
    ).toBe('error');
  });

  it('returns ready when system is connected', () => {
    expect(
      deriveSystemState({
        controlMode: 'manual',
        isConnected: true,
        transport: 'signalr',
        telemetrySampleCount: 3,
        lastReason: 'connected',
      }),
    ).toBe('ready');
  });

  it('maps label and description for loading state', () => {
    const input = {
      controlMode: 'manual' as const,
      isConnected: false,
      transport: 'simulator',
      telemetrySampleCount: 0,
      lastReason: 'not-connected-yet',
    };

    expect(getSystemStateLabel('loading')).toBe('Loading');
    expect(getSystemStateDescription('loading', input)).toContain('Menunggu');
  });
});
