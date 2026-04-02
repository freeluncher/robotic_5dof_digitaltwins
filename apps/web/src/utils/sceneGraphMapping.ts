import type { Object3D } from 'three';

import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import { ROTATION_MAPPING_BY_PIVOT } from './jointRotationAxes';
import { REQUIRED_MAIN_PIVOTS } from './pivotRuntime';

type MainPivotName = (typeof REQUIRED_MAIN_PIVOTS)[number];

export type MainPivotLookup = Record<MainPivotName, Object3D>;

export function countDetectedMainPivots(root: Object3D): number {
  let count = 0;

  for (const pivotName of REQUIRED_MAIN_PIVOTS) {
    if (root.getObjectByName(pivotName)) {
      count += 1;
    }
  }

  return count;
}

export function mapMainJointPivots(root: Object3D): MainPivotLookup {
  const lookup = {} as MainPivotLookup;

  for (const pivotName of REQUIRED_MAIN_PIVOTS) {
    const node = root.getObjectByName(pivotName);

    if (!node) {
      throw new Error(`Missing pivot node in scene graph: ${pivotName}`);
    }

    if (!node.name.endsWith('_pivot')) {
      throw new Error(`Invalid pivot node target: ${node.name}`);
    }

    lookup[pivotName] = node;
  }

  return lookup;
}

export function applyJointMappingToSceneGraph(root: Object3D, mapped: JointPivotMappingOutput): void {
  const pivots = mapMainJointPivots(root);

  const valueByPivot = {
    waist_pivot: mapped.waist_pivot,
    shoulder_pivot: mapped.shoulder_pivot,
    elbow_pivot: mapped.elbow_pivot,
    wrist_roll_pivot: mapped.wrist_roll_pivot,
    wrist_pivot: mapped.wrist_pivot,
  };

  for (const pivotName of REQUIRED_MAIN_PIVOTS) {
    const mapping = ROTATION_MAPPING_BY_PIVOT[pivotName];
    pivots[pivotName].rotation[mapping.axis] = valueByPivot[pivotName] * mapping.direction;
  }
}
