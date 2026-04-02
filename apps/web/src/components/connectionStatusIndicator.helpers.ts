export type ConnectionStatusType = 'offline' | 'connecting' | 'connected';

export function getConnectionStatus(
  isConnected: boolean,
  transport: string,
): ConnectionStatusType {
  if (!isConnected && transport === 'simulator') {
    return 'connecting';
  }

  if (isConnected) {
    return 'connected';
  }

  return 'offline';
}

export function getConnectionStatusLabel(status: ConnectionStatusType): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'offline':
      return 'Offline';
  }
}

export function statusDescription(status: ConnectionStatusType, transport: string): string {
  const transportLabel = transport === 'signalr' ? 'SignalR' : transport;
  const statusText = getConnectionStatusLabel(status);
  return `${statusText} (${transportLabel})`;
}
