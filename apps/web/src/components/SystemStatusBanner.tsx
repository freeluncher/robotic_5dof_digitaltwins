import { useEffect, useMemo } from 'react';

import { useConnectivityStore } from '../stores/connectivityStore';
import { useRobotStore } from '../stores/robotStore';
import { useUiStore } from '../stores/uiStore';
import { deriveSystemState, getSystemStateDescription, getSystemStateLabel } from './systemStatus.helpers';

export function SystemStatusBanner() {
  const controlMode = useUiStore((state) => state.controlMode);
  const systemState = useUiStore((state) => state.systemState);
  const systemMessage = useUiStore((state) => state.systemMessage);
  const setSystemLoading = useUiStore((state) => state.setSystemLoading);
  const setSystemReady = useUiStore((state) => state.setSystemReady);
  const setSystemFallback = useUiStore((state) => state.setSystemFallback);
  const setSystemError = useUiStore((state) => state.setSystemError);

  const isConnected = useConnectivityStore((state) => state.isConnected);
  const transport = useConnectivityStore((state) => state.transport);
  const lastReason = useConnectivityStore((state) => state.lastReason);

  const telemetrySampleCount = useRobotStore((state) => state.telemetrySampleCount);

  const derivedState = useMemo(
    () =>
      deriveSystemState({
        controlMode,
        isConnected,
        transport,
        telemetrySampleCount,
        lastReason,
      }),
    [controlMode, isConnected, lastReason, telemetrySampleCount, transport],
  );

  useEffect(() => {
    const nextMessage = getSystemStateDescription(derivedState, {
      controlMode,
      isConnected,
      transport,
      telemetrySampleCount,
      lastReason,
    });

    if (derivedState === 'loading') {
      setSystemLoading(nextMessage);
      return;
    }

    if (derivedState === 'ready') {
      setSystemReady(nextMessage);
      return;
    }

    if (derivedState === 'fallback') {
      setSystemFallback(nextMessage);
      return;
    }

    setSystemError(nextMessage);
  }, [
    controlMode,
    derivedState,
    isConnected,
    lastReason,
    setSystemError,
    setSystemFallback,
    setSystemLoading,
    setSystemReady,
    telemetrySampleCount,
    transport,
  ]);

  return (
    <section className={`system-status-banner system-status-${systemState}`} aria-label="System status banner">
      <div className="system-status-topline">
        <strong>{getSystemStateLabel(systemState)}</strong>
        <span>{transport}</span>
      </div>
      <p>{systemMessage}</p>
      {lastReason ? <small>Last reason: {lastReason}</small> : null}
    </section>
  );
}
