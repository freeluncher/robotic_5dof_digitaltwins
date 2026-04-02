import { describe, expect, it } from 'vitest';

import { mappedFixtureRadians } from '../tests/fixtures/kinematicsFixtures';
import { roboticV4NodeNames } from '../tests/fixtures/glbNodeFixtures';
import {
  applyMappedRotationsToPivots,
  verifyMainPivots,
  type PivotNodeMap,
} from './pivotRuntime';

describe('pivot runtime verification and application', () => {
  it('memverifikasi node pivot utama tersedia sesuai hierarchy Blender', () => {
    const result = verifyMainPivots([...roboticV4NodeNames]);

    expect(result.ok).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('menerapkan rotasi ke pivot node, bukan mesh link', () => {
    const nodes: PivotNodeMap = {
      waist_pivot: { name: 'waist_pivot', rotation: { x: 0, y: 0, z: 0 } },
      shoulder_pivot: { name: 'shoulder_pivot', rotation: { x: 0, y: 0, z: 0 } },
      elbow_pivot: { name: 'elbow_pivot', rotation: { x: 0, y: 0, z: 0 } },
      wrist_roll_pivot: { name: 'wrist_roll_pivot', rotation: { x: 0, y: 0, z: 0 } },
      wrist_pivot: { name: 'wrist_pivot', rotation: { x: 0, y: 0, z: 0 } },
      link1: { name: 'link1', rotation: { x: 0, y: 0, z: 0 } },
    };

    applyMappedRotationsToPivots(nodes, mappedFixtureRadians);

    expect(nodes.waist_pivot.rotation.z).toBe(mappedFixtureRadians.waist_pivot);
    expect(nodes.shoulder_pivot.rotation.z).toBe(mappedFixtureRadians.shoulder_pivot);
    expect(nodes.elbow_pivot.rotation.z).toBe(mappedFixtureRadians.elbow_pivot);
    expect(nodes.wrist_roll_pivot.rotation.z).toBe(mappedFixtureRadians.wrist_roll_pivot);
    expect(nodes.wrist_pivot.rotation.z).toBe(mappedFixtureRadians.wrist_pivot);

    // Mesh link is intentionally untouched to enforce pivot-only rotation updates.
    expect(nodes.link1.rotation.z).toBe(0);
  });
});
