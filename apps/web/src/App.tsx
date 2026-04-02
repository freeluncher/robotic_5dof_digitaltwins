import { useConnectivityStore } from './stores/connectivityStore';
import { useRobotStore } from './stores/robotStore';
import { useUiStore } from './stores/uiStore';

function App() {
  const controlMode = useUiStore((state) => state.controlMode);
  const isConnected = useConnectivityStore((state) => state.isConnected);
  const transport = useConnectivityStore((state) => state.transport);
  const waist = useRobotStore((state) => state.hardware.waist);

  return (
    <main className="app-shell">
      <h1>Robotic V4 Digital Twin</h1>
      <p>React + Vite scaffold is ready for kinematics, Zustand, and 3D integration.</p>
      <ul className="status-list">
        <li>Control mode: {controlMode}</li>
        <li>Connection: {isConnected ? 'connected' : 'disconnected'}</li>
        <li>Transport: {transport}</li>
        <li>Waist hardware angle: {waist}</li>
      </ul>
    </main>
  );
}

export default App;
