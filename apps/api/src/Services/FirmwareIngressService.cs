using System.Text;
using System.Text.Json;
using RoboticV4.Api.Validation;
using RoboticV4.Contracts;

namespace RoboticV4.Api.Services;

public sealed class FirmwareIngressService : IFirmwareIngressService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IHardwareDataValidator _hardwareDataValidator;

    public FirmwareIngressService(IHardwareDataValidator hardwareDataValidator)
    {
        _hardwareDataValidator = hardwareDataValidator;
    }

    public bool TryParseAndValidate(
        FirmwareSerializedPacket packet,
        out Esp32HardwareInput? esp32Input,
        out Dictionary<string, string[]> errors)
    {
        errors = new Dictionary<string, string[]>();
        esp32Input = null;

        ValidatePacketMetadata(packet, errors);

        if (errors.Count > 0)
        {
            return false;
        }

        try
        {
            esp32Input = JsonSerializer.Deserialize<Esp32HardwareInput>(packet.Frame, JsonOptions);
        }
        catch (JsonException)
        {
            errors["frame"] = ["must be a valid JSON object matching Esp32HardwareInput"];
            return false;
        }

        if (esp32Input is null)
        {
            errors["frame"] = ["must deserialize to Esp32HardwareInput"];
            return false;
        }

        if (esp32Input.Transport != packet.Transport)
        {
            errors["transport"] = ["frame transport must match packet transport"];
        }

        if (!string.IsNullOrWhiteSpace(packet.ChecksumCrc16) &&
            !string.IsNullOrWhiteSpace(esp32Input.ChecksumCrc16) &&
            !string.Equals(packet.ChecksumCrc16, esp32Input.ChecksumCrc16, StringComparison.OrdinalIgnoreCase))
        {
            errors["checksumCrc16"] = ["packet checksum does not match frame checksum"];
        }

        if (!_hardwareDataValidator.TryValidate(esp32Input.Payload, out var hardwareErrors))
        {
            foreach (var entry in hardwareErrors)
            {
                errors[$"payload.{entry.Key}"] = entry.Value;
            }
        }

        return errors.Count == 0;
    }

    private static void ValidatePacketMetadata(FirmwareSerializedPacket packet, Dictionary<string, string[]> errors)
    {
        if (packet.Protocol != "robotic-v4.telemetry.v1")
        {
            errors["protocol"] = ["must be robotic-v4.telemetry.v1"];
        }

        if (packet.ContentType != "application/json")
        {
            errors["contentType"] = ["must be application/json"];
        }

        if (packet.Encoding != "utf-8")
        {
            errors["encoding"] = ["must be utf-8"];
        }

        if (packet.Framing != "jsonl")
        {
            errors["framing"] = ["must be jsonl"];
        }

        if (packet.Delimiter != "\\n")
        {
            errors["delimiter"] = ["must be newline delimiter \\n"];
        }

        if (string.IsNullOrWhiteSpace(packet.Frame))
        {
            errors["frame"] = ["must not be empty"];
        }

        var expectedByteLength = Encoding.UTF8.GetByteCount(packet.Frame);
        if (packet.ByteLength != expectedByteLength)
        {
            errors["byteLength"] = [$"must match UTF-8 frame byte size ({expectedByteLength})"];
        }

        if (packet.Transport is not ("serial" or "wifi"))
        {
            errors["transport"] = ["must be serial or wifi"];
        }
    }
}
