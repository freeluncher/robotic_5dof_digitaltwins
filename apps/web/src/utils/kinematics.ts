import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

const HARDWARE_MIN_DEG = 0;
const HARDWARE_MAX_DEG = 180;

function assertHardwareRange(joint: string, degrees: number): void {
  if (degrees < HARDWARE_MIN_DEG || degrees > HARDWARE_MAX_DEG) {
    throw new RangeError(
      `${joint} is out of hardware range (${HARDWARE_MIN_DEG}..${HARDWARE_MAX_DEG}): ${degrees}`,
    );
  }
}

export function convertToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function mapHardwareToPivot(data: RawHardwareData): JointPivotMappingOutput {
  assertHardwareRange('waist', data.waist);
  assertHardwareRange('shoulder', data.shoulder);
  assertHardwareRange('elbow', data.elbow);
  assertHardwareRange('wristRoll', data.wristRoll);
  assertHardwareRange('wrist', data.wrist);

  return {
    waist_pivot: convertToRadians(data.waist),
    shoulder_pivot: convertToRadians(data.shoulder),
    elbow_pivot: convertToRadians(data.elbow),
    wrist_roll_pivot: convertToRadians(data.wristRoll),
    wrist_pivot: convertToRadians(data.wrist),
  };
}
