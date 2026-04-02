import type { JointPivotMappingOutput } from '../../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../../shared/contracts/raw-hardware-data';

export const hardwareFixtureLinear: RawHardwareData = {
  waist: 0,
  shoulder: 45,
  elbow: 90,
  wristRoll: 135,
  wrist: 180,
};

export const hardwareFixtureMin: RawHardwareData = {
  waist: 0,
  shoulder: 0,
  elbow: 0,
  wristRoll: 0,
  wrist: 0,
};

export const hardwareFixtureMax: RawHardwareData = {
  waist: 180,
  shoulder: 180,
  elbow: 180,
  wristRoll: 180,
  wrist: 180,
};

export const mappedFixtureRadians: JointPivotMappingOutput = {
  waist_pivot: 0,
  shoulder_pivot: Math.PI / 4,
  elbow_pivot: Math.PI / 2,
  wrist_roll_pivot: (3 * Math.PI) / 4,
  wrist_pivot: Math.PI,
};

export const degreeToRadianCases: Array<{ degrees: number; expected: number }> = [
  { degrees: 0, expected: 0 },
  { degrees: 90, expected: Math.PI / 2 },
  { degrees: 180, expected: Math.PI },
];
