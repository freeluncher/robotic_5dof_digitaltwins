import { Group, Object3D } from 'three';
import { describe, expect, it } from 'vitest';

import { mappedFixtureRadians } from '../tests/fixtures/kinematicsFixtures';
import {
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
    expect(root.getObjectByName('shoulder_pivot')?.rotation.z).toBe(
      mappedFixtureRadians.shoulder_pivot,
    );
    expect(root.getObjectByName('elbow_pivot')?.rotation.z).toBe(mappedFixtureRadians.elbow_pivot);
    expect(root.getObjectByName('wrist_roll_pivot')?.rotation.y).toBe(
      mappedFixtureRadians.wrist_roll_pivot,
    );
    expect(root.getObjectByName('wrist_roll_pivot')?.rotation.z).toBe(0);
    expect(root.getObjectByName('wrist_pivot')?.rotation.z).toBe(mappedFixtureRadians.wrist_pivot);
    expect(link1.rotation.z).toBe(0);
  });
});
