import { useConnectivityStore } from '../stores/connectivityStore';
import { useRobotStore } from '../stores/robotStore';
import { useUiStore } from '../stores/uiStore';

export function useDigitalTwinStatus() {
  const controlMode = useUiStore((state) => state.controlMode);
  const isConnected = useConnectivityStore((state) => state.isConnected);
  const transport = useConnectivityStore((state) => state.transport);
  const waist = useRobotStore((state) => state.hardware.waist);

  return {
    controlMode,
    connectionLabel: isConnected ? 'connected' : 'disconnected',
    transport,
    waist,
  };
}
