using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
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
}
