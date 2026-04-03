import { useMemo } from 'react';

import { useRobotStore } from '../stores/robotStore';
import { useUiStore } from '../stores/uiStore';
import {
  buildMechanicalLimitRows,
  formatMechanicalMargin,
  formatMechanicalRange,
  getMechanicalLimitSummary,
  type MechanicalLimitState,
} from './mechanicalLimits.helpers';

function statusLabelByState(state: MechanicalLimitState): string {
  switch (state) {
    case 'safe':
      return 'Safe';
    case 'caution':
      return 'Caution';
    case 'limit':
      return 'At limit';
    case 'violation':
      return 'Violation';
  }
}

export function MechanicalLimitPanel() {
  const hardware = useRobotStore((state) => state.hardware);
  const gripper = useRobotStore((state) => state.gripper);
  const controlMode = useUiStore((state) => state.controlMode);

  const rows = useMemo(() => buildMechanicalLimitRows(hardware, gripper), [hardware, gripper]);
  const summary = useMemo(() => getMechanicalLimitSummary(rows), [rows]);
  const warningRows = rows.filter((row) => row.state !== 'safe');

  return (
    <section className="mechanical-limit-panel" aria-label="Mechanical limit and warning panel">
      <div className="mechanical-limit-header">
        <div>
          <h2>Mechanical Limits & Warnings</h2>
          <p className="mechanical-limit-subtitle">
            Monitor joint safe limits to prevent mechanical collisions and extreme positions.
          </p>
        </div>

        <div className="mechanical-limit-summary" aria-label="Mechanical limit summary">
          <span className="summary-pill summary-safe">{summary.safe} safe</span>
          <span className="summary-pill summary-caution">{summary.caution} caution</span>
          <span className="summary-pill summary-limit">{summary.limit} limit</span>
          <span className="summary-pill summary-violation">{summary.violation} violation</span>
        </div>
      </div>

      <div className="mechanical-limit-mode">Active mode: {controlMode}</div>

      <table className="mechanical-limit-table">
        <thead>
          <tr>
            <th scope="col">Joint</th>
            <th scope="col">Value</th>
            <th scope="col">Range</th>
            <th scope="col">Margin</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.field}>
              <td>
                <strong>{row.label}</strong>
              </td>
              <td>{Math.round(row.value)} deg</td>
              <td>{formatMechanicalRange(row)}</td>
              <td>{formatMechanicalMargin(row)}</td>
              <td>
                <span className={`mechanical-status mechanical-status-${row.state}`}>
                  {statusLabelByState(row.state)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mechanical-limit-warning-box">
        <h3>Warnings</h3>
        {warningRows.length === 0 ? (
          <p>All joints are in safe areas.</p>
        ) : (
          <ul>
            {warningRows.map((row) => (
              <li key={row.field}>
                <strong>{row.label}</strong> is in status {statusLabelByState(row.state).toLowerCase()}.
                {` ${row.guidance}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
