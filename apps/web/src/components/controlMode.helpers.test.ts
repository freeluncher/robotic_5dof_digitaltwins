import { describe, expect, it } from 'vitest';

import {
  getControlModeDescription,
  getControlModeLabel,
  getControlModeTone,
  isLiveMode,
} from './controlMode.helpers';

describe('control mode helpers', () => {
  it('labels manual mode correctly', () => {
    expect(getControlModeLabel('manual')).toBe('Manual Control');
  });

  it('labels live mode correctly', () => {
    expect(getControlModeLabel('live')).toBe('Live Data');
  });

  it('describes manual control behavior', () => {
    expect(getControlModeDescription('manual')).toContain('slider');
  });

  it('describes live data behavior', () => {
    expect(getControlModeDescription('live')).toContain('telemetry realtime');
  });

  it('returns the same tone as the mode name', () => {
    expect(getControlModeTone('manual')).toBe('manual');
    expect(getControlModeTone('live')).toBe('live');
  });

  it('detects live mode correctly', () => {
    expect(isLiveMode('manual')).toBe(false);
    expect(isLiveMode('live')).toBe(true);
  });
});
