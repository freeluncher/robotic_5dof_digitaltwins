import { describe, expect, it } from 'vitest';

import {
  clampGripperAngle,
  clampHardwareAngle,
  neutralGripperAngle,
  neutralHardwareAngles,
  withJointAngle,
} from './jointControlPanel.helpers';

describe('joint control panel helpers', () => {
  it('clamps hardware angles to 0..180', () => {
    expect(clampHardwareAngle(-25)).toBe(0);
    expect(clampHardwareAngle(90)).toBe(90);
    expect(clampHardwareAngle(250)).toBe(180);
  });

  it('updates only the selected joint field', () => {
    const initial = neutralHardwareAngles();
    const next = withJointAngle(initial, 'elbow', 120);

    expect(next.elbow).toBe(120);
    expect(next.waist).toBe(90);
    expect(next.wrist).toBe(90);
  });

  it('returns neutral angles at 90 degrees for all joints', () => {
    expect(neutralHardwareAngles()).toEqual({
      waist: 90,
      shoulder: 90,
      elbow: 90,
      wristRoll: 90,
      wrist: 90,
    });
  });

  it('clamps gripper angle to 90..180', () => {
    expect(clampGripperAngle(-30)).toBe(90);
    expect(clampGripperAngle(30)).toBe(90);
    expect(clampGripperAngle(90)).toBe(90);
    expect(clampGripperAngle(220)).toBe(180);
  });

  it('returns neutral gripper angle at 90 degrees', () => {
    expect(neutralGripperAngle()).toBe(90);
  });
});
