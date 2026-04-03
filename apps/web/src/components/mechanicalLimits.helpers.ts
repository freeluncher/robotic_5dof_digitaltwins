import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';

import type { JointField } from './jointControlPanel.helpers';

export type MechanicalLimitState = 'safe' | 'caution' | 'limit' | 'violation';

export type MechanicalLimitRow = {
  field: JointField | 'gripper';
  label: string;
  value: number;
  min: number;
  max: number;
  marginToMin: number;
  marginToMax: number;
  state: MechanicalLimitState;
  guidance: string;
};

type LimitSpec = {
  field: JointField | 'gripper';
  label: string;
  min: number;
  max: number;
  cautionMargin: number;
  guidance: string;
};

const JOINT_LIMIT_SPECS: LimitSpec[] = [
  {
    field: 'waist',
    label: 'Waist (J1)',
    min: 0,
    max: 180,
    cautionMargin: 10,
    guidance: 'Keep rotation away from internal cable limits.',
  },
  {
    field: 'shoulder',
    label: 'Shoulder (J2)',
    min: 0,
    max: 167,
    cautionMargin: 7,
    guidance: 'Shoulder limits are tighter to prevent the links from colliding with the base.',
  },
  {
    field: 'elbow',
    label: 'Elbow (J3)',
    min: 0,
    max: 180,
    cautionMargin: 10,
    guidance: 'Monitor elbow flexion to avoid reaching extreme angles for extended periods.',
  },
  {
    field: 'wristRoll',
    label: 'Wrist Roll (J4)',
    min: 0,
    max: 180,
    cautionMargin: 10,
    guidance: 'Keep the wrist roll rotation stable to prevent excessive cable twisting.',
  },
  {
    field: 'wrist',
    label: 'Wrist Pitch (J5)',
    min: 0,
    max: 180,
    cautionMargin: 10,
    guidance: 'Wrist pitch affects the reachable workspace of the gripper at the end of the arm.',
  },
  {
    field: 'gripper',
    label: 'Gripper',
    min: 90,
    max: 180,
    cautionMargin: 5,
    guidance: 'Gripper minimum 90° indicates the fully open position.',
  },
];

function getLimitState(value: number, min: number, max: number, cautionMargin: number): MechanicalLimitState {
  if (value < min || value > max) {
    return 'violation';
  }

  if (value === min || value === max) {
    return 'limit';
  }

  const marginToMin = value - min;
  const marginToMax = max - value;

  if (marginToMin <= cautionMargin || marginToMax <= cautionMargin) {
    return 'caution';
  }

  return 'safe';
}

export function buildMechanicalLimitRows(hardware: RawHardwareData, gripper: number): MechanicalLimitRow[] {
  return JOINT_LIMIT_SPECS.map((spec) => {
    const value = spec.field === 'gripper' ? gripper : hardware[spec.field];
    const marginToMin = value - spec.min;
    const marginToMax = spec.max - value;

    return {
      field: spec.field,
      label: spec.label,
      value,
      min: spec.min,
      max: spec.max,
      marginToMin,
      marginToMax,
      state: getLimitState(value, spec.min, spec.max, spec.cautionMargin),
      guidance: spec.guidance,
    };
  });
}

export function formatMechanicalRange(row: MechanicalLimitRow): string {
  return `${Math.round(row.min)}..${Math.round(row.max)} deg`;
}

export function formatMechanicalMargin(row: MechanicalLimitRow): string {
  if (row.state === 'violation') {
    return 'out of range';
  }

  return `${Math.round(Math.min(row.marginToMin, row.marginToMax))} deg margin`;
}

export function getMechanicalLimitSummary(rows: MechanicalLimitRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary[row.state] += 1;
      return summary;
    },
    {
      safe: 0,
      caution: 0,
      limit: 0,
      violation: 0,
    },
  );
}
