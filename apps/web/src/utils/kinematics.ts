import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

export function convertToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function mapHardwareToPivot(data: RawHardwareData): JointPivotMappingOutput {
  return {
    waist_pivot: convertToRadians(data.waist),
    shoulder_pivot: convertToRadians(data.shoulder),
    elbow_pivot: convertToRadians(data.elbow),
    wrist_roll_pivot: convertToRadians(data.wristRoll),
    wrist_pivot: convertToRadians(data.wrist),
  };
}
