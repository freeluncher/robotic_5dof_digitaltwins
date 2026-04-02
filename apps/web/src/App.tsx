import { StatusCard } from './components/StatusCard';
import { useDigitalTwinStatus } from './hooks/useDigitalTwinStatus';

function App() {
  const { controlMode, connectionLabel, transport, waist } = useDigitalTwinStatus();

  return (
    <main className="app-shell">
      <h1>Robotic V4 Digital Twin</h1>
      <p>React + Vite scaffold is ready for kinematics, Zustand, and 3D integration.</p>
      <ul className="status-list">
        <StatusCard title="Control mode" value={controlMode} />
        <StatusCard title="Connection" value={connectionLabel} />
        <StatusCard title="Transport" value={transport} />
        <StatusCard title="Waist hardware angle" value={waist} />
      </ul>
    </main>
  );
}

export default App;
