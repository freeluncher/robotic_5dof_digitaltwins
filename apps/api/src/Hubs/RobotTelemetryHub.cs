using Microsoft.AspNetCore.SignalR;
using RoboticV4.Contracts;

namespace RoboticV4.Api.Hubs;

public sealed class RobotTelemetryHub : Hub
{
    public async Task PublishJointTargets(ControlSetJointTargetsPayload payload)
    {
        await Clients.Others.SendAsync(SignalREventName.ControlSetJointTargets, payload);
    }

    public async Task PublishGripper(ControlSetGripperPayload payload)
    {
        await Clients.Others.SendAsync(SignalREventName.ControlSetGripper, payload);
    }
}
