import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

export type JointField = keyof RawHardwareData;

const HARDWARE_MIN = 0;
const HARDWARE_MAX = 180;
const GRIPPER_MIN = 0;
const GRIPPER_MAX = 180;

export function clampHardwareAngle(value: number): number {
  return Math.min(HARDWARE_MAX, Math.max(HARDWARE_MIN, value));
}

export function clampGripperAngle(value: number): number {
  return Math.min(GRIPPER_MAX, Math.max(GRIPPER_MIN, value));
}

export function withJointAngle(
  hardware: RawHardwareData,
  joint: JointField,
  nextAngle: number,
): RawHardwareData {
  return {
    ...hardware,
    [joint]: clampHardwareAngle(nextAngle),
  };
}

export function neutralHardwareAngles(): RawHardwareData {
  return {
    waist: 90,
    shoulder: 90,
    elbow: 90,
    wristRoll: 90,
    wrist: 90,
  };
}

export function neutralGripperAngle(): number {
  return 90;
}
