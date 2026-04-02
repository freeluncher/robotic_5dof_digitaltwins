import { useConnectivityStore } from '../../stores/connectivityStore';
import { cancelRobotStoreUpdates, useRobotStore } from '../../stores/robotStore';
import { useUiStore } from '../../stores/uiStore';
import {
  defaultGripperFixture,
  defaultHardwareFixture,
  defaultMappedFixture,
} from '../fixtures/storeFixtures';

export function resetAllStores() {
  cancelRobotStoreUpdates();

  useRobotStore.setState({
    hardware: defaultHardwareFixture,
    mapped: defaultMappedFixture,
    gripper: defaultGripperFixture,
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
