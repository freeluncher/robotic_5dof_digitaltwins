using Microsoft.AspNetCore.Mvc;
using RoboticV4.Api.Services;

namespace RoboticV4.Api.Controllers;

[ApiController]
[Route("api/hardware/simulator")]
public sealed class HardwareSimulationController : ControllerBase
{
    private readonly IHardwareSimulationService _simulationService;

    public HardwareSimulationController(IHardwareSimulationService simulationService)
    {
        _simulationService = simulationService;
    }

    [HttpGet("status")]
    [ProducesResponseType(typeof(HardwareSimulationStatus), StatusCodes.Status200OK)]
    public IActionResult GetStatus()
    {
        return Ok(_simulationService.GetStatus());
    }

    [HttpPost("start")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Start([FromBody] StartSimulationRequest? request, CancellationToken cancellationToken)
    {
        var intervalMs = request?.IntervalMs ?? 100;
        var started = await _simulationService.StartAsync(intervalMs, cancellationToken);
        var status = _simulationService.GetStatus();

        return Ok(new StartSimulationResponse(started, status));
    }

    [HttpPost("stop")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Stop(CancellationToken cancellationToken)
    {
        var stopped = await _simulationService.StopAsync(cancellationToken);
        var status = _simulationService.GetStatus();

        return Ok(new StopSimulationResponse(stopped, status));
    }

    public sealed record StartSimulationRequest(int? IntervalMs);
    public sealed record StartSimulationResponse(bool Started, HardwareSimulationStatus Status);
    public sealed record StopSimulationResponse(bool Stopped, HardwareSimulationStatus Status);
}
