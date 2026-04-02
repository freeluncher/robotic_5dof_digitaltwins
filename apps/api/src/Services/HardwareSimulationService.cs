using Microsoft.AspNetCore.SignalR;
using RoboticV4.Api.Hubs;
using RoboticV4.Contracts;

namespace RoboticV4.Api.Services;

public sealed class HardwareSimulationService : IHardwareSimulationService
{
    private readonly object _gate = new();
    private readonly IHubContext<RobotTelemetryHub, IRobotTelemetryClient> _hub;
    private readonly IRobotTelemetryService _telemetryService;
    private readonly ILogger<HardwareSimulationService> _logger;

    private CancellationTokenSource? _loopCancellation;
    private Task? _loopTask;
    private DateTimeOffset? _startedAtUtc;
    private int _intervalMs = 100;
    private long _emittedFrames;

    public HardwareSimulationService(
        IHubContext<RobotTelemetryHub, IRobotTelemetryClient> hub,
        IRobotTelemetryService telemetryService,
        ILogger<HardwareSimulationService> logger)
    {
        _hub = hub;
        _telemetryService = telemetryService;
        _logger = logger;
    }

    public async Task<bool> StartAsync(int intervalMs, CancellationToken cancellationToken)
    {
        CancellationTokenSource cts;

        lock (_gate)
        {
            if (_loopTask is not null && !_loopTask.IsCompleted)
            {
                return false;
            }

            _intervalMs = Math.Clamp(intervalMs, 16, 1000);
            _emittedFrames = 0;
            _startedAtUtc = DateTimeOffset.UtcNow;

            cts = CancellationTokenSource.CreateLinkedTokenSource(CancellationToken.None);
            _loopCancellation = cts;
            _loopTask = Task.Run(() => RunLoopAsync(cts.Token), CancellationToken.None);
        }

        _logger.LogInformation("Hardware simulator started. IntervalMs={IntervalMs}", _intervalMs);

        var startedEnvelope = _telemetryService.CreateConnectionStateTelemetry(
            isConnected: true,
            transport: "simulator",
            reason: "dev-simulator-started");

        await _hub.Clients.All.TelemetryConnectionStateChanged(startedEnvelope);

        return true;
    }

    public async Task<bool> StopAsync(CancellationToken cancellationToken)
    {
        CancellationTokenSource? cts;
        Task? loopTask;

        lock (_gate)
        {
            cts = _loopCancellation;
            loopTask = _loopTask;

            _loopCancellation = null;
            _loopTask = null;
            _startedAtUtc = null;
        }

        if (cts is null || loopTask is null)
        {
            return false;
        }

        cts.Cancel();

        try
        {
            await loopTask;
        }
        catch (OperationCanceledException)
        {
            // Expected when simulation is stopped.
        }
        finally
        {
            cts.Dispose();
        }

        _logger.LogInformation("Hardware simulator stopped.");

        var stoppedEnvelope = _telemetryService.CreateConnectionStateTelemetry(
            isConnected: false,
            transport: "simulator",
            reason: "dev-simulator-stopped");

        await _hub.Clients.All.TelemetryConnectionStateChanged(stoppedEnvelope);

        return true;
    }

    public HardwareSimulationStatus GetStatus()
    {
        lock (_gate)
        {
            var running = _loopTask is not null && !_loopTask.IsCompleted;
            return new HardwareSimulationStatus(running, _intervalMs, _emittedFrames, _startedAtUtc);
        }
    }

    private async Task RunLoopAsync(CancellationToken cancellationToken)
    {
        var start = DateTimeOffset.UtcNow;
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(_intervalMs));

        while (await timer.WaitForNextTickAsync(cancellationToken))
        {
            var elapsed = DateTimeOffset.UtcNow - start;
            var hardware = BuildSampleHardware(elapsed.TotalSeconds);

            var jointStateEnvelope = _telemetryService.CreateJointStateTelemetry(hardware);
            var jointAngleEnvelope = _telemetryService.CreateJointAngleUpdateTelemetry(hardware);

            await _hub.Clients.All.TelemetryJointStateUpdated(jointStateEnvelope);
            await _hub.Clients.All.TelemetryJointAngleUpdated(jointAngleEnvelope);

            Interlocked.Increment(ref _emittedFrames);
        }
    }

    private static RawHardwareData BuildSampleHardware(double t)
    {
        static double Clamp(double value) => Math.Max(0, Math.Min(180, value));

        var waist = Clamp(90 + 40 * Math.Sin(t * 0.8));
        var shoulder = Clamp(90 + 25 * Math.Sin(t * 0.9 + 0.5));
        var elbow = Clamp(90 + 35 * Math.Sin(t * 1.1 + 1.2));
        var wristRoll = Clamp(90 + 45 * Math.Sin(t * 1.3 + 0.2));
        var wrist = Clamp(90 + 20 * Math.Sin(t * 1.5 + 2.1));

        return new RawHardwareData(
            Waist: Math.Round(waist, 3),
            Shoulder: Math.Round(shoulder, 3),
            Elbow: Math.Round(elbow, 3),
            WristRoll: Math.Round(wristRoll, 3),
            Wrist: Math.Round(wrist, 3));
    }
}
