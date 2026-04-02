using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace RoboticV4.Api.Tests;

public class HealthCheckEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HealthCheckEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Health_endpoint_returns_healthy_payload()
    {
        using var client = _factory.CreateClient();

        using var response = await client.GetAsync("/health");
        var payload = await response.Content.ReadFromJsonAsync<HealthPayload>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal("healthy", payload!.Status);
        Assert.Equal("robotic_v4-api", payload.Service);
    }

    private sealed record HealthPayload(string Status, string Service);
}
