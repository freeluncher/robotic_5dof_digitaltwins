using System.Net;
using System.Net.Http.Json;
using System.Threading.Channels;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using RoboticV4.Api.Controllers;
using RoboticV4.Api.Hubs;
using RoboticV4.Api.Services;
using RoboticV4.Contracts;
using Xunit;

namespace RoboticV4.Api.Tests;

public class HardwareSimulationControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HardwareSimulationControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Simulator_start_and_stop_endpoints_update_status()
    {
        using var client = _factory.CreateClient();

        await EnsureStopped(client);

        using var startResponse = await client.PostAsJsonAsync(
            "/api/hardware/simulator/start",
            new HardwareSimulationController.StartSimulationRequest(50));

        var startBody = await startResponse.Content.ReadFromJsonAsync<HardwareSimulationController.StartSimulationResponse>();

        Assert.Equal(HttpStatusCode.OK, startResponse.StatusCode);
        Assert.NotNull(startBody);
        Assert.True(startBody!.Status.IsRunning);
        Assert.True(startBody.Status.IntervalMs >= 16);

        using var statusResponse = await client.GetAsync("/api/hardware/simulator/status");
        var status = await statusResponse.Content.ReadFromJsonAsync<HardwareSimulationStatus>();

        Assert.Equal(HttpStatusCode.OK, statusResponse.StatusCode);
        Assert.NotNull(status);
        Assert.True(status!.IsRunning);

        using var stopResponse = await client.PostAsync("/api/hardware/simulator/stop", null);
        var stopBody = await stopResponse.Content.ReadFromJsonAsync<HardwareSimulationController.StopSimulationResponse>();

        Assert.Equal(HttpStatusCode.OK, stopResponse.StatusCode);
        Assert.NotNull(stopBody);
        Assert.False(stopBody!.Status.IsRunning);
    }

    [Fact]
    public async Task Simulator_mode_broadcasts_connection_and_joint_events_without_hardware()
    {
        using var client = _factory.CreateClient();
        await EnsureStopped(client);

        var connectionStateChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryConnectionStatePayload>>();
        var jointStateChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryJointStatePayload>>();

        await using var connection = CreateHubConnection();

        connection.On<SignalREventEnvelope<TelemetryConnectionStatePayload>>(nameof(IRobotTelemetryClient.TelemetryConnectionStateChanged), envelope =>
        {
            connectionStateChannel.Writer.TryWrite(envelope);
        });

        connection.On<SignalREventEnvelope<TelemetryJointStatePayload>>(nameof(IRobotTelemetryClient.TelemetryJointStateUpdated), envelope =>
        {
            jointStateChannel.Writer.TryWrite(envelope);
        });

        await connection.StartAsync();

        using var startResponse = await client.PostAsJsonAsync(
            "/api/hardware/simulator/start",
            new HardwareSimulationController.StartSimulationRequest(40));

        Assert.Equal(HttpStatusCode.OK, startResponse.StatusCode);

        var startedEnvelope = await ReadUntil(
            connectionStateChannel.Reader,
            envelope => envelope.Payload.Transport == "simulator" && envelope.Payload.Reason == "dev-simulator-started");

        var jointEnvelope = await ReadWithTimeout(jointStateChannel.Reader);

        Assert.True(startedEnvelope.Payload.IsConnected);
        Assert.Equal("simulator", startedEnvelope.Payload.Transport);
        Assert.InRange(jointEnvelope.Payload.Hardware.Waist, 0, 180);
        Assert.InRange(jointEnvelope.Payload.Hardware.Shoulder, 0, 180);
        Assert.InRange(jointEnvelope.Payload.Hardware.Elbow, 0, 180);

        using var stopResponse = await client.PostAsync("/api/hardware/simulator/stop", null);
        Assert.Equal(HttpStatusCode.OK, stopResponse.StatusCode);

        var stoppedEnvelope = await ReadUntil(
            connectionStateChannel.Reader,
            envelope => envelope.Payload.Transport == "simulator" && envelope.Payload.Reason == "dev-simulator-stopped");

        Assert.False(stoppedEnvelope.Payload.IsConnected);
    }

    [Fact]
    public async Task Simulator_mode_emits_disconnect_then_reconnect_connection_state_events()
    {
        using var client = _factory.CreateClient();
        await EnsureStopped(client);

        var connectionStateChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryConnectionStatePayload>>();

        await using var connection = CreateHubConnection();

        connection.On<SignalREventEnvelope<TelemetryConnectionStatePayload>>(nameof(IRobotTelemetryClient.TelemetryConnectionStateChanged), envelope =>
        {
            connectionStateChannel.Writer.TryWrite(envelope);
        });

        await connection.StartAsync();

        using var firstStartResponse = await client.PostAsJsonAsync(
            "/api/hardware/simulator/start",
            new HardwareSimulationController.StartSimulationRequest(30));

        Assert.Equal(HttpStatusCode.OK, firstStartResponse.StatusCode);

        var startedEnvelope = await ReadUntil(
            connectionStateChannel.Reader,
            envelope => envelope.Payload.Transport == "simulator" && envelope.Payload.Reason == "dev-simulator-started");

        using var stopResponse = await client.PostAsync("/api/hardware/simulator/stop", null);
        Assert.Equal(HttpStatusCode.OK, stopResponse.StatusCode);

        var stoppedEnvelope = await ReadUntil(
            connectionStateChannel.Reader,
            envelope => envelope.Payload.Transport == "simulator" && envelope.Payload.Reason == "dev-simulator-stopped");

        using var secondStartResponse = await client.PostAsJsonAsync(
            "/api/hardware/simulator/start",
            new HardwareSimulationController.StartSimulationRequest(30));

        Assert.Equal(HttpStatusCode.OK, secondStartResponse.StatusCode);

        var restartedEnvelope = await ReadUntil(
            connectionStateChannel.Reader,
            envelope => envelope.Payload.Transport == "simulator" && envelope.Payload.Reason == "dev-simulator-started" && envelope.TimestampUtc > stoppedEnvelope.TimestampUtc);

        Assert.True(startedEnvelope.Payload.IsConnected);
        Assert.False(stoppedEnvelope.Payload.IsConnected);
        Assert.True(restartedEnvelope.Payload.IsConnected);

        using var finalStopResponse = await client.PostAsync("/api/hardware/simulator/stop", null);
        Assert.Equal(HttpStatusCode.OK, finalStopResponse.StatusCode);
    }

    private static async Task EnsureStopped(HttpClient client)
    {
        await client.PostAsync("/api/hardware/simulator/stop", null);
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

    private static async Task<T> ReadUntil<T>(ChannelReader<T> reader, Func<T, bool> predicate)
    {
        var deadline = DateTimeOffset.UtcNow.AddSeconds(5);

        while (DateTimeOffset.UtcNow < deadline)
        {
            var item = await ReadWithTimeout(reader);
            if (predicate(item))
            {
                return item;
            }
        }

        throw new TimeoutException("Timed out waiting for expected SignalR event payload.");
    }
}
