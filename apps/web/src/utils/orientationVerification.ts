import type { Object3D } from 'three';

const EPSILON = 1e-6;

function approxEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON;
}

function isIdentityScale(node: Object3D): boolean {
  return (
    approxEqual(node.scale.x, 1) && approxEqual(node.scale.y, 1) && approxEqual(node.scale.z, 1)
  );
}

function isIdentityQuaternion(node: Object3D): boolean {
  return (
    approxEqual(node.quaternion.x, 0) &&
    approxEqual(node.quaternion.y, 0) &&
    approxEqual(node.quaternion.z, 0) &&
    approxEqual(node.quaternion.w, 1)
  );
}

export type OrientationVerificationReport = {
  isYUp: boolean;
  hasCleanRootTransform: boolean;
  issues: string[];
};

export function verifyYUpAndExportTransform(root: Object3D): OrientationVerificationReport {
  const issues: string[] = [];

  const isYUp =
    approxEqual(root.up.x, 0) && approxEqual(root.up.y, 1) && approxEqual(root.up.z, 0);
  if (!isYUp) {
    issues.push('Scene up axis is not Y-up (expected [0, 1, 0]).');
  }

  const hasIdentityRootScale = isIdentityScale(root);
  const hasIdentityRootRotation = isIdentityQuaternion(root);
  const hasIdentityRootPosition =
    approxEqual(root.position.x, 0) &&
    approxEqual(root.position.y, 0) &&
    approxEqual(root.position.z, 0);

  if (!hasIdentityRootScale) {
    issues.push('Root scale is not identity [1, 1, 1].');
  }

  if (!hasIdentityRootRotation) {
    issues.push('Root rotation is not identity quaternion [0, 0, 0, 1].');
  }

  if (!hasIdentityRootPosition) {
    issues.push('Root position is not zero [0, 0, 0].');
  }

  return {
    isYUp,
    hasCleanRootTransform: hasIdentityRootScale && hasIdentityRootRotation && hasIdentityRootPosition,
    issues,
  };
}
