import { useConnectivityStore } from '../../stores/connectivityStore';
import { useRobotStore } from '../../stores/robotStore';
import { useUiStore } from '../../stores/uiStore';
import {
  defaultHardwareFixture,
  defaultMappedFixture,
} from '../fixtures/storeFixtures';

export function resetAllStores() {
  useRobotStore.setState({
    hardware: defaultHardwareFixture,
    mapped: defaultMappedFixture,
  });

  useUiStore.setState({
    controlMode: 'manual',
    panelOpen: true,
  });

  useConnectivityStore.setState({
    isConnected: false,
    transport: 'simulator',
    lastReason: 'not-connected-yet',
  });
}
