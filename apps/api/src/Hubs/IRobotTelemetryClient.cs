using RoboticV4.Contracts;

namespace RoboticV4.Api.Hubs;

public interface IRobotTelemetryClient
{
    Task TelemetryJointStateUpdated(SignalREventEnvelope<TelemetryJointStatePayload> envelope);
    Task TelemetryConnectionStateChanged(SignalREventEnvelope<TelemetryConnectionStatePayload> envelope);
    Task ControlSetJointTargets(ControlSetJointTargetsPayload payload);
    Task ControlSetGripper(ControlSetGripperPayload payload);
}
