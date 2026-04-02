import { useEffect, useMemo, useState } from 'react';

import { useConnectivityStore } from '../stores/connectivityStore';
import { useRobotStore } from '../stores/robotStore';
import { useUiStore } from '../stores/uiStore';
import {
  formatTelemetryAge,
  getTelemetryState,
  toTelemetryJointRows,
  type TelemetryState,
} from './telemetryPanel.helpers';

function statusTextByState(state: TelemetryState): string {
  switch (state) {
    case 'offline':
      return 'Offline';
    case 'waiting':
      return 'Waiting packet';
    case 'stale':
      return 'Stale';
    default:
      return 'Live';
  }
}

export function TelemetryPanel() {
  const hardware = useRobotStore((state) => state.hardware);
  const gripper = useRobotStore((state) => state.gripper);
  const telemetrySampleCount = useRobotStore((state) => state.telemetrySampleCount);
  const lastHardwareUpdateAt = useRobotStore((state) => state.lastHardwareUpdateAt);

  const isConnected = useConnectivityStore((state) => state.isConnected);
  const transport = useConnectivityStore((state) => state.transport);
  const lastReason = useConnectivityStore((state) => state.lastReason);

  const controlMode = useUiStore((state) => state.controlMode);

  const [tickNow, setTickNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTickNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const telemetryAgeMs = lastHardwareUpdateAt === null ? null : tickNow - lastHardwareUpdateAt;
  const telemetryState = getTelemetryState(isConnected, telemetryAgeMs);
  const jointRows = useMemo(() => toTelemetryJointRows(hardware, gripper), [hardware, gripper]);

  return (
    <section className="telemetry-panel" aria-label="Realtime telemetry panel">
      <div className="telemetry-panel-header">
        <h2>Realtime Telemetry</h2>
        <span className={`telemetry-badge telemetry-${telemetryState}`}>
          {statusTextByState(telemetryState)}
        </span>
      </div>

      <div className="telemetry-meta-grid" role="list">
        <div className="telemetry-meta-item" role="listitem">
          <span>Mode</span>
          <strong>{controlMode}</strong>
        </div>
        <div className="telemetry-meta-item" role="listitem">
          <span>Transport</span>
          <strong>{transport}</strong>
        </div>
        <div className="telemetry-meta-item" role="listitem">
          <span>Samples</span>
          <strong>{telemetrySampleCount}</strong>
        </div>
        <div className="telemetry-meta-item" role="listitem">
          <span>Latency</span>
          <strong>{formatTelemetryAge(telemetryAgeMs)}</strong>
        </div>
      </div>

      <table className="telemetry-table">
        <thead>
          <tr>
            <th scope="col">Joint</th>
            <th scope="col">Angle</th>
          </tr>
        </thead>
        <tbody>
          {jointRows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{Math.round(row.value)} deg</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="telemetry-footnote">Last reason: {lastReason ?? 'n/a'}</p>
    </section>
  );
}
