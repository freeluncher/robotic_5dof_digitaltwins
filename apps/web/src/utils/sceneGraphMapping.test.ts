import { Group, Object3D } from 'three';
import { describe, expect, it } from 'vitest';

import { mappedFixtureRadians } from '../tests/fixtures/kinematicsFixtures';
import {
  applyGripperGearRotation,
  applyJointMappingToSceneGraph,
  countDetectedMainPivots,
  mapMainJointPivots,
} from './sceneGraphMapping';

function createNode(name: string): Object3D {
  const node = new Group();
  node.name = name;
  return node;
}

function createRobotRoot(): Group {
  const root = createNode('robotic_v4') as Group;

  root.add(createNode('waist_pivot'));
  root.add(createNode('shoulder_pivot'));
  root.add(createNode('elbow_pivot'));
  root.add(createNode('wrist_roll_pivot'));
  root.add(createNode('wrist_pivot'));
  root.add(createNode('link1'));

  return root;
}

function createHierarchicalRobotRootForWristRoll(): Group {
  const root = createNode('robotic_v4') as Group;
  const waist = createNode('waist_pivot');
  const shoulder = createNode('shoulder_pivot');
  const elbow = createNode('elbow_pivot');
  const link2 = createNode('link2');
  const wristRoll = createNode('wrist_roll_pivot');
  const wrist = createNode('wrist_pivot');

  root.add(waist);
  waist.add(shoulder);
  shoulder.add(elbow);
  elbow.add(link2);
  link2.add(wristRoll);
  wristRoll.add(wrist);

  elbow.position.set(0, 0, 1);
  wristRoll.position.set(1, 0, 0);

  return root;
}

describe('scene graph joint mapping', () => {
  it('menghitung jumlah pivot utama yang terdeteksi di scene graph', () => {
    const root = createRobotRoot();

    expect(countDetectedMainPivots(root)).toBe(5);
  });

  it('memetakan 5 joint utama ke pivot node Three.js', () => {
    const root = createRobotRoot();

    const pivots = mapMainJointPivots(root);

    expect(Object.keys(pivots)).toHaveLength(5);
    expect(pivots.waist_pivot.name).toBe('waist_pivot');
    expect(pivots.shoulder_pivot.name).toBe('shoulder_pivot');
    expect(pivots.elbow_pivot.name).toBe('elbow_pivot');
    expect(pivots.wrist_roll_pivot.name).toBe('wrist_roll_pivot');
    expect(pivots.wrist_pivot.name).toBe('wrist_pivot');
  });

  it('menerapkan mapped joint hanya ke rotasi pivot, bukan ke mesh link', () => {
    const root = createRobotRoot();
    const link1 = root.getObjectByName('link1');

    if (!link1) {
      throw new Error('Missing link1 test node');
    }

    applyJointMappingToSceneGraph(root, mappedFixtureRadians);

    expect(root.getObjectByName('waist_pivot')?.rotation.y).toBe(mappedFixtureRadians.waist_pivot);
    expect(root.getObjectByName('waist_pivot')?.rotation.z).toBe(0);
    expect(root.getObjectByName('shoulder_pivot')?.rotation.x).toBe(
      mappedFixtureRadians.shoulder_pivot,
    );
    expect(root.getObjectByName('shoulder_pivot')?.rotation.z).toBe(0);
    expect(root.getObjectByName('elbow_pivot')?.rotation.x).toBe(mappedFixtureRadians.elbow_pivot);
    expect(root.getObjectByName('elbow_pivot')?.rotation.z).toBe(0);
    expect(root.getObjectByName('wrist_roll_pivot')?.rotation.y).toBe(
      mappedFixtureRadians.wrist_roll_pivot,
    );
    expect(root.getObjectByName('wrist_roll_pivot')?.rotation.z).toBe(0);
    expect(root.getObjectByName('wrist_pivot')?.rotation.x).toBe(mappedFixtureRadians.wrist_pivot);
    expect(root.getObjectByName('wrist_pivot')?.rotation.z).toBe(0);
    expect(link1.rotation.z).toBe(0);
  });

  it('menerapkan wrist roll mengikuti normal link2 saat hierarchy lengkap', () => {
    const root = createHierarchicalRobotRootForWristRoll();

    applyJointMappingToSceneGraph(root, mappedFixtureRadians);

    const wristRollPivot = root.getObjectByName('wrist_roll_pivot');
    if (!wristRollPivot) {
      throw new Error('Missing wrist_roll_pivot test node');
    }

    expect(Math.abs(wristRollPivot.quaternion.x)).toBeGreaterThan(0);
    expect(wristRollPivot.rotation.y).toBeCloseTo(0, 6);
  });

  it('menerapkan rotasi gripper berbasis gear dengan arah berlawanan', () => {
    const root = createNode('robotic_v4') as Group;
    const gearLPivot = createNode('gear_l_pivot');
    const gearRPivot = createNode('gear_r_pivot');
    const connectionLPivot = createNode('connection_link_l_pivot');
    const connectionRPivot = createNode('connection_link_r_pivot');
    const gripperLPivot = createNode('gripper_l_pivot');
    const gripperRPivot = createNode('gripper_r_pivot');
    const gearL = createNode('gear_l');
    const gearR = createNode('gear_r');
    const connectionL = createNode('gripper_connecting_link_l');
    const connectionR = createNode('gripper_connecting_link_r');
    const gripperL = createNode('gripper_l');
    const gripperR = createNode('gripper_r');
    root.add(gearLPivot);
    root.add(gearRPivot);
    root.add(connectionLPivot);
    root.add(connectionRPivot);
    root.add(gripperLPivot);
    root.add(gripperRPivot);
    gearLPivot.add(gearL);
    gearRPivot.add(gearR);
    connectionLPivot.add(connectionL);
    connectionRPivot.add(connectionR);
    gripperLPivot.add(gripperL);
    gripperRPivot.add(gripperR);

    const applied = applyGripperGearRotation(root, 120);
    const halfAngleSin = Math.sin(Math.PI / 12);
    const halfAngleCos = Math.cos(Math.PI / 12);
    const bisectorComponent = halfAngleSin / Math.sqrt(2);
    const gripperHalfAngleSin = Math.sin((Math.PI / 6) * 0.45 * 0.5);
    const gripperHalfAngleCos = Math.cos((Math.PI / 6) * 0.45 * 0.5);
    const gripperBisectorComponent = gripperHalfAngleSin / Math.sqrt(2);

    expect(applied).toBe(true);
    expect(gearLPivot.quaternion.x).toBeCloseTo(0, 12);
    expect(gearLPivot.quaternion.y).toBeCloseTo(bisectorComponent, 12);
    expect(gearLPivot.quaternion.z).toBeCloseTo(bisectorComponent, 12);
    expect(gearLPivot.quaternion.w).toBeCloseTo(halfAngleCos, 12);

    expect(gearRPivot.quaternion.x).toBeCloseTo(0, 12);
    expect(gearRPivot.quaternion.y).toBeCloseTo(-bisectorComponent, 12);
    expect(gearRPivot.quaternion.z).toBeCloseTo(-bisectorComponent, 12);
    expect(gearRPivot.quaternion.w).toBeCloseTo(halfAngleCos, 12);

    expect(connectionLPivot.quaternion.x).toBeCloseTo(0, 12);
    expect(connectionLPivot.quaternion.y).toBeCloseTo(bisectorComponent, 12);
    expect(connectionLPivot.quaternion.z).toBeCloseTo(bisectorComponent, 12);
    expect(connectionLPivot.quaternion.w).toBeCloseTo(halfAngleCos, 12);

    expect(connectionRPivot.quaternion.x).toBeCloseTo(0, 12);
    expect(connectionRPivot.quaternion.y).toBeCloseTo(-bisectorComponent, 12);
    expect(connectionRPivot.quaternion.z).toBeCloseTo(-bisectorComponent, 12);
    expect(connectionRPivot.quaternion.w).toBeCloseTo(halfAngleCos, 12);

    // Inward finger motion: opposite sign from same-side gear and scaled down by coupling ratio.
    expect(gripperLPivot.quaternion.x).toBeCloseTo(0, 12);
    expect(gripperLPivot.quaternion.y).toBeCloseTo(-gripperBisectorComponent, 12);
    expect(gripperLPivot.quaternion.z).toBeCloseTo(-gripperBisectorComponent, 12);
    expect(gripperLPivot.quaternion.w).toBeCloseTo(gripperHalfAngleCos, 12);

    expect(gripperRPivot.quaternion.x).toBeCloseTo(0, 12);
    expect(gripperRPivot.quaternion.y).toBeCloseTo(gripperBisectorComponent, 12);
    expect(gripperRPivot.quaternion.z).toBeCloseTo(gripperBisectorComponent, 12);
    expect(gripperRPivot.quaternion.w).toBeCloseTo(gripperHalfAngleCos, 12);

    expect(gearL.rotation.y).toBe(0);
    expect(gearR.rotation.y).toBe(0);
    expect(connectionL.rotation.y).toBe(0);
    expect(connectionR.rotation.y).toBe(0);
    expect(gripperL.rotation.y).toBe(0);
    expect(gripperR.rotation.y).toBe(0);
  });
});
