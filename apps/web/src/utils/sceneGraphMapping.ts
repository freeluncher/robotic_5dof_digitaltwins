import { Quaternion, Vector3 } from 'three';
import type { Object3D } from 'three';

import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import { ROTATION_MAPPING_BY_PIVOT } from './jointRotationAxes';
import { REQUIRED_MAIN_PIVOTS } from './pivotRuntime';

type MainPivotName = (typeof REQUIRED_MAIN_PIVOTS)[number];

export type MainPivotLookup = Record<MainPivotName, Object3D>;

const tempWristWorldPosition = new Vector3();
const tempElbowWorldPosition = new Vector3();
const tempAxisWorld = new Vector3();
const tempAxisPointWorld = new Vector3();
const tempAxisPointParent = new Vector3();
const tempWristParentPosition = new Vector3();
const tempAxisParent = new Vector3();
const tempWristQuaternion = new Quaternion();
const GEAR_BISECTOR_YZ_AXIS = new Vector3(0, 1, 1).normalize();
const tempGearDeltaQuaternion = new Quaternion();

const GRIPPER_NEUTRAL_DEG = 90;

function applyAxisAngleInParentSpace(node: Object3D, axisInParentSpace: Vector3, angle: number): void {
  tempWristQuaternion.setFromAxisAngle(axisInParentSpace, angle);
  node.quaternion.copy(tempWristQuaternion);
}

function applyWristRollByLink2Normal(root: Object3D, mappedRoll: number): boolean {
  const wristRollPivot = root.getObjectByName('wrist_roll_pivot');
  const elbowPivot = root.getObjectByName('elbow_pivot');

  if (!wristRollPivot || !elbowPivot || !wristRollPivot.parent) {
    return false;
  }

  wristRollPivot.getWorldPosition(tempWristWorldPosition);
  elbowPivot.getWorldPosition(tempElbowWorldPosition);

  tempAxisWorld.subVectors(tempWristWorldPosition, tempElbowWorldPosition);
  if (tempAxisWorld.lengthSq() <= 1e-12) {
    return false;
  }

  tempAxisWorld.normalize();

  tempAxisPointWorld.copy(tempWristWorldPosition).add(tempAxisWorld);

  const parent = wristRollPivot.parent;
  parent.worldToLocal(tempAxisPointParent.copy(tempAxisPointWorld));
  parent.worldToLocal(tempWristParentPosition.copy(tempWristWorldPosition));

  tempAxisParent.subVectors(tempAxisPointParent, tempWristParentPosition);
  if (tempAxisParent.lengthSq() <= 1e-12) {
    return false;
  }

  tempAxisParent.normalize();
  applyAxisAngleInParentSpace(wristRollPivot, tempAxisParent, mappedRoll);
  return true;
}

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

  const wristRollAppliedUsingLink2Normal = applyWristRollByLink2Normal(root, mapped.wrist_roll_pivot);

  const valueByPivot = {
    waist_pivot: mapped.waist_pivot,
    shoulder_pivot: mapped.shoulder_pivot,
    elbow_pivot: mapped.elbow_pivot,
    wrist_roll_pivot: mapped.wrist_roll_pivot,
    wrist_pivot: mapped.wrist_pivot,
  };

  for (const pivotName of REQUIRED_MAIN_PIVOTS) {
    if (pivotName === 'wrist_roll_pivot' && wristRollAppliedUsingLink2Normal) {
      continue;
    }

    const mapping = ROTATION_MAPPING_BY_PIVOT[pivotName];
    pivots[pivotName].rotation[mapping.axis] =
      (mapping.offset ?? 0) + valueByPivot[pivotName] * mapping.direction;
  }
}

export function applyGripperGearRotation(root: Object3D, gripperDeg: number): boolean {
  const gearLeftPivot = root.getObjectByName('gear_l_pivot');
  const gearRightPivot = root.getObjectByName('gear_r_pivot');
  const gearLeft = root.getObjectByName('gear_l');
  const gearRight = root.getObjectByName('gear_r');

  const leftTarget = gearLeftPivot ?? gearLeft;
  const rightTarget = gearRightPivot ?? gearRight;

  if (!leftTarget || !rightTarget) {
    return false;
  }

  const angleRad = ((gripperDeg - GRIPPER_NEUTRAL_DEG) * Math.PI) / 180;
  const leftBase =
    (leftTarget.userData.__gearBaseQuaternion as Quaternion | undefined) ??
    leftTarget.quaternion.clone();
  if (!leftTarget.userData.__gearBaseQuaternion) {
    leftTarget.userData.__gearBaseQuaternion = leftBase;
  }

  const rightBase =
    (rightTarget.userData.__gearBaseQuaternion as Quaternion | undefined) ??
    rightTarget.quaternion.clone();
  if (!rightTarget.userData.__gearBaseQuaternion) {
    rightTarget.userData.__gearBaseQuaternion = rightBase;
  }

  tempGearDeltaQuaternion.setFromAxisAngle(GEAR_BISECTOR_YZ_AXIS, angleRad);
  leftTarget.quaternion.copy(leftBase).multiply(tempGearDeltaQuaternion);

  tempGearDeltaQuaternion.setFromAxisAngle(GEAR_BISECTOR_YZ_AXIS, -angleRad);
  rightTarget.quaternion.copy(rightBase).multiply(tempGearDeltaQuaternion);
  return true;
}
