import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import dtoSchema from '../../../../shared/contracts/dto.schema.json';
import esp32HardwareInputSchema from '../../../../shared/contracts/esp32-hardware-input.schema.json';
import firmwareSerializedPacketSchema from '../../../../shared/contracts/firmware-serialized-packet.schema.json';
import jointPivotMappingOutputSchema from '../../../../shared/contracts/joint-pivot-mapping-output.schema.json';
import rawHardwareDataSchema from '../../../../shared/contracts/raw-hardware-data.schema.json';
import signalrEventsSchema from '../../../../shared/contracts/signalr-events.schema.json';

function createAjv() {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);

  ajv.addSchema(rawHardwareDataSchema, rawHardwareDataSchema.$id);
  ajv.addSchema(esp32HardwareInputSchema, esp32HardwareInputSchema.$id);
  ajv.addSchema(firmwareSerializedPacketSchema, firmwareSerializedPacketSchema.$id);
  ajv.addSchema(jointPivotMappingOutputSchema, jointPivotMappingOutputSchema.$id);
  ajv.addSchema(signalrEventsSchema, signalrEventsSchema.$id);

  return ajv;
}

describe('shared schema contracts', () => {
  it('memvalidasi raw hardware data sesuai schema', () => {
    const ajv = createAjv();
    const validate = ajv.compile(rawHardwareDataSchema);

    const validPayload = {
      waist: 90,
      shoulder: 45,
      elbow: 110,
      wristRoll: 80,
      wrist: 70,
    };

    const invalidPayload = {
      waist: 190,
      shoulder: 45,
      elbow: 110,
      wristRoll: 80,
    };

    expect(validate(validPayload)).toBe(true);
    expect(validate(invalidPayload)).toBe(false);
  });

  it('memvalidasi signalr envelope sesuai schema event shared', () => {
    const ajv = createAjv();
    const validate = ajv.compile(signalrEventsSchema);

    const validEnvelope = {
      eventName: 'control.command.requested',
      messageId: 'msg-cmd-1',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'web',
      payload: {
        commandName: 'control.set-gripper',
        openRatio: 0.7,
      },
    };

    const invalidEnvelope = {
      eventName: 'control.command.requested',
      messageId: 'msg-cmd-2',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'web',
      payload: {
        commandName: 'control.set-gripper',
        openRatio: 1.5,
      },
    };

    expect(validate(validEnvelope)).toBe(true);
    expect(validate(invalidEnvelope)).toBe(false);
  });

  it('memvalidasi input envelope ESP32 sesuai schema shared', () => {
    const ajv = createAjv();
    const validate = ajv.compile(esp32HardwareInputSchema);

    const validEsp32Input = {
      deviceId: 'esp32-arm-01',
      firmwareVersion: '1.2.0',
      sequence: 128,
      sentAtUtc: '2026-04-02T08:00:00Z',
      transport: 'serial',
      payload: {
        waist: 90,
        shoulder: 45,
        elbow: 110,
        wristRoll: 80,
        wrist: 70,
      },
      checksumCrc16: 'A1F0',
    };

    const invalidEsp32Input = {
      deviceId: 'esp32 arm 01',
      firmwareVersion: '1.2.0',
      sequence: -1,
      sentAtUtc: 'not-a-date',
      transport: 'bluetooth',
      payload: {
        waist: 190,
        shoulder: 45,
        elbow: 110,
        wristRoll: 80,
        wrist: 70,
      },
      checksumCrc16: 'XYZ',
    };

    expect(validate(validEsp32Input)).toBe(true);
    expect(validate(invalidEsp32Input)).toBe(false);
  });

  it('memvalidasi format serialisasi firmware ke backend sesuai schema shared', () => {
    const ajv = createAjv();
    const validate = ajv.compile(firmwareSerializedPacketSchema);

    const validSerializedPacket = {
      protocol: 'robotic-v4.telemetry.v1',
      contentType: 'application/json',
      encoding: 'utf-8',
      framing: 'jsonl',
      delimiter: '\\n',
      frame: '{"deviceId":"esp32-arm-01","sequence":128}',
      checksumCrc16: 'A1F0',
      byteLength: 41,
      receivedAtUtc: '2026-04-02T08:00:01Z',
      transport: 'serial',
    };

    const invalidSerializedPacket = {
      protocol: 'robotic-v4.telemetry.v2',
      contentType: 'text/plain',
      encoding: 'ascii',
      framing: 'raw',
      delimiter: ';',
      frame: '',
      checksumCrc16: 'XYZ',
      byteLength: -1,
      receivedAtUtc: 'invalid-date',
      transport: 'bluetooth',
    };

    expect(validate(validSerializedPacket)).toBe(true);
    expect(validate(invalidSerializedPacket)).toBe(false);
  });

  it('memvalidasi dto schema bundle terhadap payload shared', () => {
    const ajv = createAjv();
    const validate = ajv.compile(dtoSchema);

    const rawPayload = {
      waist: 90,
      shoulder: 45,
      elbow: 110,
      wristRoll: 80,
      wrist: 70,
    };

    const signalrPayload = {
      eventName: 'telemetry.joint-angle.updated',
      messageId: 'msg-angle-1',
      timestampUtc: '2026-04-02T07:30:00Z',
      source: 'api',
      payload: {
        mapped: {
          waist_pivot: 1.5708,
          shoulder_pivot: 0.7854,
          elbow_pivot: 1.9199,
          wrist_roll_pivot: 0.3491,
          wrist_pivot: 0.2618,
        },
      },
    };

    const esp32Payload = {
      deviceId: 'esp32-arm-01',
      firmwareVersion: '1.2.0',
      sequence: 128,
      sentAtUtc: '2026-04-02T08:00:00Z',
      transport: 'serial',
      payload: {
        waist: 90,
        shoulder: 45,
        elbow: 110,
        wristRoll: 80,
        wrist: 70,
      },
    };

    const firmwarePacketPayload = {
      protocol: 'robotic-v4.telemetry.v1',
      contentType: 'application/json',
      encoding: 'utf-8',
      framing: 'jsonl',
      delimiter: '\\n',
      frame: '{"deviceId":"esp32-arm-01","sequence":128}',
      byteLength: 41,
      receivedAtUtc: '2026-04-02T08:00:01Z',
      transport: 'serial',
    };

    expect(validate(rawPayload)).toBe(true);
    expect(validate(signalrPayload)).toBe(true);
    expect(validate(esp32Payload)).toBe(true);
    expect(validate(firmwarePacketPayload)).toBe(true);
  });
});
