using Microsoft.AspNetCore.SignalR;
using RoboticV4.Contracts;

namespace RoboticV4.Api.Hubs;

public sealed class RobotTelemetryHub : Hub<IRobotTelemetryClient>
{
    public override async Task OnConnectedAsync()
    {
        await Clients.All.TelemetryConnectionStateChanged(new SignalREventEnvelope<TelemetryConnectionStatePayload>(
            EventName: SignalREventName.TelemetryConnectionState,
            MessageId: $"conn-{Guid.NewGuid():N}",
            TimestampUtc: DateTimeOffset.UtcNow,
            Source: "hub",
            Payload: new TelemetryConnectionStatePayload(true, "signalr", "connected")));

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.All.TelemetryConnectionStateChanged(new SignalREventEnvelope<TelemetryConnectionStatePayload>(
            EventName: SignalREventName.TelemetryConnectionState,
            MessageId: $"disc-{Guid.NewGuid():N}",
            TimestampUtc: DateTimeOffset.UtcNow,
            Source: "hub",
            Payload: new TelemetryConnectionStatePayload(false, "signalr", "disconnected")));

        await base.OnDisconnectedAsync(exception);
    }

    public async Task PublishJointTargets(ControlSetJointTargetsPayload payload)
    {
        await Clients.Others.ControlSetJointTargets(payload);
    }

    public async Task PublishGripper(ControlSetGripperPayload payload)
    {
        await Clients.Others.ControlSetGripper(payload);
    }

    public async Task SubmitControlCommand(SignalREventEnvelope<ControlCommandRequestedPayload> envelope)
    {
        if (envelope.Payload.CommandName == SignalREventName.ControlSetJointTargets && envelope.Payload.HardwareTargets is not null)
        {
            await Clients.Others.ControlSetJointTargets(new ControlSetJointTargetsPayload(envelope.Payload.HardwareTargets));
            return;
        }

        if (envelope.Payload.CommandName == SignalREventName.ControlSetGripper && envelope.Payload.OpenRatio is not null)
        {
            await Clients.Others.ControlSetGripper(new ControlSetGripperPayload(envelope.Payload.OpenRatio.Value));
        }
    }
}
