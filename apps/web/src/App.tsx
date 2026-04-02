import { StatusCard } from './components/StatusCard';
import { useDigitalTwinStatus } from './hooks/useDigitalTwinStatus';

function App() {
  const { controlMode, connectionLabel, transport, waist } = useDigitalTwinStatus();

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>Robotic V4 Digital Twin</h1>
        <p>
          Initial visualization page is ready. This viewport will host the GLB model and pivot
          animation in the next integration phase.
        </p>
      </header>

      <section className="visualization-layout" aria-label="Digital twin initial visualization">
        <article className="viewport-card">
          <div className="viewport-grid" role="img" aria-label="3D viewport placeholder">
            <div className="viewport-crosshair" />
            <span className="viewport-label">3D VIEWPORT PLACEHOLDER</span>
            <span className="viewport-sub">Ready for GLB + R3F scene mount</span>
          </div>
        </article>

        <aside className="status-panel">
          <h2>Runtime Snapshot</h2>
          <ul className="status-list">
            <StatusCard title="Control mode" value={controlMode} />
            <StatusCard title="Connection" value={connectionLabel} />
            <StatusCard title="Transport" value={transport} />
            <StatusCard title="Waist hardware angle" value={waist} />
          </ul>
        </aside>
      </section>
    </main>
  );
}

export default App;
