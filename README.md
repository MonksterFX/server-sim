# Server Simulator

A Turborepo monorepo for simulating server infrastructure and network flows with a visual node editor.

## Project Structure

This monorepo is organized into **apps** and **packages**:

```
server-sim/
├── apps/
│   └── game/              # SvelteKit application (main UI)
├── packages/
│   ├── editor/            # Visual node editor package
│   └── simulation/       # Simulation engine (network, flow, types, utils)
├── examples/              # Example code and debug scripts
├── turbo.json            # Turborepo pipeline configuration
├── tsconfig.json         # Base TypeScript configuration
└── package.json          # Root workspace configuration
```

## Packages

### `@server-sim/simulation`

The core simulation engine that handles network flows, request processing, and infrastructure modeling.

**Exports:**
- Main: `@server-sim/simulation` - Network, Node, Producer, Consumer, Connection, Request classes
- Utils: `@server-sim/simulation/utils` - Logger and PerformanceMonitor utilities
- Types: `@server-sim/simulation/types` - TypeScript type definitions

**Key Components:**
- `flow/network/` - Network topology and node management
- `flow/models/` - Data structures (Stack, etc.)
- `types/` - TypeScript namespace definitions (Engine, Networking, Utils)
- `utils/` - Logging and performance monitoring

### `@server-sim/editor`

A visual node editor for creating and editing network topologies. Completely decoupled from the simulation engine.

**Exports:**
- Main: `@server-sim/editor` - Editor, EditorNode, EditorConnection, NetworkAdapter, and starter functions

**Key Components:**
- `editor/` - Core editor implementation
- `adapter.ts` - Bridges editor and simulation network
- `starter.ts` - Quick initialization helper

### `@server-sim/game`

The main SvelteKit application that provides the UI for the simulator.

**Structure:**
- `src/game/` - Game logic (Game, GameState, Szenario classes)
- `src/routes/` - SvelteKit routes and pages
- `src/lib/` - Shared UI components and assets

**Exports:**
- `@server-sim/game/game` - Game class for simulation control

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (or pnpm/yarn)

### Installation

```bash
# Install all dependencies for all workspaces
npm install
```

### Development

Start all apps and packages in development mode:

```bash
npm run dev
```

This will start the SvelteKit app and watch all packages for changes.

### Building

Build all packages and apps:

```bash
npm run build
```

Turborepo will build packages in the correct order based on dependencies.

### Type Checking

Run TypeScript type checking across all packages:

```bash
npm run check
```

### Linting

Run linting across all packages:

```bash
npm run lint
```

## Development Workflow

### Working on a Package

1. Make changes to the package code
2. The package will automatically rebuild if using `npm run dev`
3. Apps depending on the package will pick up changes automatically

### Package Dependencies

- `@server-sim/game` depends on:
  - `@server-sim/editor`
  - `@server-sim/simulation`

- `@server-sim/editor` depends on:
  - `@server-sim/simulation`

- `@server-sim/simulation` has no internal dependencies

### Importing Packages

Always use package names for imports, not relative paths:

```typescript
// ✅ Correct
import { Network, Producer } from '@server-sim/simulation';
import { startEditor } from '@server-sim/editor';
import Game from '@server-sim/game/game';

// ❌ Incorrect
import { Network } from '../../packages/simulation/flow';
```

## Examples

The `examples/` directory contains example code demonstrating how to use the simulation engine:

- `debug.ts` - Example network setup and simulation run

## Technology Stack

- **Monorepo Tool**: Turborepo
- **Package Manager**: npm workspaces
- **TypeScript**: Type checking and compilation
- **Frontend Framework**: SvelteKit
- **Build Tool**: Vite (for SvelteKit app)

## Project Configuration

### TypeScript

- Root `tsconfig.json` provides base configuration
- Each package/app extends the root config with its own settings
- Packages use `composite: true` for incremental builds

### Turborepo Pipeline

The `turbo.json` defines the build pipeline:
- `build` - Builds packages/apps with dependency ordering
- `dev` - Development mode (no caching, persistent)
- `check` - Type checking
- `lint` - Linting

## Contributing

When adding new packages or apps:

1. Create the package/app directory in `packages/` or `apps/`
2. Add a `package.json` with the `@server-sim/*` naming convention
3. Create a `tsconfig.json` that extends the root config
4. Update this README if the structure changes significantly
