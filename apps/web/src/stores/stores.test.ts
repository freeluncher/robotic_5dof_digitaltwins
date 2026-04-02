import { describe, expect, it } from 'vitest';

import { useConnectivityStore } from './connectivityStore';
import { useRobotStore } from './robotStore';
import { useUiStore } from './uiStore';

describe('zustand stores setup', () => {
  it('mengelola robot state untuk hardware dan mapped pivot', () => {
    useRobotStore.setState({
      hardware: {
        waist: 90,
        shoulder: 90,
        elbow: 90,
        wristRoll: 90,
        wrist: 90,
      },
      mapped: {
        waist_pivot: 0,
        shoulder_pivot: 0,
        elbow_pivot: 0,
        wrist_roll_pivot: 0,
        wrist_pivot: 0,
      },
    });

    useRobotStore.getState().setHardware({
      waist: 100,
      shoulder: 80,
      elbow: 75,
      wristRoll: 120,
      wrist: 60,
    });

    const state = useRobotStore.getState();
    expect(state.hardware.waist).toBe(100);
    expect(state.hardware.wristRoll).toBe(120);
  });

  it('mengelola ui state untuk mode kontrol dan panel', () => {
    useUiStore.setState({ controlMode: 'manual', panelOpen: true });

    useUiStore.getState().setControlMode('live');
    useUiStore.getState().togglePanel();

    const state = useUiStore.getState();
    expect(state.controlMode).toBe('live');
    expect(state.panelOpen).toBe(false);
  });

  it('mengelola connectivity state untuk status koneksi dan transport', () => {
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
