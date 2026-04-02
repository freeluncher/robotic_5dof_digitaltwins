namespace RoboticV4.Contracts;

public sealed record JointPivotMappingOutput(
    double WaistPivot,
    double ShoulderPivot,
    double ElbowPivot,
    double WristRollPivot,
    double WristPivot
);
