import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import { ROTATION_MAPPING_BY_PIVOT } from './jointRotationAxes';

export const REQUIRED_MAIN_PIVOTS = [
  'waist_pivot',
  'shoulder_pivot',
  'elbow_pivot',
  'wrist_roll_pivot',
  'wrist_pivot',
] as const;

type RequiredMainPivot = (typeof REQUIRED_MAIN_PIVOTS)[number];

export type PivotNode = {
  name: string;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
};

export type PivotNodeMap = Record<string, PivotNode>;

export function verifyMainPivots(nodeNames: string[]) {
  const missing = REQUIRED_MAIN_PIVOTS.filter((pivot) => !nodeNames.includes(pivot));

  return {
    ok: missing.length === 0,
    missing,
  };
}

export function applyMappedRotationsToPivots(nodes: PivotNodeMap, mapped: JointPivotMappingOutput) {
  const mappingByPivot: Record<RequiredMainPivot, number> = {
    waist_pivot: mapped.waist_pivot,
    shoulder_pivot: mapped.shoulder_pivot,
    elbow_pivot: mapped.elbow_pivot,
    wrist_roll_pivot: mapped.wrist_roll_pivot,
    wrist_pivot: mapped.wrist_pivot,
  };

  for (const pivot of REQUIRED_MAIN_PIVOTS) {
    const node = nodes[pivot];
    if (!node) {
      throw new Error(`Missing pivot node: ${pivot}`);
    }

    if (!node.name.endsWith('_pivot')) {
      throw new Error(`Rotation target is not a pivot node: ${node.name}`);
    }

    // All main joints are applied through pivot transform nodes, not mesh links.
    const mapping = ROTATION_MAPPING_BY_PIVOT[pivot];
    node.rotation[mapping.axis] = (mapping.offset ?? 0) + mappingByPivot[pivot] * mapping.direction;
  }
}
