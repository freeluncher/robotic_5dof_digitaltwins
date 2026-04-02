import { describe, expect, it } from 'vitest';

import { convertToRadians, mapHardwareToPivot } from './kinematics';

type RawHardwareData = {
  waist: number;
  shoulder: number;
  elbow: number;
  wristRoll: number;
  wrist: number;
};

const hardwareSample: RawHardwareData = {
  waist: 0,
  shoulder: 45,
  elbow: 90,
  wristRoll: 135,
  wrist: 180,
};

/**
 * waist_pivot, shoulder_pivot, elbow_pivot, wrist_roll_pivot, dan wrist_pivot semuanya masih berada di envelope hardware 0°-180°.
 * Test ini memastikan fungsi konversi dasar tetap linear untuk seluruh joint sebelum limit mekanik spesifik diterapkan di layer lain.
 */
describe('convertToRadians', () => {
  it('mengonversi derajat ke radian secara linear untuk envelope hardware 0°-180°', () => {
    expect(convertToRadians(0)).toBe(0);
    expect(convertToRadians(90)).toBe(Math.PI / 2);
    expect(convertToRadians(180)).toBe(Math.PI);
  });
});

/**
 * waist_pivot diuji pada batas aman hardware 0°-180° untuk memastikan input dasar dari controller dipetakan ke pivot yang benar.
 * Kasus ini memverifikasi bahwa nilai waist tidak tertukar dengan shoulder_pivot atau joint lain.
 */
it('memetakan data waist ke waist_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareSample);

  expect(mapped.waist_pivot).toBe(convertToRadians(hardwareSample.waist));
});

/**
 * shoulder_pivot diuji pada batas aman hardware 0°-180° untuk memastikan rotasi bahu mengikuti nama pivot yang tepat.
 * Kasus ini menjaga agar nilai shoulder tidak bocor ke waist_pivot, elbow_pivot, atau wrist chain.
 */
it('memetakan data shoulder ke shoulder_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareSample);

  expect(mapped.shoulder_pivot).toBe(convertToRadians(hardwareSample.shoulder));
});

/**
 * elbow_pivot diuji pada batas aman hardware 0°-180° untuk menjaga articular chain tetap konsisten di rentang tengah lengan.
 * Kasus ini memastikan input elbow tidak bergeser ke joint wrist.
 */
it('memetakan data elbow ke elbow_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareSample);

  expect(mapped.elbow_pivot).toBe(convertToRadians(hardwareSample.elbow));
});

/**
 * wrist_roll_pivot diuji pada batas aman hardware 0°-180° untuk memastikan rotasi roll tetap berada pada joint yang benar.
 * Kasus ini penting karena wrist roll sering memiliki ambang mekanik yang paling sensitif di ujung lengan.
 */
it('memetakan data wristRoll ke wrist_roll_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareSample);

  expect(mapped.wrist_roll_pivot).toBe(convertToRadians(hardwareSample.wristRoll));
});

/**
 * wrist_pivot diuji pada batas aman hardware 0°-180° untuk memastikan joint ujung lengan tetap terpisah dari wrist_roll_pivot.
 * Kasus ini memastikan rotasi terminal hanya mengenai pivot wrist yang benar.
 */
it('memetakan data wrist ke wrist_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareSample);

  expect(mapped.wrist_pivot).toBe(convertToRadians(hardwareSample.wrist));
});
