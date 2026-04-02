import { describe, expect, it } from 'vitest';

import {
  degreeToRadianCases,
  hardwareFixtureLinear,
  hardwareFixtureMax,
  hardwareFixtureMin,
} from '../tests/fixtures/kinematicsFixtures';
import {
  convertToRadians,
  mapHardwareToPivot,
  mapHardwareToPivotDeltaFromNeutral,
} from './kinematics';

/**
 * waist_pivot, shoulder_pivot, elbow_pivot, wrist_roll_pivot, dan wrist_pivot semuanya masih berada di envelope hardware 0°-180°.
 * Test ini memastikan fungsi konversi dasar tetap linear untuk seluruh joint sebelum limit mekanik spesifik diterapkan di layer lain.
 */
describe('convertToRadians', () => {
  it('mengonversi derajat ke radian secara linear untuk envelope hardware 0°-180°', () => {
    degreeToRadianCases.forEach(({ degrees, expected }) => {
      expect(convertToRadians(degrees)).toBe(expected);
    });
  });
});

/**
 * waist_pivot diuji pada batas aman hardware 0°-180° untuk memastikan input dasar dari controller dipetakan ke pivot yang benar.
 * Kasus ini memverifikasi bahwa nilai waist tidak tertukar dengan shoulder_pivot atau joint lain.
 */
it('memetakan data waist ke waist_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareFixtureLinear);

  expect(mapped.waist_pivot).toBe(convertToRadians(hardwareFixtureLinear.waist));
});

/**
 * shoulder_pivot diuji pada batas aman hardware 0°-180° untuk memastikan rotasi bahu mengikuti nama pivot yang tepat.
 * Kasus ini menjaga agar nilai shoulder tidak bocor ke waist_pivot, elbow_pivot, atau wrist chain.
 */
it('memetakan data shoulder ke shoulder_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareFixtureLinear);

  expect(mapped.shoulder_pivot).toBe(convertToRadians(hardwareFixtureLinear.shoulder));
});

/**
 * elbow_pivot diuji pada batas aman hardware 0°-180° untuk menjaga articular chain tetap konsisten di rentang tengah lengan.
 * Kasus ini memastikan input elbow tidak bergeser ke joint wrist.
 */
it('memetakan data elbow ke elbow_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareFixtureLinear);

  expect(mapped.elbow_pivot).toBe(convertToRadians(hardwareFixtureLinear.elbow));
});

/**
 * wrist_roll_pivot diuji pada batas aman hardware 0°-180° untuk memastikan rotasi roll tetap berada pada joint yang benar.
 * Kasus ini penting karena wrist roll sering memiliki ambang mekanik yang paling sensitif di ujung lengan.
 */
it('memetakan data wristRoll ke wrist_roll_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareFixtureLinear);

  expect(mapped.wrist_roll_pivot).toBe(convertToRadians(hardwareFixtureLinear.wristRoll));
});

/**
 * wrist_pivot diuji pada batas aman hardware 0°-180° untuk memastikan joint ujung lengan tetap terpisah dari wrist_roll_pivot.
 * Kasus ini memastikan rotasi terminal hanya mengenai pivot wrist yang benar.
 */
it('memetakan data wrist ke wrist_pivot pada batas aman 0°-180°', () => {
  const mapped = mapHardwareToPivot(hardwareFixtureLinear);

  expect(mapped.wrist_pivot).toBe(convertToRadians(hardwareFixtureLinear.wrist));
});

/**
 * Guard mekanik memastikan input hardware tidak keluar envelope 0°-180°.
 * Jika nilai melewati batas, fungsi harus menolak data agar rotasi tidak merusak simulasi kinematika.
 */
it('melempar error saat nilai hardware berada di luar rentang aman 0°-180°', () => {
  expect(() => mapHardwareToPivot({ ...hardwareFixtureLinear, waist: -1 })).toThrow(RangeError);
  expect(() => mapHardwareToPivot({ ...hardwareFixtureLinear, shoulder: 181 })).toThrow(RangeError);
});

/**
 * Edge case batas minimum dan maksimum harus tetap valid karena merupakan limit envelope hardware.
 * Test ini memastikan 0° dan 180° untuk semua joint tidak ditolak oleh guard.
 */
it('menerima edge case minimum 0° dan maksimum 180° untuk semua joint', () => {
  const mappedMin = mapHardwareToPivot(hardwareFixtureMin);
  const mappedMax = mapHardwareToPivot(hardwareFixtureMax);

  expect(mappedMin.waist_pivot).toBe(0);
  expect(mappedMin.shoulder_pivot).toBe(0);
  expect(mappedMin.elbow_pivot).toBe(0);
  expect(mappedMin.wrist_roll_pivot).toBe(0);
  expect(mappedMin.wrist_pivot).toBe(0);

  expect(mappedMax.waist_pivot).toBe(Math.PI);
  expect(mappedMax.shoulder_pivot).toBeCloseTo(convertToRadians(167), 12);
  expect(mappedMax.elbow_pivot).toBe(Math.PI);
  expect(mappedMax.wrist_roll_pivot).toBe(Math.PI);
  expect(mappedMax.wrist_pivot).toBe(Math.PI);
});

it('membatasi shoulder pada 167° untuk mencegah tabrakan dengan base', () => {
  const mapped = mapHardwareToPivot({
    ...hardwareFixtureLinear,
    shoulder: 180,
  });

  expect(mapped.shoulder_pivot).toBeCloseTo(convertToRadians(167), 12);
});

/**
 * Input invalid seperti null, undefined, dan NaN harus ditolak agar pipeline kinematics tidak memproses data korup.
 */
it('melempar error untuk input invalid seperti null, undefined, dan NaN', () => {
  expect(() => mapHardwareToPivot(null as unknown as never)).toThrow(TypeError);
  expect(() => mapHardwareToPivot(undefined as unknown as never)).toThrow(TypeError);
  expect(() =>
    mapHardwareToPivot({
      ...hardwareFixtureLinear,
      elbow: Number.NaN,
    }),
  ).toThrow(TypeError);
  expect(() =>
    mapHardwareToPivot({
      ...hardwareFixtureLinear,
      wrist: undefined as unknown as never,
    }),
  ).toThrow(TypeError);
});

it('menghasilkan delta 0 rad saat hardware berada di posisi netral 90°', () => {
  const mapped = mapHardwareToPivotDeltaFromNeutral({
    waist: 90,
    shoulder: 90,
    elbow: 90,
    wristRoll: 90,
    wrist: 90,
  });

  expect(mapped.waist_pivot).toBe(0);
  expect(mapped.shoulder_pivot).toBe(0);
  expect(mapped.elbow_pivot).toBe(0);
  expect(mapped.wrist_roll_pivot).toBe(0);
  expect(mapped.wrist_pivot).toBe(0);
});

it('menghasilkan delta radian yang konsisten saat hardware bergeser dari posisi netral', () => {
  const mapped = mapHardwareToPivotDeltaFromNeutral({
    waist: 120,
    shoulder: 60,
    elbow: 30,
    wristRoll: 150,
    wrist: 75,
  });

  expect(mapped.waist_pivot).toBeCloseTo(convertToRadians(30), 12);
  expect(mapped.shoulder_pivot).toBeCloseTo(convertToRadians(-30), 12);
  expect(mapped.elbow_pivot).toBeCloseTo(convertToRadians(-60), 12);
  expect(mapped.wrist_roll_pivot).toBeCloseTo(convertToRadians(60), 12);
  expect(mapped.wrist_pivot).toBeCloseTo(convertToRadians(-15), 12);
});
