using RoboticV4.Contracts;

namespace RoboticV4.Api.Services;

public interface IRobotTelemetryService
{
    SignalREventEnvelope<TelemetryJointStatePayload> CreateJointStateTelemetry(RawHardwareData hardware);
}
