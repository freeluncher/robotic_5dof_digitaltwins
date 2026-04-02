import { create } from 'zustand';

import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

const ROBOT_UPDATE_THROTTLE_MS = 16;
const GRIPPER_MIN = 90;
const GRIPPER_MAX = 180;

const defaultHardware: RawHardwareData = {
  waist: 90,
  shoulder: 90,
  elbow: 90,
  wristRoll: 90,
  wrist: 90,
};

const defaultMapped: JointPivotMappingOutput = {
  waist_pivot: 0,
  shoulder_pivot: 0,
  elbow_pivot: 0,
  wrist_roll_pivot: 0,
  wrist_pivot: 0,
};

type RobotState = {
  hardware: RawHardwareData;
  mapped: JointPivotMappingOutput;
  gripper: number;
  setHardware: (next: RawHardwareData) => void;
  setMapped: (next: JointPivotMappingOutput) => void;
  setGripper: (next: number) => void;
};

let pendingHardware: RawHardwareData | null = null;
let pendingMapped: JointPivotMappingOutput | null = null;
let pendingGripper: number | null = null;
let pendingFlushHandle: ReturnType<typeof setTimeout> | null = null;

function flushRobotUpdates() {
  const nextState: Partial<Pick<RobotState, 'hardware' | 'mapped' | 'gripper'>> = {};

  if (pendingHardware !== null) {
    nextState.hardware = pendingHardware;
  }

  if (pendingMapped !== null) {
    nextState.mapped = pendingMapped;
  }

  if (pendingGripper !== null) {
    nextState.gripper = pendingGripper;
  }

  pendingHardware = null;
  pendingMapped = null;
  pendingGripper = null;

  if (Object.keys(nextState).length > 0) {
    useRobotStore.setState(nextState);
  }
}

function scheduleRobotUpdateFlush() {
  if (pendingFlushHandle !== null) {
    return;
  }

  pendingFlushHandle = setTimeout(() => {
    pendingFlushHandle = null;
    flushRobotUpdates();
  }, ROBOT_UPDATE_THROTTLE_MS);
}

export function flushRobotStoreUpdates() {
  if (pendingFlushHandle !== null) {
    clearTimeout(pendingFlushHandle);
    pendingFlushHandle = null;
  }

  flushRobotUpdates();
}

export function cancelRobotStoreUpdates() {
  if (pendingFlushHandle !== null) {
    clearTimeout(pendingFlushHandle);
    pendingFlushHandle = null;
  }

  pendingHardware = null;
  pendingMapped = null;
  pendingGripper = null;
}

export const useRobotStore = create<RobotState>((set) => ({
  hardware: defaultHardware,
  mapped: defaultMapped,
  gripper: 90,
  setHardware: (next) => {
    pendingHardware = next;
    scheduleRobotUpdateFlush();
  },
  setMapped: (next) => {
    pendingMapped = next;
    scheduleRobotUpdateFlush();
  },
  setGripper: (next) => {
    pendingGripper = Math.min(GRIPPER_MAX, Math.max(GRIPPER_MIN, next));
    scheduleRobotUpdateFlush();
  },
}));
