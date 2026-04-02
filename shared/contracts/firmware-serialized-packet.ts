export interface FirmwareSerializedPacket {
  /**
   * Protocol identifier for firmware to backend telemetry stream.
   */
  protocol: 'robotic-v4.telemetry.v1';

  /**
   * MIME content type of serialized frame.
   */
  contentType: 'application/json';

  /**
   * Character encoding used to serialize frame payload.
   */
  encoding: 'utf-8';

  /**
   * Framing strategy sent by firmware.
   */
  framing: 'jsonl';

  /**
   * Delimiter token for each frame in transport stream.
   */
  delimiter: '\\n';

  /**
   * Serialized JSON frame produced by firmware.
   */
  frame: string;

  /**
   * Optional frame integrity checksum in CRC16 hex format.
   */
  checksumCrc16?: string;

  /**
   * Number of bytes in serialized frame.
   */
  byteLength: number;

  /**
   * Ingestion timestamp at backend gateway in UTC.
   */
  receivedAtUtc: string;

  /**
   * Physical transport used by firmware stream.
   */
  transport: 'serial' | 'wifi';
}
