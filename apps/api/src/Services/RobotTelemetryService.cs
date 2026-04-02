using RoboticV4.Contracts;

namespace RoboticV4.Api.Services;

public sealed class RobotTelemetryService : IRobotTelemetryService
{
    public SignalREventEnvelope<TelemetryJointStatePayload> CreateJointStateTelemetry(RawHardwareData hardware)
    {
        var mapped = MapToRadians(hardware);

        return new SignalREventEnvelope<TelemetryJointStatePayload>(
            EventName: SignalREventName.TelemetryJointState,
            MessageId: $"evt-{Guid.NewGuid():N}",
            TimestampUtc: DateTimeOffset.UtcNow,
            Source: "api",
            Payload: new TelemetryJointStatePayload(hardware, mapped));
    }

    public SignalREventEnvelope<TelemetryJointAngleUpdatePayload> CreateJointAngleUpdateTelemetry(RawHardwareData hardware)
    {
        var mapped = MapToRadians(hardware);

        return new SignalREventEnvelope<TelemetryJointAngleUpdatePayload>(
            EventName: SignalREventName.TelemetryJointAngleUpdate,
            MessageId: $"evt-angle-{Guid.NewGuid():N}",
            TimestampUtc: DateTimeOffset.UtcNow,
            Source: "api",
            Payload: new TelemetryJointAngleUpdatePayload(mapped));
    }

    private static JointPivotMappingOutput MapToRadians(RawHardwareData hardware)
    {
        return new JointPivotMappingOutput(
            WaistPivot: ToRadians(hardware.Waist),
            ShoulderPivot: ToRadians(hardware.Shoulder),
            ElbowPivot: ToRadians(hardware.Elbow),
            WristRollPivot: ToRadians(hardware.WristRoll),
            WristPivot: ToRadians(hardware.Wrist));
    }

    private static double ToRadians(double degrees) => (degrees * Math.PI) / 180d;
}
