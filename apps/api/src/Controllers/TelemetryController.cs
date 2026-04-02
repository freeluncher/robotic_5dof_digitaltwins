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
    private readonly ILogger<TelemetryController> _logger;
    private readonly IHardwareDataValidator _validator;
    private readonly IRobotTelemetryService _telemetryService;
    private readonly IHubContext<RobotTelemetryHub, IRobotTelemetryClient> _hub;

    public TelemetryController(
        ILogger<TelemetryController> logger,
        IHardwareDataValidator validator,
        IRobotTelemetryService telemetryService,
        IHubContext<RobotTelemetryHub, IRobotTelemetryClient> hub)
    {
        _logger = logger;
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
            _logger.LogWarning("Telemetry payload rejected. ValidationErrors: {ValidationErrors}", errors.Keys);
            return BadRequest(new ValidationProblemDetails(errors));
        }

        _logger.LogInformation(
            "Telemetry payload accepted. Waist={Waist}, Shoulder={Shoulder}, Elbow={Elbow}, WristRoll={WristRoll}, Wrist={Wrist}",
            request.Waist,
            request.Shoulder,
            request.Elbow,
            request.WristRoll,
            request.Wrist);

        var envelope = _telemetryService.CreateJointStateTelemetry(request);
        var angleEnvelope = _telemetryService.CreateJointAngleUpdateTelemetry(request);

        await _hub.Clients.All.TelemetryJointStateUpdated(envelope);
        await _hub.Clients.All.TelemetryJointAngleUpdated(angleEnvelope);

        return Ok(envelope);
    }
}
