import { describe, expect, it } from 'vitest';

import { resolveModelScaleFromHeight } from './modelScaleNormalization';

describe('model scale normalization', () => {
  it('mengonversi model yang kemungkinan masih mm ke meter (scale 0.001)', () => {
    const result = resolveModelScaleFromHeight(220);

    expect(result.appliedScale).toBe(0.001);
    expect(result.normalizedHeight).toBeCloseTo(0.22);
    expect(result.reason).toBe('likely-mm-model');
  });

  it('mempertahankan scale jika model sudah pada skala meter', () => {
    const result = resolveModelScaleFromHeight(0.42);

    expect(result.appliedScale).toBe(1);
    expect(result.normalizedHeight).toBeCloseTo(0.42);
    expect(result.reason).toBe('already-meter-scale');
  });
});
