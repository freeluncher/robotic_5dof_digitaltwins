namespace RoboticV4.Contracts;

public sealed record FirmwareSerializedPacket(
    string Protocol,
    string ContentType,
    string Encoding,
    string Framing,
    string Delimiter,
    string Frame,
    string? ChecksumCrc16,
    int ByteLength,
    DateTimeOffset ReceivedAtUtc,
    string Transport
);
