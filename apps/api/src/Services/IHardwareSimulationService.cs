namespace RoboticV4.Api.Services;

public interface IHardwareSimulationService
{
    Task<bool> StartAsync(int intervalMs, CancellationToken cancellationToken);
    Task<bool> StopAsync(CancellationToken cancellationToken);
    HardwareSimulationStatus GetStatus();
}

public sealed record HardwareSimulationStatus(
    bool IsRunning,
    int IntervalMs,
    long EmittedFrames,
    DateTimeOffset? StartedAtUtc
);
