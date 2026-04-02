# Robotic Arm 5 DOF Digital Twin

This monorepo contains a production-oriented Digital Twin implementation for a 5 DOF robotic arm, with a strong focus on kinematic accuracy, real-time synchronization, and a Test-Driven Development (TDD) workflow.

The project integrates:

- 3D visualization frontend (React + Three.js/R3F)
- Real-time backend API (.NET 8 + SignalR)
- Shared contracts used by both frontend and backend

## Current Status

The project is beyond the initial scaffold stage. Major implemented capabilities include:

- GLB visualization of the `robotic_v4` model in the web viewport
- Hardware-to-pivot mapping for the Three.js scene graph
- Axis calibration fixes for shoulder, elbow, wrist roll, and wrist pivot
- Wrist roll runtime mapping aligned with the `link2` normal
- Parallel gripper mechanism with gear, connection-link, and finger coupling
- Manual/live joint control panel with 5 DOF sliders and gripper control
- Critical mechanical limits enforced:
  - shoulder max: `167 deg`
  - gripper min: `90 deg` (maximum clamping position)
- Backend telemetry API + hardware ingest + simulation mode
- SignalR broadcasts for joint telemetry and connection state
- Active cross-layer test coverage (frontend/backend/contracts)

## Repository Structure

```text
apps/
  web/        React + Vite + Zustand + Vitest + Three.js/R3F
  api/        .NET 8 Web API + SignalR + xUnit
shared/
  contracts/  DTOs, event contracts, JSON schema, compatibility docs
notes/        Step-by-step engineering implementation notes
```

## Technology Stack

- Frontend: React 18, TypeScript, Vite, Zustand, Three.js, @react-three/fiber, @react-three/drei, Vitest
- Backend: ASP.NET Core .NET 8, SignalR, xUnit
- Shared Contracts: TypeScript + C# DTO parity, schema-based compatibility checks
- Tooling: ESLint, Prettier, Makefile workflow

## Runtime Architecture

Primary data flow:

`ESP32 / simulator -> ASP.NET API -> SignalR Hub -> Zustand Store -> R3F Scene Animation`

Key runtime components:

- Telemetry + hardware ingest API endpoints
- SignalR telemetry hub for joint updates and connectivity state
- Pivot-based scene graph mapping (not mesh-based direct rotation)
- Debug overlays for local axes and object normal lines

## API and Realtime Endpoints

Backend defaults:

- Health: `/health`
- SignalR Hub: `/hubs/telemetry`

HTTP API:

- `POST /api/telemetry/joint-state`
- `POST /api/hardware/ingest`
- `GET /api/hardware/simulator/status`
- `POST /api/hardware/simulator/start`
- `POST /api/hardware/simulator/stop`

## Local Development

### Prerequisites

- Node.js 18+ (latest LTS recommended)
- .NET SDK 8
- GNU Make (optional, for Makefile workflow)

### Install Dependencies

Use either:

- `make install`

Or run manually:

- `npm install`
- `npm install --prefix apps/web`
- `dotnet restore apps/api/src/robotic_v4.Api.csproj`
- `dotnet restore apps/api/tests/robotic_v4.Api.Tests.csproj`

### Run Development

- `make dev`

This runs backend API and frontend Vite dev server in parallel.

## Build, Test, and Lint

Root scripts:

- `npm run build`
- `npm run test`
- `npm run coverage`
- `npm run lint`
- `npm run format:check`

Scoped scripts:

- `npm run build:web`
- `npm run build:api`
- `npm run test:web`
- `npm run test:api`

## TDD Workflow

This repository follows Red-Green-Refactor:

1. Red: write a failing test for new behavior or a bug fix
2. Green: implement the smallest change to pass the test
3. Refactor: improve code structure without changing behavior

Working rules:

- Behavior changes must include tests
- Mechanical/pivot mapping changes must be validated in scene-graph tests
- Implementation logs are captured in `notes`

## Documentation and Engineering Notes

- Main progress checklist: [PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md)
- Shared frontend/backend contracts: [shared/contracts](shared/contracts)

## Roadmap Snapshot

Major items still in progress:

- API and domain documentation completion
- Realtime telemetry panel
- Operational connection status indicator
- Mechanical limit and warning panel
- Pre-release quality-gate hardening

## Windows Note

If `make` is not available in your terminal:

- Chocolatey: `choco install make`
- Scoop: `scoop install make`

After installation, open a new terminal session before running Make targets.
