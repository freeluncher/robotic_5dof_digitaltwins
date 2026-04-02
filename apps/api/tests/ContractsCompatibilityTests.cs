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
    public void Esp32HardwareInput_contract_deserializes_from_shared_shape()
    {
        const string json = """
        {
          "deviceId": "esp32-arm-01",
          "firmwareVersion": "1.2.0",
          "sequence": 128,
          "sentAtUtc": "2026-04-02T08:00:00Z",
          "transport": "serial",
          "payload": {
            "waist": 90,
            "shoulder": 45,
            "elbow": 110,
            "wristRoll": 80,
            "wrist": 70
          },
          "checksumCrc16": "A1F0"
        }
        """;

        var model = JsonSerializer.Deserialize<Esp32HardwareInput>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(model);
        Assert.Equal("esp32-arm-01", model!.DeviceId);
        Assert.Equal(128, model.Sequence);
        Assert.Equal("serial", model.Transport);
        Assert.Equal(110, model.Payload.Elbow);
        Assert.Equal("A1F0", model.ChecksumCrc16);
    }

      [Fact]
      public void FirmwareSerializedPacket_contract_deserializes_from_shared_shape()
      {
        const string json = """
        {
          "protocol": "robotic-v4.telemetry.v1",
          "contentType": "application/json",
          "encoding": "utf-8",
          "framing": "jsonl",
          "delimiter": "\\n",
          "frame": "{\"deviceId\":\"esp32-arm-01\",\"sequence\":128}",
          "checksumCrc16": "A1F0",
          "byteLength": 41,
          "receivedAtUtc": "2026-04-02T08:00:01Z",
          "transport": "serial"
        }
        """;

        var model = JsonSerializer.Deserialize<FirmwareSerializedPacket>(json, new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(model);
        Assert.Equal("robotic-v4.telemetry.v1", model!.Protocol);
        Assert.Equal("application/json", model.ContentType);
        Assert.Equal("jsonl", model.Framing);
        Assert.Equal("\\n", model.Delimiter);
        Assert.Equal(41, model.ByteLength);
        Assert.Equal("serial", model.Transport);
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

    [Fact]
    public void SignalR_connection_state_contract_deserializes_from_shared_shape()
    {
        const string json = """
        {
          "eventName": "telemetry.connection.state",
          "messageId": "evt-conn-123",
          "timestampUtc": "2026-04-02T07:30:00Z",
          "source": "hub",
          "payload": {
            "isConnected": true,
            "transport": "signalr",
            "reason": "connected"
          }
        }
        """;

        var envelope = JsonSerializer.Deserialize<SignalREventEnvelope<TelemetryConnectionStatePayload>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(envelope);
        Assert.Equal(SignalREventName.TelemetryConnectionState, envelope!.EventName);
        Assert.True(envelope.Payload.IsConnected);
        Assert.Equal("signalr", envelope.Payload.Transport);
    }

    [Fact]
    public void SignalR_control_command_contract_deserializes_from_shared_shape()
    {
        const string json = """
        {
          "eventName": "control.command.requested",
          "messageId": "evt-cmd-123",
          "timestampUtc": "2026-04-02T07:30:00Z",
          "source": "web",
          "payload": {
            "commandName": "control.set-joint-targets",
            "hardwareTargets": {
              "waist": 90,
              "shoulder": 45,
              "elbow": 110,
              "wristRoll": 80,
              "wrist": 70
            }
          }
        }
        """;

        var envelope = JsonSerializer.Deserialize<SignalREventEnvelope<ControlCommandRequestedPayload>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        Assert.NotNull(envelope);
        Assert.Equal(SignalREventName.ControlCommandRequested, envelope!.EventName);
        Assert.Equal(SignalREventName.ControlSetJointTargets, envelope.Payload.CommandName);
        Assert.Equal(90, envelope.Payload.HardwareTargets!.Waist);
    }
}
