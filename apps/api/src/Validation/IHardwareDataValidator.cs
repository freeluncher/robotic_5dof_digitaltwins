using RoboticV4.Contracts;

namespace RoboticV4.Api.Validation;

public interface IHardwareDataValidator
{
    bool TryValidate(RawHardwareData data, out Dictionary<string, string[]> errors);
}
