import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import type { Group } from 'three';

import { ROBOTIC_V4_GLB_URL } from '../assets/modelAssets';
import { useRobotStore } from '../stores/robotStore';
import { mapHardwareToPivot } from '../utils/kinematics';
import { verifyYUpAndExportTransform } from '../utils/orientationVerification';
import { applyJointMappingToSceneGraph } from '../utils/sceneGraphMapping';

function RobotModel() {
  const hardware = useRobotStore((state) => state.hardware);
  const mapped = useMemo(() => mapHardwareToPivot(hardware), [hardware]);
  const { scene } = useGLTF(ROBOTIC_V4_GLB_URL) as { scene: Group };

  const mappedScene = useMemo(() => {
    const clone = scene.clone(true);
    const orientationReport = verifyYUpAndExportTransform(clone);
    if (orientationReport.issues.length > 0) {
      console.warn('[RobotScene] Orientation/export transform verification issues:', orientationReport);
    }
    applyJointMappingToSceneGraph(clone, mapped);
    return clone;
  }, [scene, mapped]);

  return <primitive object={mappedScene} />;
}

useGLTF.preload(ROBOTIC_V4_GLB_URL);

export function RobotScene() {
  return (
    <div className="scene-canvas" role="img" aria-label="3D robot scene graph visualization">
      <Canvas camera={{ position: [2.6, 1.8, 3.2], fov: 45 }}>
        <color attach="background" args={['#f3f8ff']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 3]} intensity={0.9} />
        <gridHelper args={[8, 16, '#9fb3c8', '#d9e2ec']} position={[0, -0.001, 0]} />
        <RobotModel />
        <OrbitControls enableDamping makeDefault />
      </Canvas>
    </div>
  );
}
