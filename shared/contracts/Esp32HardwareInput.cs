namespace RoboticV4.Contracts;

public sealed record Esp32HardwareInput(
    string DeviceId,
    string FirmwareVersion,
    long Sequence,
    DateTimeOffset SentAtUtc,
    string Transport,
    RawHardwareData Payload,
    string? ChecksumCrc16
);
