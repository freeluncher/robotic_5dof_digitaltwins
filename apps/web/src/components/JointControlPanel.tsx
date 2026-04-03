import { useMemo } from 'react';

import { useRobotStore } from '../stores/robotStore';
import { useUiStore } from '../stores/uiStore';
import {
  clampGripperAngle,
  neutralGripperAngle,
  neutralHardwareAngles,
  withJointAngle,
  type JointField,
} from './jointControlPanel.helpers';
import {
  getControlModeDescription,
  getControlModeLabel,
  getControlModeTone,
  isLiveMode,
} from './controlMode.helpers';

type JointControlConfig = {
  field: JointField;
  label: string;
};

const JOINT_CONTROLS: JointControlConfig[] = [
  { field: 'waist', label: 'Waist (J1)' },
  { field: 'shoulder', label: 'Shoulder (J2)' },
  { field: 'elbow', label: 'Elbow (J3)' },
  { field: 'wristRoll', label: 'Wrist Roll (J4)' },
  { field: 'wrist', label: 'Wrist Pitch (J5)' },
];

const JOINT_MAX_BY_FIELD: Partial<Record<JointField, number>> = {
  shoulder: 167,
};

export function JointControlPanel() {
  const controlMode = useUiStore((state) => state.controlMode);
  const setControlMode = useUiStore((state) => state.setControlMode);
  const hardware = useRobotStore((state) => state.hardware);
  const gripper = useRobotStore((state) => state.gripper);
  const setHardware = useRobotStore((state) => state.setHardware);
  const setGripper = useRobotStore((state) => state.setGripper);

  const isManualMode = !isLiveMode(controlMode);
  const modeLabel = useMemo(() => getControlModeLabel(controlMode), [controlMode]);
  const modeDescription = useMemo(() => getControlModeDescription(controlMode), [controlMode]);
  const modeTone = useMemo(() => getControlModeTone(controlMode), [controlMode]);

  return (
    <section className="joint-panel" aria-label="Joint control panel">
      <div className="joint-panel-header">
        <h2>Joint Control Panel</h2>
        <div className="control-mode-switch" role="group" aria-label="Control mode">
          <button
            type="button"
            className={isManualMode ? 'mode-button is-active' : 'mode-button'}
            onClick={() => setControlMode('manual')}
          >
            Manual
          </button>
          <button
            type="button"
            className={!isManualMode ? 'mode-button is-active' : 'mode-button'}
            onClick={() => setControlMode('live')}
          >
            Live
          </button>
        </div>
      </div>

      <div className={`control-mode-summary control-mode-summary-${modeTone}`}>
        <span className="control-mode-summary-label">Mode aktif</span>
        <strong>{modeLabel}</strong>
        <p>{modeDescription}</p>
      </div>

      <p className="joint-panel-hint">
        {isManualMode
          ? 'Manual mode is active: the slider directly controls the hardware joint states.'
          : 'Live mode is active: the panel is locked so that realtime data is not overwritten by manual control.'}
      </p>

      <div className="joint-controls-grid">
        {JOINT_CONTROLS.map((joint) => {
          const value = hardware[joint.field];

          return (
            <label key={joint.field} className="joint-control-row">
              <span className="joint-label">{joint.label}</span>
              <input
                type="range"
                min={0}
                max={JOINT_MAX_BY_FIELD[joint.field] ?? 180}
                step={1}
                value={value}
                disabled={!isManualMode}
                onChange={(event) => {
                  const nextValue = Number(event.currentTarget.value);
                  setHardware(withJointAngle(hardware, joint.field, nextValue));
                }}
              />
              <output className="joint-value">{Math.round(value)} deg</output>
            </label>
          );
        })}

        <label className="joint-control-row">
          <span className="joint-label">Gripper (Gear L/R)</span>
          <input
            type="range"
            min={90}
            max={180}
            step={1}
            value={gripper}
            disabled={!isManualMode}
            onChange={(event) => {
              const nextValue = Number(event.currentTarget.value);
              setGripper(clampGripperAngle(nextValue));
            }}
          />
          <output className="joint-value">{Math.round(gripper)} deg</output>
        </label>
      </div>

      <div className="joint-panel-actions">
        <button
          type="button"
          className="reset-button"
          disabled={!isManualMode}
          onClick={() => {
            setHardware(neutralHardwareAngles());
            setGripper(neutralGripperAngle());
          }}
        >
          Reset Position (90 deg)
        </button>
      </div>
    </section>
  );
}
