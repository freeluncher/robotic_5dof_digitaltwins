using System.Net;
using System.Net.Http.Json;
using System.Threading.Channels;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using RoboticV4.Api.Hubs;
using RoboticV4.Contracts;
using Xunit;

namespace RoboticV4.Api.Tests;

public class HardwareConnectionControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HardwareConnectionControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Ingest_firmware_packet_returns_ok_for_valid_payload()
    {
        using var client = _factory.CreateClient();

        var payload = CreateValidFirmwarePacket();

        using var response = await client.PostAsJsonAsync("/api/hardware/ingest", payload);
        var envelope = await response.Content.ReadFromJsonAsync<SignalREventEnvelope<TelemetryJointStatePayload>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(envelope);
        Assert.Equal(SignalREventName.TelemetryJointState, envelope!.EventName);
        Assert.Equal(90, envelope.Payload.Hardware.Waist);
        Assert.Equal(Math.PI / 2d, envelope.Payload.Mapped.WaistPivot, 12);
        Assert.Equal(Math.PI / 4d, envelope.Payload.Mapped.ShoulderPivot, 12);
        Assert.Equal((110d * Math.PI) / 180d, envelope.Payload.Mapped.ElbowPivot, 12);
        Assert.Equal((80d * Math.PI) / 180d, envelope.Payload.Mapped.WristRollPivot, 12);
        Assert.Equal((70d * Math.PI) / 180d, envelope.Payload.Mapped.WristPivot, 12);
    }

    [Fact]
    public async Task Ingest_firmware_packet_returns_bad_request_for_invalid_metadata()
    {
        using var client = _factory.CreateClient();

        var payload = CreateValidFirmwarePacket() with
        {
            Protocol = "robotic-v4.telemetry.v2",
        };

        using var response = await client.PostAsJsonAsync("/api/hardware/ingest", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ingest_firmware_packet_broadcasts_connection_and_joint_state_events()
    {
        using var client = _factory.CreateClient();

        var connectionStateChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryConnectionStatePayload>>();
        var jointStateChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryJointStatePayload>>();
        var jointAngleChannel = Channel.CreateUnbounded<SignalREventEnvelope<TelemetryJointAngleUpdatePayload>>();

        await using var connection = CreateHubConnection();

        connection.On<SignalREventEnvelope<TelemetryConnectionStatePayload>>(nameof(IRobotTelemetryClient.TelemetryConnectionStateChanged), envelope =>
        {
            connectionStateChannel.Writer.TryWrite(envelope);
        });

        connection.On<SignalREventEnvelope<TelemetryJointStatePayload>>(nameof(IRobotTelemetryClient.TelemetryJointStateUpdated), envelope =>
        {
            jointStateChannel.Writer.TryWrite(envelope);
        });

        connection.On<SignalREventEnvelope<TelemetryJointAngleUpdatePayload>>(nameof(IRobotTelemetryClient.TelemetryJointAngleUpdated), envelope =>
        {
            jointAngleChannel.Writer.TryWrite(envelope);
        });

        await connection.StartAsync();

        using var response = await client.PostAsJsonAsync("/api/hardware/ingest", CreateValidFirmwarePacket());
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var hardwareConnectionState = await ReadUntil(
            connectionStateChannel.Reader,
            envelope => envelope.Payload.Transport == "serial" && envelope.Payload.Reason == "hardware-frame-received");

        var jointState = await ReadWithTimeout(jointStateChannel.Reader);
        var jointAngle = await ReadWithTimeout(jointAngleChannel.Reader);

        Assert.True(hardwareConnectionState.Payload.IsConnected);
        Assert.Equal("serial", hardwareConnectionState.Payload.Transport);
        Assert.Equal(90, jointState.Payload.Hardware.Waist);
        Assert.Equal(Math.PI / 2d, jointAngle.Payload.Mapped.WaistPivot, 12);
        Assert.Equal(Math.PI / 4d, jointAngle.Payload.Mapped.ShoulderPivot, 12);
        Assert.Equal((110d * Math.PI) / 180d, jointAngle.Payload.Mapped.ElbowPivot, 12);
        Assert.Equal((80d * Math.PI) / 180d, jointAngle.Payload.Mapped.WristRollPivot, 12);
        Assert.Equal((70d * Math.PI) / 180d, jointAngle.Payload.Mapped.WristPivot, 12);
    }

    private FirmwareSerializedPacket CreateValidFirmwarePacket()
    {
        const string frame = "{\"deviceId\":\"esp32-arm-01\",\"firmwareVersion\":\"1.2.0\",\"sequence\":128,\"sentAtUtc\":\"2026-04-02T08:00:00Z\",\"transport\":\"serial\",\"payload\":{\"waist\":90,\"shoulder\":45,\"elbow\":110,\"wristRoll\":80,\"wrist\":70},\"checksumCrc16\":\"A1F0\"}";

        return new FirmwareSerializedPacket(
            Protocol: "robotic-v4.telemetry.v1",
            ContentType: "application/json",
            Encoding: "utf-8",
            Framing: "jsonl",
            Delimiter: "\\n",
            Frame: frame,
            ChecksumCrc16: "A1F0",
            ByteLength: System.Text.Encoding.UTF8.GetByteCount(frame),
            ReceivedAtUtc: DateTimeOffset.Parse("2026-04-02T08:00:01Z"),
            Transport: "serial");
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
