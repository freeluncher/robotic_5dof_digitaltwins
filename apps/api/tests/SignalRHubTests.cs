using System.Net;
using System.Threading.Channels;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.Mvc.Testing;
using RoboticV4.Api.Hubs;
using RoboticV4.Contracts;
using Xunit;

namespace RoboticV4.Api.Tests;

public class SignalRHubTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SignalRHubTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Telemetry_hub_negotiate_endpoint_is_available()
    {
        using var client = _factory.CreateClient();

        using var response = await client.PostAsync("/hubs/telemetry/negotiate?negotiateVersion=1", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Telemetry_hub_contract_broadcasts_connection_state_and_command_events()
    {
        var connectionStateChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryConnectionStatePayload>>();

        await using var senderConnection = CreateHubConnection();

        senderConnection.On<SignalREventEnvelope<TelemetryConnectionStatePayload>>(nameof(IRobotTelemetryClient.TelemetryConnectionStateChanged), envelope =>
        {
            connectionStateChannel.Writer.TryWrite(envelope);
        });

        await senderConnection.StartAsync();

        var connectedEnvelope = await connectionStateChannel.Reader.ReadAsync();

        Assert.Equal(SignalREventName.TelemetryConnectionState, connectedEnvelope.EventName);
        Assert.True(connectedEnvelope.Payload.IsConnected);
        Assert.Equal("signalr", connectedEnvelope.Payload.Transport);

        var jointTargetsChannel = Channel.CreateUnbounded<ControlSetJointTargetsPayload>();

        await using var receiverConnection = CreateHubConnection();

        receiverConnection.On<ControlSetJointTargetsPayload>(nameof(IRobotTelemetryClient.ControlSetJointTargets), payload =>
        {
            jointTargetsChannel.Writer.TryWrite(payload);
        });

        await receiverConnection.StartAsync();

        await senderConnection.InvokeAsync(
            nameof(RobotTelemetryHub.PublishJointTargets),
            new ControlSetJointTargetsPayload(new RawHardwareData(90, 45, 110, 80, 70)));

        var forwardedTargets = await jointTargetsChannel.Reader.ReadAsync();

        Assert.Equal(90, forwardedTargets.HardwareTargets.Waist);
        Assert.Equal(110, forwardedTargets.HardwareTargets.Elbow);
    }

    [Fact]
    public async Task Telemetry_hub_submit_control_command_relays_gripper_payload_to_other_clients()
    {
        var gripperChannel = Channel.CreateUnbounded<ControlSetGripperPayload>();

        await using var senderConnection = CreateHubConnection();
        await using var receiverConnection = CreateHubConnection();

        receiverConnection.On<ControlSetGripperPayload>(nameof(IRobotTelemetryClient.ControlSetGripper), payload =>
        {
            gripperChannel.Writer.TryWrite(payload);
        });

        await senderConnection.StartAsync();
        await receiverConnection.StartAsync();

        var envelope = new SignalREventEnvelope<ControlCommandRequestedPayload>(
            EventName: SignalREventName.ControlCommandRequested,
            MessageId: $"cmd-{Guid.NewGuid():N}",
            TimestampUtc: DateTimeOffset.UtcNow,
            Source: "web",
            Payload: new ControlCommandRequestedPayload(
                CommandName: SignalREventName.ControlSetGripper,
                HardwareTargets: null,
                OpenRatio: 0.65));

        await senderConnection.InvokeAsync(nameof(RobotTelemetryHub.SubmitControlCommand), envelope);

        var forwardedGripper = await ReadWithTimeout(gripperChannel.Reader);

        Assert.Equal(0.65, forwardedGripper.OpenRatio, 12);
    }

    private static async Task<T> ReadWithTimeout<T>(ChannelReader<T> reader)
    {
        var readTask = reader.ReadAsync().AsTask();
        var timeoutTask = Task.Delay(5000);
        var completedTask = await Task.WhenAny(readTask, timeoutTask);

        if (completedTask == timeoutTask)
        {
            throw new TimeoutException("Timed out waiting for SignalR event payload.");
        }

        return await readTask;
    }

    private HubConnection CreateHubConnection()
    {
        return new HubConnectionBuilder()
            .WithUrl(
                new Uri(_factory.Server.BaseAddress, "/hubs/telemetry"),
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
                })
            .WithAutomaticReconnect()
            .Build();
    }
}
