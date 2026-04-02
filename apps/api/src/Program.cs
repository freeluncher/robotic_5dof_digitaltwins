using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapHealthChecks("/health", new HealthCheckOptions
{
	ResponseWriter = WriteHealthResponse,
});

app.Run();

static Task WriteHealthResponse(HttpContext context, HealthReport report)
{
	context.Response.ContentType = "application/json";

	var payload = new
	{
		status = report.Status == HealthStatus.Healthy ? "healthy" : "unhealthy",
		service = "robotic_v4-api",
	};

	return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
}

public partial class Program;
