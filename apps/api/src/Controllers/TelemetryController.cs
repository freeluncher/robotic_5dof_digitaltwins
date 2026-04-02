using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RoboticV4.Api.Hubs;
using RoboticV4.Api.Services;
using RoboticV4.Api.Validation;
using RoboticV4.Contracts;

namespace RoboticV4.Api.Controllers;

[ApiController]
[Route("api/telemetry")]
public sealed class TelemetryController : ControllerBase
{
    private readonly IHardwareDataValidator _validator;
    private readonly IRobotTelemetryService _telemetryService;
    private readonly IHubContext<RobotTelemetryHub> _hub;

    public TelemetryController(
        IHardwareDataValidator validator,
        IRobotTelemetryService telemetryService,
        IHubContext<RobotTelemetryHub> hub)
    {
        _validator = validator;
        _telemetryService = telemetryService;
        _hub = hub;
    }

    [HttpPost("joint-state")]
    [ProducesResponseType(typeof(SignalREventEnvelope<TelemetryJointStatePayload>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PublishJointState([FromBody] RawHardwareData request, CancellationToken cancellationToken)
    {
        if (!_validator.TryValidate(request, out var errors))
        {
            return BadRequest(new ValidationProblemDetails(errors));
        }

        var envelope = _telemetryService.CreateJointStateTelemetry(request);

        await _hub.Clients.All.SendAsync(
            SignalREventName.TelemetryJointState,
            envelope,
            cancellationToken);

        return Ok(envelope);
    }
}
