# Story 7.1: Worker Bootstrap & Heartbeat

Status: done

## Story

As an Architect,
I want the simulation engine to reside in a pure TypeScript Web Worker,
so that the heavy x15 simulation logic runs off the main thread, keeping the UI responsive.

## Acceptance Criteria

1. **Worker Infrastructure:** Create a dedicated Web Worker file in `src/domains/match/worker/MatchWorker.ts`.
2. **Main Thread Integration:** Implement a bootstrap mechanism (singleton hook or service) to initialize the worker without creating duplicate instances (React 19 Strict Mode safe).
3. **Heartbeat Mechanism:** The worker must send a "heartbeat" message to the main thread every 1,000ms.
4. **Communication Loop:** The main thread must log the receipt of the heartbeat using the `LoggerService`.
5. **Pure Logic Isolation:** The worker must NOT import any React, Phaser, or DOM-dependent libraries.

## Tasks / Subtasks

- [x] **Worker Scaffolding** (AC: 1, 5)
  - [x] Create `src/domains/match/worker/MatchWorker.ts`.
  - [x] Implement a basic `setInterval` loop in the worker to send heartbeats.
- [x] **Bootstrap Implementation** (AC: 2)
  - [x] Create `src/domains/match/MatchWorkerClient.ts` (or a dedicated service) to manage the worker lifecycle.
  - [x] Ensure the worker is only instantiated once.
- [x] **Connectivity Verification** (AC: 3, 4)
  - [x] Implement message handler in the main thread to process worker messages.
  - [x] Verify that heartbeats are logged every second.
- [x] **Documentation** (AC: 5)
  - [x] Add a brief comment in the worker file reminding future devs of the "No DOM/No Phaser" constraint.

### Review Findings

- [x] [Review][Decision] Wasteful Global Initialization — Resolved: global init in App.tsx maintained for simplicity.
- [x] [Review][Patch] Leaky Constructor Exposure [src/domains/match/MatchWorkerClient.ts:10]
- [x] [Review][Patch] Blind Worker Lifecycle (Missing onerror) [src/domains/match/MatchWorkerClient.ts:15]
- [x] [Review][Patch] Incomplete Hook Lifecycle (No cleanup or status) [src/domains/match/hooks/useMatchWorker.ts:4]
- [x] [Review][Patch] Silent Message Dropping (No default case) [src/domains/match/MatchWorkerClient.ts:24]
- [x] [Review][Patch] Aggressive Side-Effects in MatchWorker [src/domains/match/worker/MatchWorker.ts:11]
- [x] [Review][Defer] Pre-existing ESLint errors outside scope — deferred, pre-existing

## Developer Context section

### Technical Requirements
- **Vite Worker Support:** Use `new Worker(new URL('./worker/MatchWorker.ts', import.meta.url), { type: 'module' })` or Vite's `?worker` import.
- **TypeScript Strict:** Ensure no `any` is used in the communication interface.
- **React 19 Compatibility:** The bootstrap must be resilient to React's double-mounting in development.

### Architecture Compliance
- **Location:** `src/domains/match/worker/` (Isolation).
- **Pattern:** Use standard `postMessage` communication as defined in the project context.
- **Throttling:** Although not strictly required for the heartbeat, keep in mind the "max 4 updates/sec" rule for future match data.

### Library Framework Requirements
- **Pure TS:** No external dependencies like Comlink unless explicitly authorized (stick to native for now).
- **Core Access:** The worker can import from `@core` (Services/Utils) if they are pure logic (no DOM).

### File Structure Requirements
- `src/domains/match/worker/MatchWorker.ts`
- `src/domains/match/hooks/useMatchWorker.ts` (Recommended bootstrap pattern)

### Testing Requirements
- **Vitest:** Mock the `Worker` global to verify that the main thread correctly handles messages.
- **Async Safety:** Ensure tests wait for the heartbeat if testing real timing (prefer mocked timers).

## Project Context Reference

### Match Engine Isolation (Web Worker)
- **Rule:** All match simulation logic (x15 speed) MUST reside in a dedicated Web Worker.
- **Constraint:** No access to the DOM or Phaser API within the worker.
- **Communication:** Bi-directional messaging via `postMessage` with output throttling.
- **Boot Pattern:** Initialiser le Worker via un hook racine unique pour éviter les doubles instances.

### Dependency Matrix (Strict)
- `domains/` -> `core/` : ✅ Autorisé (Services/FSM).
- `core/` -> `domains/` : ❌ **INTERDIT** (Le socle doit être agnostique).

### Testing Rules (Vitest Mandatory)
- **Critical Zones (95-100% Coverage) :** `domains/match/`. Blocage de build impératif si ce seuil n'est pas atteint.

## Story Completion Status

- Status: done
- Notes: Worker bootstrap, heartbeat loop, main-thread logging, and verification tests completed. Refactored after code review for improved robustness (private singleton, error handling, lifecycle start).

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Added failing Vitest coverage first for the missing worker entry and singleton client bootstrap.
- Implemented `MatchWorker.ts` as a pure TypeScript module worker that posts typed heartbeat messages every 1,000ms.
- Implemented `MatchWorkerClient.ts` as a singleton lifecycle client using Vite module worker construction and `LoggerService` heartbeat logging.
- Added `useMatchWorker` and mounted it from the root React app to bootstrap the worker once under React Strict Mode.
- Added worker, client, and hook tests covering heartbeat cadence, singleton behavior, LoggerService integration, and root hook bootstrap.
- Refactored based on code review: private constructor for client, `onerror` listener, default switch case, and explicit `start()` function in worker.
- Validations run: targeted Vitest tests, full Vitest suite, production build, `test:ci` coverage, global ESLint, and scoped ESLint on touched files.

### Completion Notes List

- Delivered the Web Worker scaffold at `src/domains/match/worker/MatchWorker.ts` with no React, Phaser, or DOM-dependent imports.
- Heartbeat messages are typed and emitted once per second with a monotonic sequence number and timestamp.
- Main-thread integration is centralized in a singleton `MatchWorkerClient`, preventing duplicate Worker instances during repeated bootstrap calls.
- Root app bootstrap now calls `useMatchWorker`, and incoming heartbeats are logged through `LoggerService` using the `MATCH` domain.
- Full tests, coverage thresholds, build, and scoped lint pass. Repository-wide ESLint still reports pre-existing errors outside this story scope.

### File List

- _bmad-output/implementation-artifacts/7-1-worker-bootstrap-heartbeat.md (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- src/domains/match/MatchWorkerClient.ts (new)
- src/domains/match/MatchWorkerClient.test.ts (new)
- src/domains/match/hooks/useMatchWorker.ts (new)
- src/domains/match/hooks/useMatchWorker.test.tsx (new)
- src/domains/match/worker/MatchWorker.ts (new)
- src/domains/match/worker/MatchWorker.test.ts (new)
- src/presentation/App.tsx (modified)
- coverage/** (updated/generated by `npm run test:ci`)

### Change Log

- 2026-05-03: Implemented worker bootstrap, heartbeat logging loop, root React integration, and verification tests.
- 2026-05-03: Refactored client and worker for robustness after code review.
