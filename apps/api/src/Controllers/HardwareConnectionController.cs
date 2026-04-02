using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RoboticV4.Api.Hubs;
using RoboticV4.Api.Services;
using RoboticV4.Contracts;

namespace RoboticV4.Api.Controllers;

[ApiController]
[Route("api/hardware")]
public sealed class HardwareConnectionController : ControllerBase
{
    private readonly ILogger<HardwareConnectionController> _logger;
    private readonly IFirmwareIngressService _firmwareIngressService;
    private readonly IRobotTelemetryService _telemetryService;
    private readonly IHubContext<RobotTelemetryHub, IRobotTelemetryClient> _hub;

    public HardwareConnectionController(
        ILogger<HardwareConnectionController> logger,
        IFirmwareIngressService firmwareIngressService,
        IRobotTelemetryService telemetryService,
        IHubContext<RobotTelemetryHub, IRobotTelemetryClient> hub)
    {
        _logger = logger;
        _firmwareIngressService = firmwareIngressService;
        _telemetryService = telemetryService;
        _hub = hub;
    }

    [HttpPost("ingest")]
    [ProducesResponseType(typeof(SignalREventEnvelope<TelemetryJointStatePayload>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> IngestFirmwarePacket([FromBody] FirmwareSerializedPacket packet, CancellationToken cancellationToken)
    {
        if (!_firmwareIngressService.TryParseAndValidate(packet, out var esp32Input, out var errors))
        {
            _logger.LogWarning("Firmware packet rejected. ValidationErrors: {ValidationErrors}", errors.Keys);
            return BadRequest(new ValidationProblemDetails(errors));
        }

        _logger.LogInformation(
            "Firmware packet accepted. DeviceId={DeviceId}, Sequence={Sequence}, Transport={Transport}",
            esp32Input!.DeviceId,
            esp32Input.Sequence,
            packet.Transport);

        var connectionEnvelope = _telemetryService.CreateConnectionStateTelemetry(
            isConnected: true,
            transport: packet.Transport,
            reason: "hardware-frame-received",
            source: "hardware");

        var jointStateEnvelope = _telemetryService.CreateJointStateTelemetry(esp32Input.Payload);
        var jointAngleEnvelope = _telemetryService.CreateJointAngleUpdateTelemetry(esp32Input.Payload);

        await _hub.Clients.All.TelemetryConnectionStateChanged(connectionEnvelope);
        await _hub.Clients.All.TelemetryJointStateUpdated(jointStateEnvelope);
        await _hub.Clients.All.TelemetryJointAngleUpdated(jointAngleEnvelope);

        return Ok(jointStateEnvelope);
    }
}
