using RoboticV4.Contracts;

namespace RoboticV4.Api.Validation;

public sealed class HardwareDataValidator : IHardwareDataValidator
{
    private const double Min = 0;
    private const double Max = 180;

    public bool TryValidate(RawHardwareData data, out Dictionary<string, string[]> errors)
    {
        errors = new Dictionary<string, string[]>();

        ValidateJoint("waist", data.Waist, errors);
        ValidateJoint("shoulder", data.Shoulder, errors);
        ValidateJoint("elbow", data.Elbow, errors);
        ValidateJoint("wristRoll", data.WristRoll, errors);
        ValidateJoint("wrist", data.Wrist, errors);

        return errors.Count == 0;
    }

    private static void ValidateJoint(string field, double value, Dictionary<string, string[]> errors)
    {
        if (double.IsNaN(value) || double.IsInfinity(value))
        {
            errors[field] = ["must be a finite number"];
            return;
        }

        if (value < Min || value > Max)
        {
            errors[field] = [$"must be in range {Min}..{Max}"];
        }
    }
}
