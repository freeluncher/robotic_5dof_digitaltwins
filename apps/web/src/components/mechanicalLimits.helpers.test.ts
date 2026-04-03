import { describe, expect, it } from 'vitest';

import {
  buildMechanicalLimitRows,
  formatMechanicalMargin,
  formatMechanicalRange,
  getMechanicalLimitSummary,
} from './mechanicalLimits.helpers';

describe('mechanical limit helpers', () => {
  it('builds rows for all joints and gripper', () => {
    const rows = buildMechanicalLimitRows(
      {
        waist: 90,
        shoulder: 160,
        elbow: 90,
        wristRoll: 90,
        wrist: 90,
      },
      100,
    );

    expect(rows).toHaveLength(6);
    expect(rows[0].label).toBe('Waist (J1)');
    expect(rows[1].state).toBe('caution');
    expect(rows[5].label).toBe('Gripper');
  });

  it('marks values at boundary as limit', () => {
    const rows = buildMechanicalLimitRows(
      {
        waist: 0,
        shoulder: 90,
        elbow: 90,
        wristRoll: 90,
        wrist: 90,
      },
      90,
    );

    expect(rows[0].state).toBe('limit');
    expect(rows[5].state).toBe('limit');
  });

  it('detects violations outside mechanical range', () => {
    const rows = buildMechanicalLimitRows(
      {
        waist: 181,
        shoulder: 90,
        elbow: 90,
        wristRoll: 90,
        wrist: 90,
      },
      90,
    );

    expect(rows[0].state).toBe('violation');
  });

  it('formats limit range and margin text', () => {
    const rows = buildMechanicalLimitRows(
      {
        waist: 90,
        shoulder: 160,
        elbow: 90,
        wristRoll: 90,
        wrist: 90,
      },
      100,
    );

    expect(formatMechanicalRange(rows[1])).toBe('0..167 deg');
    expect(formatMechanicalMargin(rows[1])).toBe('7 deg margin');
  });

  it('summarizes caution and limit counts', () => {
    const rows = buildMechanicalLimitRows(
      {
        waist: 0,
        shoulder: 160,
        elbow: 90,
        wristRoll: 90,
        wrist: 90,
      },
      90,
    );

    expect(getMechanicalLimitSummary(rows)).toEqual({
      safe: 3,
      caution: 1,
      limit: 2,
      violation: 0,
    });
  });
});
