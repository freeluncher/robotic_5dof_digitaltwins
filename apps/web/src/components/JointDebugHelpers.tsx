import { useEffect, useMemo } from 'react';
import { ArrowHelper, AxesHelper, Group, Mesh, Object3D, Vector3 } from 'three';

import { mapMainJointPivots } from '../utils/sceneGraphMapping';

const LOCAL_NORMAL = new Vector3(0, 1, 0);

const JOINT_DEBUG_COLORS: Record<string, number> = {
  waist_pivot: 0xff6b6b,
  shoulder_pivot: 0xffb703,
  elbow_pivot: 0x4cc9f0,
  wrist_roll_pivot: 0xf72585,
  wrist_pivot: 0x90be6d,
};

function setDebugMaterialVisibility(object: Object3D) {
  object.traverse((child) => {
    const meshChild = child as Mesh & { material?: { depthTest?: boolean; depthWrite?: boolean } | Array<{ depthTest?: boolean; depthWrite?: boolean }> };

    if (!meshChild.material) {
      return;
    }

    const materials = Array.isArray(meshChild.material) ? meshChild.material : [meshChild.material];

    for (const material of materials) {
      material.depthTest = false;
      material.depthWrite = false;
    }
  });
}

function createJointDebugGroup(pivotName: string, helperLength: number): Group {
  const debugGroup = new Group();
  debugGroup.name = `debug_${pivotName}`;
  debugGroup.renderOrder = 999;

  const axesHelper = new AxesHelper(helperLength);
  axesHelper.renderOrder = 999;

  const normalArrow = new ArrowHelper(
    LOCAL_NORMAL,
    new Vector3(0, 0, 0),
    helperLength,
    JOINT_DEBUG_COLORS[pivotName] ?? 0xffffff,
  );
  normalArrow.renderOrder = 999;

  setDebugMaterialVisibility(axesHelper);
  setDebugMaterialVisibility(normalArrow);

  debugGroup.add(axesHelper);
  debugGroup.add(normalArrow);
  return debugGroup;
}

export type JointDebugHelpersProps = {
  root: Object3D;
  helperLength: number;
};

export function JointDebugHelpers({ root, helperLength }: JointDebugHelpersProps) {
  const pivots = useMemo(() => mapMainJointPivots(root), [root]);

  useEffect(() => {
    const attachedHelpers: Array<{ pivot: Object3D; helper: Group }> = [];

    for (const pivotName of Object.keys(pivots) as Array<keyof typeof pivots>) {
      const pivot = pivots[pivotName];
      const helper = createJointDebugGroup(String(pivotName), helperLength);
      pivot.add(helper);
      attachedHelpers.push({ pivot, helper });
    }

    return () => {
      for (const { pivot, helper } of attachedHelpers) {
        pivot.remove(helper);
      }
    };
  }, [helperLength, pivots]);

  return null;
}
