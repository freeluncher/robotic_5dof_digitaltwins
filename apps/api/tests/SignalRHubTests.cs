using System.Net;
using System.Threading.Channels;
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
