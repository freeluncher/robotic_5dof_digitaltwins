import type { JointPivotMappingOutput } from './joint-pivot-mapping-output';
import type { RawHardwareData } from './raw-hardware-data';

export const SignalREventName = {
  TelemetryJointState: 'telemetry.joint-state.updated',
  TelemetryJointAngleUpdate: 'telemetry.joint-angle.updated',
  TelemetryConnectionState: 'telemetry.connection.state',
  ControlSetJointTargets: 'control.set-joint-targets',
  ControlSetGripper: 'control.set-gripper',
} as const;

export type SignalREventName =
  (typeof SignalREventName)[keyof typeof SignalREventName];

export interface SignalREventEnvelope<TPayload> {
  eventName: SignalREventName;
  messageId: string;
  timestampUtc: string;
  source: 'hardware' | 'api' | 'web';
  payload: TPayload;
}

export interface TelemetryJointStatePayload {
  hardware: RawHardwareData;
  mapped: JointPivotMappingOutput;
}

export interface TelemetryJointAngleUpdatePayload {
  mapped: JointPivotMappingOutput;
}

export interface TelemetryConnectionStatePayload {
  isConnected: boolean;
  transport: 'serial' | 'wifi' | 'simulator';
  reason?: string;
}

export interface ControlSetJointTargetsPayload {
  hardwareTargets: RawHardwareData;
}

export interface ControlSetGripperPayload {
  openRatio: number;
}
