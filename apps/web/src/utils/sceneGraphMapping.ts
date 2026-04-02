import type { Object3D } from 'three';

import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import { REQUIRED_MAIN_PIVOTS } from './pivotRuntime';

type MainPivotName = (typeof REQUIRED_MAIN_PIVOTS)[number];

export type MainPivotLookup = Record<MainPivotName, Object3D>;

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

  pivots.waist_pivot.rotation.z = mapped.waist_pivot;
  pivots.shoulder_pivot.rotation.z = mapped.shoulder_pivot;
  pivots.elbow_pivot.rotation.z = mapped.elbow_pivot;
  pivots.wrist_roll_pivot.rotation.z = mapped.wrist_roll_pivot;
  pivots.wrist_pivot.rotation.z = mapped.wrist_pivot;
}
