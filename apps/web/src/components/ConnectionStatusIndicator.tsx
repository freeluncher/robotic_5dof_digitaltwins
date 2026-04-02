import { useConnectivityStore } from '../stores/connectivityStore';
import {
  getConnectionStatus,
  statusDescription,
  type ConnectionStatusType,
} from './connectionStatusIndicator.helpers';

function getStatusBadgeClass(status: ConnectionStatusType): string {
  return `connection-badge-${status}`;
}

function getStatusIndicatorClass(status: ConnectionStatusType): string {
  return `connection-indicator-${status}`;
}

export function ConnectionStatusIndicator() {
  const isConnected = useConnectivityStore((state) => state.isConnected);
  const transport = useConnectivityStore((state) => state.transport);
  const lastReason = useConnectivityStore((state) => state.lastReason);

  const status = getConnectionStatus(isConnected, transport);
  const description = statusDescription(status, transport);

  return (
    <div className="connection-status-container" role="status" aria-live="polite" aria-atomic="true">
      <div className={`connection-badge ${getStatusBadgeClass(status)}`}>
        <span className={`connection-indicator-light ${getStatusIndicatorClass(status)}`} />
        <span className="connection-text">{description}</span>
      </div>

      {lastReason && lastReason !== 'not-connected-yet' && (
        <p className="connection-reason">{lastReason}</p>
      )}
    </div>
  );
}
