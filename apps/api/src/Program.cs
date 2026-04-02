using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using RoboticV4.Api.Hubs;
using RoboticV4.Api.Middleware;
using RoboticV4.Api.Services;
using RoboticV4.Api.Validation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpLogging(options =>
{
	options.LoggingFields = HttpLoggingFields.RequestMethod |
							HttpLoggingFields.RequestPath |
							HttpLoggingFields.ResponseStatusCode |
							HttpLoggingFields.Duration;
});
builder.Services.AddHealthChecks();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IHardwareDataValidator, HardwareDataValidator>();
builder.Services.AddSingleton<IRobotTelemetryService, RobotTelemetryService>();
builder.Services.AddSingleton<IFirmwareIngressService, FirmwareIngressService>();

var app = builder.Build();

app.UseHttpLogging();
app.UseMiddleware<GlobalExceptionMiddleware>();

app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions
{
	ResponseWriter = WriteHealthResponse,
});
app.MapHub<RobotTelemetryHub>("/hubs/telemetry");

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
