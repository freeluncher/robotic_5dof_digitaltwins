using RoboticV4.Contracts;

namespace RoboticV4.Api.Services;

public interface IRobotTelemetryService
{
    SignalREventEnvelope<TelemetryJointStatePayload> CreateJointStateTelemetry(RawHardwareData hardware);
    SignalREventEnvelope<TelemetryJointAngleUpdatePayload> CreateJointAngleUpdateTelemetry(RawHardwareData hardware);
    SignalREventEnvelope<TelemetryConnectionStatePayload> CreateConnectionStateTelemetry(
        bool isConnected,
        string transport,
        string? reason,
        string source = "api");
}
