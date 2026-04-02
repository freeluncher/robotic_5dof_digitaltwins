using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
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
}
