import { useEffect, useMemo } from 'react';
import { ArrowHelper, AxesHelper, Group, Mesh, Object3D, Vector3 } from 'three';

import { mapMainJointPivots } from '../utils/sceneGraphMapping';

const LOCAL_NORMAL = new Vector3(0, 1, 0);
const OBJECT_NORMAL = new Vector3(0, 0, 1);

const JOINT_DEBUG_COLORS: Record<string, number> = {
  waist_pivot: 0xff6b6b,
  shoulder_pivot: 0xffb703,
  elbow_pivot: 0x4cc9f0,
  wrist_roll_pivot: 0xf72585,
  wrist_pivot: 0x90be6d,
  gear_l_pivot: 0x00c2a8,
  gear_r_pivot: 0x00c2a8,
  connection_link_l_pivot: 0x577590,
  connection_link_r_pivot: 0x577590,
  gripper_l_pivot: 0xff9f1c,
  gripper_r_pivot: 0xff9f1c,
  gripper_l: 0x8338ec,
  gripper_r: 0x8338ec,
  gripper_connecting_link_l: 0x4d908e,
  gripper_connecting_link_r: 0x4d908e,
};

const PARALLEL_GRIPPER_DEBUG_NODES = [
  'gear_l_pivot',
  'gear_r_pivot',
  'connection_link_l_pivot',
  'connection_link_r_pivot',
  'gripper_l_pivot',
  'gripper_r_pivot',
  'gripper_l',
  'gripper_r',
  'gripper_connecting_link_l',
  'gripper_connecting_link_r',
] as const;

const tempArrowOrigin = new Vector3(0, 0, 0);

function isDebugNode(nodeName: string): boolean {
  return nodeName.startsWith('debug_') || nodeName.startsWith('normal_');
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

function createObjectNormalArrow(nodeName: string, helperLength: number): ArrowHelper {
  const normalArrow = new ArrowHelper(
    OBJECT_NORMAL,
    tempArrowOrigin,
    helperLength,
    JOINT_DEBUG_COLORS[nodeName] ?? 0xb8c0cc,
  );
  normalArrow.name = `normal_${nodeName}`;
  normalArrow.renderOrder = 998;
  setDebugMaterialVisibility(normalArrow);
  return normalArrow;
}

export type JointDebugHelpersProps = {
  root: Object3D;
  helperLength: number;
};

export function JointDebugHelpers({ root, helperLength }: JointDebugHelpersProps) {
  const pivots = useMemo(() => mapMainJointPivots(root), [root]);

  useEffect(() => {
    const attachedHelpers: Array<{ pivot: Object3D; helper: Group }> = [];
    const attachedNormals: Array<{ node: Object3D; helper: ArrowHelper }> = [];

    for (const pivotName of Object.keys(pivots) as Array<keyof typeof pivots>) {
      const pivot = pivots[pivotName];
      const helper = createJointDebugGroup(String(pivotName), helperLength);
      pivot.add(helper);
      attachedHelpers.push({ pivot, helper });
    }

    for (const nodeName of PARALLEL_GRIPPER_DEBUG_NODES) {
      const node = root.getObjectByName(nodeName);
      if (!node) {
        continue;
      }

      const helper = createJointDebugGroup(nodeName, helperLength * 0.7);
      node.add(helper);
      attachedHelpers.push({ pivot: node, helper });
    }

    root.traverse((node) => {
      if (!node.name || node === root || isDebugNode(node.name)) {
        return;
      }

      const normalArrow = createObjectNormalArrow(node.name, helperLength * 0.35);
      node.add(normalArrow);
      attachedNormals.push({ node, helper: normalArrow });
    });

    return () => {
      for (const { pivot, helper } of attachedHelpers) {
        pivot.remove(helper);
      }

      for (const { node, helper } of attachedNormals) {
        node.remove(helper);
      }
    };
  }, [helperLength, pivots]);

  return null;
}
