import type { JointPivotMappingOutput } from '../../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../../shared/contracts/raw-hardware-data';

export const defaultHardwareFixture: RawHardwareData = {
  waist: 90,
  shoulder: 90,
  elbow: 90,
  wristRoll: 90,
  wrist: 90,
};

export const updatedHardwareFixture: RawHardwareData = {
  waist: 100,
  shoulder: 80,
  elbow: 75,
  wristRoll: 120,
  wrist: 60,
};

export const defaultMappedFixture: JointPivotMappingOutput = {
  waist_pivot: 0,
  shoulder_pivot: 0,
  elbow_pivot: 0,
  wrist_roll_pivot: 0,
  wrist_pivot: 0,
};

export const updatedMappedFixture: JointPivotMappingOutput = {
  waist_pivot: Math.PI / 2,
  shoulder_pivot: Math.PI / 3,
  elbow_pivot: Math.PI / 4,
  wrist_roll_pivot: Math.PI / 6,
  wrist_pivot: Math.PI / 8,
};
