import { REQUIRED_MAIN_PIVOTS } from './pivotRuntime';

type MainPivotName = (typeof REQUIRED_MAIN_PIVOTS)[number];

export type RotationAxis = 'x' | 'y' | 'z';

export type RotationMapping = {
  axis: RotationAxis;
  direction: 1 | -1;
};

// Mapping uses explicit axis + direction to keep mechanical calibration centralized.
export const ROTATION_MAPPING_BY_PIVOT: Record<MainPivotName, RotationMapping> = {
  waist_pivot: { axis: 'y', direction: 1 },
  shoulder_pivot: { axis: 'x', direction: 1 },
  elbow_pivot: { axis: 'x', direction: 1 },
  wrist_roll_pivot: { axis: 'y', direction: 1 },
  wrist_pivot: { axis: 'z', direction: 1 },
};
