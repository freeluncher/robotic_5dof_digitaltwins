import { describe, expect, it } from 'vitest';

import { resetAllStores } from '../tests/helpers/storeTestHelpers';
import {
  defaultGripperFixture,
  defaultHardwareFixture,
  defaultMappedFixture,
  updatedGripperFixture,
  updatedHardwareFixture,
  updatedMappedFixture,
} from '../tests/fixtures/storeFixtures';
import { useConnectivityStore } from './connectivityStore';
import { cancelRobotStoreUpdates, flushRobotStoreUpdates, useRobotStore } from './robotStore';
import { useUiStore } from './uiStore';

describe('zustand stores setup', () => {
  it('mengelola robot state untuk hardware dan mapped pivot', () => {
    resetAllStores();

    useRobotStore.getState().setHardware(updatedHardwareFixture);
    useRobotStore.getState().setMapped(updatedMappedFixture);
    useRobotStore.getState().setGripper(updatedGripperFixture);
    flushRobotStoreUpdates();

    const state = useRobotStore.getState();
    expect(state.hardware.waist).toBe(100);
    expect(state.hardware.wristRoll).toBe(120);
    expect(state.mapped.waist_pivot).toBe(Math.PI / 2);
    expect(state.gripper).toBe(120);
    expect(state.lastHardwareUpdateAt).not.toBeNull();
    expect(state.lastMappedUpdateAt).not.toBeNull();
    expect(state.lastGripperUpdateAt).not.toBeNull();
    expect(state.telemetrySampleCount).toBe(1);
  });

  it('menggabungkan update hardware dan mapped yang datang beruntun dalam satu flush', () => {
    resetAllStores();

    useRobotStore.getState().setHardware({
      ...updatedHardwareFixture,
      waist: 95,
    });
    useRobotStore.getState().setHardware(updatedHardwareFixture);
    useRobotStore.getState().setMapped(updatedMappedFixture);
    flushRobotStoreUpdates();

    const state = useRobotStore.getState();

    expect(state.hardware.waist).toBe(100);
    expect(state.mapped.wrist_roll_pivot).toBe(Math.PI / 6);
    expect(state.telemetrySampleCount).toBe(1);
  });

  it('membatalkan update robot yang belum di-flush tanpa mengubah state aktif', () => {
    resetAllStores();

    useRobotStore.getState().setHardware(updatedHardwareFixture);
    useRobotStore.getState().setMapped(updatedMappedFixture);
    useRobotStore.getState().setGripper(updatedGripperFixture);
    cancelRobotStoreUpdates();

    const state = useRobotStore.getState();

    expect(state.hardware).toEqual(defaultHardwareFixture);
    expect(state.mapped).toEqual(defaultMappedFixture);
    expect(state.gripper).toBe(defaultGripperFixture);
    expect(state.lastHardwareUpdateAt).toBeNull();
    expect(state.lastMappedUpdateAt).toBeNull();
    expect(state.lastGripperUpdateAt).toBeNull();
    expect(state.telemetrySampleCount).toBe(0);
  });

  it('mengelola ui state untuk mode kontrol dan panel', () => {
    resetAllStores();

    useUiStore.setState({ controlMode: 'manual', panelOpen: true });

    useUiStore.getState().setControlMode('live');
    useUiStore.getState().togglePanel();
    useUiStore.getState().setSystemFallback('Fallback mode active.');

    const state = useUiStore.getState();
    expect(state.controlMode).toBe('live');
    expect(state.panelOpen).toBe(false);
    expect(state.systemState).toBe('fallback');
    expect(state.systemMessage).toBe('Fallback mode active.');
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
