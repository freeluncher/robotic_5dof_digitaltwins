namespace RoboticV4.Contracts;

public sealed record RawHardwareData(
    double Waist,
    double Shoulder,
    double Elbow,
    double WristRoll,
    double Wrist
);
