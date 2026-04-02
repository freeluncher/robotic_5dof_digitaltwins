import { describe, expect, it } from 'vitest';

import {
  getConnectionStatus,
  getConnectionStatusLabel,
  statusDescription,
  type ConnectionStatusType,
} from './connectionStatusIndicator.helpers';

describe('connection status indicator helpers', () => {
  it('returns offline when not connected and not in simulator mode', () => {
    expect(getConnectionStatus(false, 'wifi')).toBe('offline');
    expect(getConnectionStatus(false, 'serial')).toBe('offline');
  });

  it('returns connecting when not connected but in simulator mode', () => {
    expect(getConnectionStatus(false, 'simulator')).toBe('connecting');
  });

  it('returns connected when isConnected is true', () => {
    expect(getConnectionStatus(true, 'wifi')).toBe('connected');
    expect(getConnectionStatus(true, 'serial')).toBe('connected');
    expect(getConnectionStatus(true, 'simulator')).toBe('connected');
  });

  it('maps status to human-readable label', () => {
    expect(getConnectionStatusLabel('connected')).toBe('Connected');
    expect(getConnectionStatusLabel('connecting')).toBe('Connecting...');
    expect(getConnectionStatusLabel('offline')).toBe('Offline');
  });

  it('generates status description with transport', () => {
    expect(statusDescription('connected', 'wifi')).toBe('Connected (wifi)');
    expect(statusDescription('offline', 'serial')).toBe('Offline (serial)');
    expect(statusDescription('connecting', 'signalr')).toBe('Connecting... (SignalR)');
  });
});
