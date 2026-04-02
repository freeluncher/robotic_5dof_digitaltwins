import { create } from 'zustand';

import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

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
  setHardware: (next: RawHardwareData) => void;
  setMapped: (next: JointPivotMappingOutput) => void;
};

export const useRobotStore = create<RobotState>((set) => ({
  hardware: defaultHardware,
  mapped: defaultMapped,
  setHardware: (next) => set({ hardware: next }),
  setMapped: (next) => set({ mapped: next }),
}));
