using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RoboticV4.Api.Services;
using RoboticV4.Contracts;
using Xunit;

namespace RoboticV4.Api.Tests;

public class TelemetryControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public TelemetryControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Publish_joint_state_returns_ok_for_valid_payload()
    {
        using var client = _factory.CreateClient();

        var payload = new
        {
            waist = 90,
            shoulder = 45,
            elbow = 110,
            wristRoll = 80,
            wrist = 70,
        };

        using var response = await client.PostAsJsonAsync("/api/telemetry/joint-state", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Publish_joint_state_returns_signalr_envelope_contract_for_valid_payload()
    {
        using var client = _factory.CreateClient();

        var payload = new
        {
            waist = 90,
            shoulder = 45,
            elbow = 110,
            wristRoll = 80,
            wrist = 70,
        };

        using var response = await client.PostAsJsonAsync("/api/telemetry/joint-state", payload);
        var envelope = await response.Content.ReadFromJsonAsync<SignalREventEnvelope<TelemetryJointStatePayload>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.NotNull(envelope);
        Assert.Equal(SignalREventName.TelemetryJointState, envelope!.EventName);
        Assert.Equal("api", envelope.Source);
        Assert.Equal(90, envelope.Payload.Hardware.Waist);
        Assert.Equal(1.5707963267948966, envelope.Payload.Mapped.WaistPivot, 12);
    }

    [Fact]
    public async Task Publish_joint_state_returns_bad_request_for_out_of_range_payload()
    {
        using var client = _factory.CreateClient();

        var payload = new
        {
            waist = -1,
            shoulder = 45,
            elbow = 110,
            wristRoll = 80,
            wrist = 70,
        };

        using var response = await client.PostAsJsonAsync("/api/telemetry/joint-state", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Publish_joint_state_returns_problem_json_when_unhandled_exception_occurs()
    {
        using var customFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IRobotTelemetryService>();
                services.AddSingleton<IRobotTelemetryService, ThrowingTelemetryService>();
            });
        });

        using var client = customFactory.CreateClient();

        var payload = new
        {
            waist = 90,
            shoulder = 45,
            elbow = 110,
            wristRoll = 80,
            wrist = 70,
        };

        using var response = await client.PostAsJsonAsync("/api/telemetry/joint-state", payload);
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Contains("Unexpected server error", body);
    }

    private sealed class ThrowingTelemetryService : IRobotTelemetryService
    {
        public SignalREventEnvelope<TelemetryJointStatePayload> CreateJointStateTelemetry(RawHardwareData hardware)
        {
            throw new InvalidOperationException("forced telemetry failure for global error middleware test");
        }

        public SignalREventEnvelope<TelemetryJointAngleUpdatePayload> CreateJointAngleUpdateTelemetry(RawHardwareData hardware)
        {
            throw new InvalidOperationException("forced telemetry failure for global error middleware test");
        }

        public SignalREventEnvelope<TelemetryConnectionStatePayload> CreateConnectionStateTelemetry(
            bool isConnected,
            string transport,
            string? reason,
            string source = "api")
        {
            throw new InvalidOperationException("forced telemetry failure for global error middleware test");
        }
    }
}
