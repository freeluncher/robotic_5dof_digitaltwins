namespace RoboticV4.Contracts;

public static class SignalREventName
{
    public const string TelemetryJointState = "telemetry.joint-state.updated";
    public const string TelemetryConnectionState = "telemetry.connection.state";
    public const string ControlSetJointTargets = "control.set-joint-targets";
    public const string ControlSetGripper = "control.set-gripper";
}

public sealed record SignalREventEnvelope<TPayload>(
    string EventName,
    string MessageId,
    DateTimeOffset TimestampUtc,
    string Source,
    TPayload Payload
);

public sealed record TelemetryJointStatePayload(
    RawHardwareData Hardware,
    JointPivotMappingOutput Mapped
);

public sealed record TelemetryConnectionStatePayload(
    bool IsConnected,
    string Transport,
    string? Reason
);

public sealed record ControlSetJointTargetsPayload(
    RawHardwareData HardwareTargets
);

public sealed record ControlSetGripperPayload(
    double OpenRatio
);
