import { describe, expect, it } from 'vitest';

import dtoCatalog from '../../../../shared/contracts/dto-catalog.json';
import dtoSchema from '../../../../shared/contracts/dto.schema.json';
import type { JointPivotMappingOutput } from '../../../../shared/contracts/joint-pivot-mapping-output';
import type { RawHardwareData } from '../../../../shared/contracts/raw-hardware-data';
import {
  SignalREventName,
  type ControlCommandRequestedPayload,
  type TelemetryConnectionStatePayload,
  type TelemetryJointAngleUpdatePayload,
  type SignalREventEnvelope,
  type TelemetryJointStatePayload,
} from '../../../../shared/contracts/signalr-events';

describe('shared contract compatibility (frontend)', () => {
  it('memastikan shape RawHardwareData tetap kompatibel untuk mapper frontend', () => {
    const hardware: RawHardwareData = {
      waist: 90,
      shoulder: 45,
      elbow: 100,
      wristRoll: 80,
      wrist: 70,
    };

    expect(hardware.waist).toBeTypeOf('number');
    expect(hardware.wristRoll).toBeTypeOf('number');
  });

  it('memastikan shape JointPivotMappingOutput tetap kompatibel untuk animasi pivot', () => {
    const mapped: JointPivotMappingOutput = {
      waist_pivot: Math.PI / 2,
      shoulder_pivot: Math.PI / 4,
      elbow_pivot: Math.PI / 3,
      wrist_roll_pivot: Math.PI / 6,
      wrist_pivot: Math.PI / 8,
    };

    expect(mapped.waist_pivot).toBeGreaterThan(0);
    expect(mapped.wrist_pivot).toBeGreaterThan(0);
  });

  it('memastikan envelope event telemetry tetap stabil untuk konsumsi UI realtime', () => {
    const payload: TelemetryJointStatePayload = {
      hardware: {
        waist: 90,
        shoulder: 45,
        elbow: 100,
        wristRoll: 80,
        wrist: 70,
      },
      mapped: {
        waist_pivot: Math.PI / 2,
        shoulder_pivot: Math.PI / 4,
        elbow_pivot: Math.PI / 3,
        wrist_roll_pivot: Math.PI / 6,
        wrist_pivot: Math.PI / 8,
      },
    };

    const envelope: SignalREventEnvelope<TelemetryJointStatePayload> = {
      eventName: SignalREventName.TelemetryJointState,
      messageId: 'msg-1',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'api',
      payload,
    };

    expect(envelope.eventName).toBe('telemetry.joint-state.updated');
    expect(envelope.payload.mapped.elbow_pivot).toBeTypeOf('number');
  });

  it('memastikan event joint angle update terdefinisi untuk stream realtime sudut joint', () => {
    const payload: TelemetryJointAngleUpdatePayload = {
      mapped: {
        waist_pivot: Math.PI / 2,
        shoulder_pivot: Math.PI / 4,
        elbow_pivot: Math.PI / 3,
        wrist_roll_pivot: Math.PI / 6,
        wrist_pivot: Math.PI / 8,
      },
    };

    const envelope: SignalREventEnvelope<TelemetryJointAngleUpdatePayload> = {
      eventName: SignalREventName.TelemetryJointAngleUpdate,
      messageId: 'msg-angle-1',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'api',
      payload,
    };

    expect(envelope.eventName).toBe('telemetry.joint-angle.updated');
    expect(envelope.payload.mapped.wrist_pivot).toBeTypeOf('number');
  });

  it('memastikan event status koneksi hardware terdefinisi untuk sinkronisasi realtime', () => {
    const payload: TelemetryConnectionStatePayload = {
      isConnected: true,
      transport: 'signalr',
      reason: 'connected',
    };

    const envelope: SignalREventEnvelope<TelemetryConnectionStatePayload> = {
      eventName: SignalREventName.TelemetryConnectionState,
      messageId: 'msg-conn-1',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'hub',
      payload,
    };

    expect(envelope.eventName).toBe('telemetry.connection.state');
    expect(envelope.payload.isConnected).toBe(true);
    expect(envelope.payload.transport).toBe('signalr');
  });

  it('memastikan event command UI ke backend terdefinisi untuk alur kontrol realtime', () => {
    const payload: ControlCommandRequestedPayload = {
      commandName: SignalREventName.ControlSetJointTargets,
      hardwareTargets: {
        waist: 90,
        shoulder: 45,
        elbow: 100,
        wristRoll: 80,
        wrist: 70,
      },
    };

    const envelope: SignalREventEnvelope<ControlCommandRequestedPayload> = {
      eventName: SignalREventName.ControlCommandRequested,
      messageId: 'msg-cmd-1',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'web',
      payload,
    };

    expect(envelope.eventName).toBe('control.command.requested');
    expect(envelope.payload.commandName).toBe('control.set-joint-targets');
    expect(envelope.payload.hardwareTargets?.elbow).toBe(100);
  });

  it('memastikan metadata DTO untuk generator dokumentasi tersedia', () => {
    expect(Array.isArray(dtoCatalog.contracts)).toBe(true);
    expect(dtoCatalog.contracts.length).toBeGreaterThanOrEqual(3);
    expect(dtoSchema.oneOf.length).toBeGreaterThanOrEqual(3);
  });
});
