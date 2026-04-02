using RoboticV4.Contracts;

namespace RoboticV4.Api.Services;

public interface IFirmwareIngressService
{
    bool TryParseAndValidate(
        FirmwareSerializedPacket packet,
        out Esp32HardwareInput? esp32Input,
        out Dictionary<string, string[]> errors);
}
