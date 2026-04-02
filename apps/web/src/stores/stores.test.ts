import { describe, expect, it } from 'vitest';

import { resetAllStores } from '../test/helpers/storeTestHelpers';
import {
  defaultHardwareFixture,
  defaultMappedFixture,
  updatedHardwareFixture,
  updatedMappedFixture,
} from '../test/fixtures/storeFixtures';
import { useConnectivityStore } from './connectivityStore';
import { useRobotStore } from './robotStore';
import { useUiStore } from './uiStore';

describe('zustand stores setup', () => {
  it('mengelola robot state untuk hardware dan mapped pivot', () => {
    resetAllStores();

    useRobotStore.setState({
      hardware: defaultHardwareFixture,
      mapped: defaultMappedFixture,
    });

    useRobotStore.getState().setHardware(updatedHardwareFixture);
    useRobotStore.getState().setMapped(updatedMappedFixture);

    const state = useRobotStore.getState();
    expect(state.hardware.waist).toBe(100);
    expect(state.hardware.wristRoll).toBe(120);
    expect(state.mapped.waist_pivot).toBe(Math.PI / 2);
  });

  it('mengelola ui state untuk mode kontrol dan panel', () => {
    resetAllStores();

    useUiStore.setState({ controlMode: 'manual', panelOpen: true });

    useUiStore.getState().setControlMode('live');
    useUiStore.getState().togglePanel();

    const state = useUiStore.getState();
    expect(state.controlMode).toBe('live');
    expect(state.panelOpen).toBe(false);
  });

  it('mengelola connectivity state untuk status koneksi dan transport', () => {
    resetAllStores();

    useConnectivityStore.setState({
      isConnected: false,
      transport: 'simulator',
      lastReason: 'init',
    });

    useConnectivityStore.getState().setTransport('wifi');
    useConnectivityStore.getState().setConnected(true, 'connected');

    const state = useConnectivityStore.getState();
    expect(state.transport).toBe('wifi');
    expect(state.isConnected).toBe(true);
    expect(state.lastReason).toBe('connected');
  });
});
