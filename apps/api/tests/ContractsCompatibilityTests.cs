using System.Text.Json;
using RoboticV4.Contracts;
using Xunit;

namespace RoboticV4.Api.Tests;

public class ContractsCompatibilityTests
{
    [Fact]
    public void RawHardwareData_contract_deserializes_from_shared_shape()
    {
        const string json = """
        {
          "waist": 90,
          "shoulder": 45,
          "elbow": 110,
          "wristRoll": 80,
          "wrist": 70
        }
        """;

        var model = JsonSerializer.Deserialize<RawHardwareData>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(model);
        Assert.Equal(90, model!.Waist);
        Assert.Equal(80, model.WristRoll);
    }

    [Fact]
    public void SignalR_envelope_contract_deserializes_from_shared_shape()
    {
        const string json = """
        {
          "eventName": "telemetry.joint-state.updated",
          "messageId": "evt-123",
          "timestampUtc": "2026-04-02T07:30:00Z",
          "source": "api",
          "payload": {
            "hardware": {
              "waist": 90,
              "shoulder": 45,
              "elbow": 110,
              "wristRoll": 80,
              "wrist": 70
            },
            "mapped": {
              "waist_pivot": 1.5708,
              "shoulder_pivot": 0.7854,
              "elbow_pivot": 1.9199,
              "wrist_roll_pivot": 0.3491,
              "wrist_pivot": 0.2618
            }
          }
        }
        """;

        var envelope = JsonSerializer.Deserialize<SignalREventEnvelope<TelemetryJointStatePayload>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(envelope);
        Assert.Equal(SignalREventName.TelemetryJointState, envelope!.EventName);
        Assert.Equal(90, envelope.Payload.Hardware.Waist);
    }

    [Fact]
    public void SignalR_joint_angle_update_contract_deserializes_from_shared_shape()
    {
        const string json = """
        {
          "eventName": "telemetry.joint-angle.updated",
          "messageId": "evt-angle-123",
          "timestampUtc": "2026-04-02T07:30:00Z",
          "source": "api",
          "payload": {
            "mapped": {
              "waistPivot": 1.5708,
              "shoulderPivot": 0.7854,
              "elbowPivot": 1.9199,
              "wristRollPivot": 0.3491,
              "wristPivot": 0.2618
            }
          }
        }
        """;

        var envelope = JsonSerializer.Deserialize<SignalREventEnvelope<TelemetryJointAngleUpdatePayload>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(envelope);
        Assert.Equal(SignalREventName.TelemetryJointAngleUpdate, envelope!.EventName);
        Assert.Equal(1.5708, envelope.Payload.Mapped.WaistPivot, 4);
    }
}
