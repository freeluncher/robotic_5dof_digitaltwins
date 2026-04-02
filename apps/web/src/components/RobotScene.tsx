import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { Box3, Vector3 } from 'three';
import type { Group } from 'three';

import { ROBOTIC_V4_GLB_URL } from '../assets/modelAssets';
import { useRobotStore } from '../stores/robotStore';
import { mapHardwareToPivotDeltaFromNeutral } from '../utils/kinematics';
import { resolveModelScaleFromHeight } from '../utils/modelScaleNormalization';
import { verifyYUpAndExportTransform } from '../utils/orientationVerification';
import {
  applyJointMappingToSceneGraph,
  countDetectedMainPivots,
} from '../utils/sceneGraphMapping';

const ENABLE_DEBUG = import.meta.env.DEV;

type SceneDebugInfo = {
  yUp: 'ok' | 'warn';
  rootTransform: 'ok' | 'warn';
  pivotCount: number;
  modelScale: number;
  modelHeight: number;
  scaleReason: 'likely-mm-model' | 'already-meter-scale';
};

const tempBox = new Box3();
const tempSize = new Vector3();

function RobotModel() {
  const hardware = useRobotStore((state) => state.hardware);
  const mapped = useMemo(() => mapHardwareToPivotDeltaFromNeutral(hardware), [hardware]);
  const { scene } = useGLTF(ROBOTIC_V4_GLB_URL) as { scene: Group };

  const { runtimeScene, modelScale } = useMemo(() => {
    const clone = scene.clone(true);
    tempBox.setFromObject(clone);
    tempBox.getSize(tempSize);
    const scaleInfo = resolveModelScaleFromHeight(tempSize.y);

    // Initial apply keeps the model pose in sync for the first render.
    applyJointMappingToSceneGraph(clone, mapped);
    return {
      runtimeScene: clone,
      modelScale: scaleInfo.appliedScale,
    };
  }, [scene]);

  useEffect(() => {
    applyJointMappingToSceneGraph(runtimeScene, mapped);
  }, [runtimeScene, mapped]);

  return <primitive object={runtimeScene} scale={modelScale} />;
}

function SceneDebugOverlay({ info }: { info: SceneDebugInfo }) {
  return (
    <div className="scene-debug-overlay" aria-live="polite">
      <p>Debug Viewport</p>
      <ul>
        <li>Y-up: {info.yUp}</li>
        <li>Root transform: {info.rootTransform}</li>
        <li>Main pivots: {info.pivotCount}/5</li>
        <li>Model scale: {info.modelScale.toFixed(3)}</li>
        <li>Model height: {info.modelHeight.toFixed(3)}</li>
        <li>Scale mode: {info.scaleReason}</li>
      </ul>
    </div>
  );
}

useGLTF.preload(ROBOTIC_V4_GLB_URL);

export function RobotScene() {
  const { scene } = useGLTF(ROBOTIC_V4_GLB_URL) as { scene: Group };

  const debugInfo = useMemo<SceneDebugInfo>(() => {
    tempBox.setFromObject(scene);
    tempBox.getSize(tempSize);
    const scaleInfo = resolveModelScaleFromHeight(tempSize.y);

    const report = verifyYUpAndExportTransform(scene);
    const info: SceneDebugInfo = {
      yUp: report.isYUp ? 'ok' : 'warn',
      rootTransform: report.hasCleanRootTransform ? 'ok' : 'warn',
      pivotCount: countDetectedMainPivots(scene),
      modelScale: scaleInfo.appliedScale,
      modelHeight: scaleInfo.normalizedHeight,
      scaleReason: scaleInfo.reason,
    };

    if (ENABLE_DEBUG && report.issues.length > 0) {
      console.warn('[RobotScene] Orientation/export transform verification issues:', report);
    }

    return info;
  }, [scene]);

  return (
    <div className="scene-canvas" role="img" aria-label="3D robot scene graph visualization">
      <Canvas camera={{ position: [2.6, 1.8, 3.2], fov: 45 }}>
        <color attach="background" args={['#f3f8ff']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 3]} intensity={0.9} />
        <gridHelper args={[2, 20, '#9fb3c8', '#d9e2ec']} position={[0, -0.001, 0]} />
        {ENABLE_DEBUG ? <axesHelper args={[80]} /> : null}
        <RobotModel />
        <OrbitControls enableDamping makeDefault />
      </Canvas>
      {ENABLE_DEBUG ? <SceneDebugOverlay info={debugInfo} /> : null}
    </div>
  );
}
