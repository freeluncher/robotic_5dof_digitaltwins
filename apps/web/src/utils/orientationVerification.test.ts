import { Group } from 'three';
import { describe, expect, it } from 'vitest';

import { verifyYUpAndExportTransform } from './orientationVerification';

describe('orientation and export transform verification', () => {
  it('lulus jika root scene Y-up dan transform root identity', () => {
    const root = new Group();
    root.name = 'robotic_v4';

    const report = verifyYUpAndExportTransform(root);

    expect(report.isYUp).toBe(true);
    expect(report.hasCleanRootTransform).toBe(true);
    expect(report.issues).toHaveLength(0);
  });

  it('gagal jika root scene bukan Y-up atau transform root berubah', () => {
    const root = new Group();
    root.name = 'robotic_v4';
    root.up.set(0, 0, 1);
    root.position.set(1, 0, 0);
    root.scale.set(1.2, 1, 1);

    const report = verifyYUpAndExportTransform(root);

    expect(report.isYUp).toBe(false);
    expect(report.hasCleanRootTransform).toBe(false);
    expect(report.issues.length).toBeGreaterThan(0);
  });
});
