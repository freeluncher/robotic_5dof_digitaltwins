import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

const HARDWARE_MIN_DEG = 0;
const HARDWARE_MAX_DEG = 180;

function assertHardwareValue(joint: string, value: unknown): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new TypeError(`${joint} must be a finite number`);
  }

  const degrees = value;

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
  if (data == null || typeof data !== 'object') {
    throw new TypeError('data must be an object');
  }

  assertHardwareValue('waist', data.waist);
  assertHardwareValue('shoulder', data.shoulder);
  assertHardwareValue('elbow', data.elbow);
  assertHardwareValue('wristRoll', data.wristRoll);
  assertHardwareValue('wrist', data.wrist);

  return {
    waist_pivot: convertToRadians(data.waist),
    shoulder_pivot: convertToRadians(data.shoulder),
    elbow_pivot: convertToRadians(data.elbow),
    wrist_roll_pivot: convertToRadians(data.wristRoll),
    wrist_pivot: convertToRadians(data.wrist),
  };
}
