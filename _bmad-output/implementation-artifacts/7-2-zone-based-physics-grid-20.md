# Story 7.2: Zone-based Physics (Grid 20)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Engine,
I want to resolve ball movement across 20 zones,
so that progression is logical.

## Acceptance Criteria

1. Define a worker-safe 20-zone pitch model for the match engine, with stable zone identifiers and per-zone coefficients that can drive later action resolution.
2. Add a typed, Zod-validated match state structure that persists the current ball zone, possession team, clock primitives, and score in a single deterministic object.
3. Implement pure TypeScript progression logic that updates the ball zone per simulated tick or possession step without importing React, Phaser, or DOM APIs.
4. Ensure the worker can advance and emit the updated match state while keeping ball position persistent between updates.
5. Add Vitest coverage for zone transitions, invalid state rejection, and deterministic state progression in `src/domains/match/`.

## Tasks / Subtasks

- [x] **Zone Model Foundation** (AC: 1)
  - [x] Create a dedicated zone model under `src/domains/match/logic/` for the 20 pitch zones.
  - [x] Encode stable zone IDs and adjacency/progression rules instead of hardcoding transitions inline in the worker.
  - [x] Store zone coefficients in a dedicated config/module shape that can later feed xG and action selection.
- [x] **Match State Schema** (AC: 2)
  - [x] Create a worker-safe `MatchState` schema and exported TypeScript types using Zod.
  - [x] Include at minimum: `matchId`, `seed`, `minute`, `second`, `period`, `score`, `possessionTeam`, `ballZone`, and current phase primitives needed for progression.
  - [x] Keep the schema isolated from UI concerns and compatible with future persistence and commentary systems.
- [x] **Zone Progression Engine** (AC: 3, 4)
  - [x] Implement a pure logic function to initialize a deterministic match state with a starting zone.
  - [x] Implement a pure logic function that advances the ball from one zone to the next based on explicit rules for forward progression, retention, and turnover-ready outcomes.
  - [x] Integrate this progression into the worker loop without regressing the existing heartbeat or worker isolation guarantees.
- [x] **Worker Communication Contract** (AC: 4)
  - [x] Extend the worker/client message contract to carry typed match-state updates.
  - [x] Ensure the main thread can observe the evolving ball zone via logged or structured worker messages without introducing Phaser/React imports into the worker.
- [x] **Verification** (AC: 5)
  - [x] Add unit tests for valid zone graph construction and representative transitions from defensive to midfield to box zones.
  - [x] Add tests that reject malformed `MatchState` payloads or invalid zone IDs.
  - [x] Add deterministic progression tests proving identical inputs produce identical zone updates.

### Review Findings

- [x] [Review][Patch] Worker simulation seed is not reproducible [src/domains/match/worker/MatchWorker.ts:44]
- [x] [Review][Patch] MatchState is typed but not Zod-validated at simulation and worker message boundaries [src/domains/match/logic/MatchSimulation.ts:80]
- [x] [Review][Patch] MatchState numeric fields allow fractional/non-finite values [src/domains/match/logic/MatchState.ts:23]
- [x] [Review][Patch] Clock advancement loses overflow seconds when `second >= 60` [src/domains/match/logic/MatchSimulation.ts:93]
- [x] [Review][Patch] Zone lookup assumes runtime input is always valid [src/domains/match/logic/MatchZone.ts:191]
- [x] [Review][Patch] Worker simulation interval has no stop/reset path [src/domains/match/worker/MatchWorker.ts:50]
- [x] [Review][Patch] High-frequency `state_update` handling logs every worker tick at info level [src/domains/match/MatchWorkerClient.ts:38]
- [x] [Review][Patch] Tests do not cover invalid state rejection or full worker state payload shape [src/domains/match/logic/MatchSimulation.test.ts:67]

## Dev Notes

### Technical Requirements

- The current worker entry already exists at `src/domains/match/worker/MatchWorker.ts`; extend it rather than replacing the bootstrap established in Story 7.1.
- Keep business logic out of the worker entry file. Put reusable engine logic in `src/domains/match/logic/` and let the worker orchestrate it.
- Use strict TypeScript types end-to-end. No `any` in message payloads, zone definitions, or state transition functions.
- Validate new match engine state with Zod at boundaries so future persistence and replay systems can trust the structure.

### Architecture Compliance

- This story is the first real simulation-domain slice after worker bootstrap. The implementation must preserve the existing split:
  - Worker entry in `src/domains/match/worker/`
  - Main-thread client in `src/domains/match/MatchWorkerClient.ts`
  - Root bootstrap hook in `src/domains/match/hooks/useMatchWorker.ts`
- The worker remains pure TypeScript. Do not import React, Phaser, DOM APIs, or presentation-layer helpers.
- The simulation must model the match as a sequence of possessions/actions, not isolated per-minute random events.
- Ball location must live inside a single `MatchState` object and evolve incrementally. Do not compute position ad hoc in logs or UI code.

### Library / Framework Requirements

- Use **Vite module worker construction** already established in the repo. Official Vite guidance recommends `new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })` with the `new URL()` call used directly inside `new Worker(...)`.
- Worker messages must stay compatible with the browser structured clone algorithm. Keep payloads to clone-safe data structures: objects, arrays, strings, numbers, booleans, and plain nested records.
- Use existing project libraries only: TypeScript, Zod, Vitest, and the current logger/client infrastructure. Do not introduce Comlink or other worker abstractions.

### File Structure Requirements

- Preferred new files:
  - `src/domains/match/logic/MatchZone.ts`
  - `src/domains/match/logic/MatchState.ts`
  - `src/domains/match/logic/MatchSimulation.ts`
  - `src/domains/match/logic/*.test.ts`
- Expected touched files:
  - `src/domains/match/worker/MatchWorker.ts`
  - `src/domains/match/MatchWorkerClient.ts`
  - `src/domains/match/MatchWorkerClient.test.ts`
- If you introduce a config file for coefficients, keep it in `src/domains/match/logic/` or a clearly named worker-safe config location. Do not place simulation constants in React components or Phaser scenes.

### Testing Requirements

- Use Vitest for all tests and keep tests in `src/domains/match/` to preserve the coverage guardrails on this critical zone.
- Follow AAA structure explicitly. The test intent should be obvious from setup, action, and assertions.
- Add deterministic tests that verify:
  - the same seed/state input yields the same next zone,
  - invalid zone IDs or malformed state are rejected,
  - a match state update preserves ball zone continuity across successive steps.
- Prefer mocked timers when touching the worker loop. Keep CPU work per tick lightweight and avoid tests that rely on real timing.

### Previous Story Intelligence

- Story 7.1 already established the worker bootstrap, singleton client, root hook, typed heartbeat messaging, and worker error logging.
- Code review on 7.1 tightened the baseline:
  - `MatchWorkerClient` now has explicit error handling and warns on unknown message types.
  - `MatchWorker.ts` uses an explicit `start()` entrypoint and auto-starts only at module load.
  - The hook bootstrap pattern exists and should remain the single root entry for the worker lifecycle.
- Build on those patterns instead of bypassing them with a second worker, ad hoc polling, or UI-layer simulation code.

### Git Intelligence

- Recent commits are concentrated on Story 7.1 and earlier foundational stories (`6.1`, `1.1`). That indicates the repo is still laying infrastructure, not gameplay features.
- The implementation style so far favors:
  - small isolated files,
  - singleton core services,
  - explicit tests for edge cases,
  - story-by-story domain expansion rather than broad speculative scaffolding.
- Match this style: implement only the zone-grid foundation needed for Story 7.2, but shape it so Story 7.3 can attach xG and seeded resolution cleanly.

### Implementation Guardrails

- Do not use `Math.random()` anywhere in simulation logic. The project constitution requires a future `SeedService`/seeded source for deterministic behavior. If full seeded randomness is not yet available, keep this story deterministic via explicit rules and state-driven transitions rather than hidden randomness.
- Do not scatter coefficients as magic numbers throughout the resolver. Centralize them in a dedicated config object or table that Story 7.3 can extend.
- Do not overreach into commentary, coach choices, or final xG resolution. This story is about spatial progression and persistent ball position only.
- Do not mutate Zustand stores directly from simulation logic. The worker should emit typed messages; state orchestration remains outside the domain logic.

### Project Structure Notes

- The architecture document reserves `src/domains/match/logic/` for AI/xG/simulation code, but that directory does not exist yet in the repo. Creating it here is aligned with the planned structure, not a divergence.
- Current domain assets available for reuse:
  - `src/domains/match/worker/MatchWorker.ts`
  - `src/domains/match/MatchWorkerClient.ts`
  - `src/domains/shared/schemas/EntitySchemas.ts`
  - `src/core/services/registry/DomainRegistry.ts`
- There is no existing `SeedService`, `MatchConfig`, or `GameConfig.json` implementation in `src/` yet. Keep the story scoped so the developer does not invent a large randomness or configuration subsystem unless strictly needed.

### Project Context Rules

- Required stack for this story:
  - Phaser `3.90.0`
  - React `19.0.0`
  - TypeScript strict mode
  - Zod `3.22+`
  - Vitest `2.0+`
- Non-negotiable constraints:
  - All match simulation logic must stay in a dedicated Web Worker.
  - No React/Phaser imports in `match/worker/`.
  - `domains/` may depend on `core/`, but `core/` must remain domain-agnostic.
  - All inbound data structures must be Zod-validated.
  - No hidden randomness via `Math.random()`.
  - No magic-number sprawl; prefer a centralized config table for zone coefficients.
  - `domains/match/` must maintain 95%+ coverage under repo CI guardrails.

### Latest Technical Notes

- Vite official docs recommend the exact worker pattern already used in this repo: `new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })`, and note that worker detection only works when `new URL()` is used directly inside the `new Worker()` call.
- MDN documents that worker `postMessage()` payloads are transferred using the structured clone algorithm. Keep worker state update messages plain and serializable so they remain compatible across browser and worker boundaries.

### References

- [Source: _bmad-output/epics.md#Epic 07: Simulation x15 (Web Worker)]
- [Source: _bmad-output/gdd.md#Sports Game Specific Elements]
- [Source: _bmad-output/gdd.md#Match Structure (Sim-Engine)]
- [Source: _bmad-output/gdd.md#Technical Specifications]
- [Source: _bmad-output/game-architecture.md#Simulation Engine (Web Worker)]
- [Source: _bmad-output/game-architecture.md#Project Structure (src/)]
- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns (The Technical Constitution)]
- [Source: _bmad-output/project-context.md#Core Architectural Patterns]
- [Source: _bmad-output/project-context.md#Critical Implementation Rules]
- [Source: _bmad-output/algoritm.md#3. Zones du terrain]
- [Source: _bmad-output/algoritm.md#6. Boucle principale de simulation]
- [Source: _bmad-output/implementation-artifacts/7-1-worker-bootstrap-heartbeat.md]
- [Source: https://vite.dev/guide/features#web-workers]
- [Source: https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage]
- [Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Story implementation started from `ready-for-dev`.
- Created `src/domains/match/logic/MatchZone.ts` with 20-zone grid and coefficients.
- Created `src/domains/match/logic/MatchState.ts` with Zod schema.
- Created `src/domains/match/logic/MatchSimulation.ts` with deterministic transition logic.
- Created `src/utils/Random.ts` with Mulberry32 PRNG.
- Updated `src/domains/match/worker/MatchWorker.ts` to include simulation loop emitting `state_update`.
- Updated `src/domains/match/MatchWorkerClient.ts` to handle and log state updates.
- Fixed `src/domains/match/worker/MatchWorker.test.ts` to account for concurrent message types.
- All tests passed with 100% success rate in `src/domains/match/`.
- Addressed code review findings: stable worker seed, runtime Zod boundary validation, stricter numeric schemas, exact clock rollover, guarded zone lookup, explicit worker `stop()`, debug-level state update logging, and negative validation tests.

### Completion Notes List

- Implemented the full 20-zone pitch model with deterministic progression.
- Ensured strict worker isolation and message typing.
- Validated implementation with comprehensive Vitest suite.
- Code review patches resolved and validated with scoped ESLint, match-domain Vitest, full `test:ci`, and production build.

### File List

- src/domains/match/logic/MatchZone.ts (new)
- src/domains/match/logic/MatchState.ts (new)
- src/domains/match/logic/MatchSimulation.ts (new)
- src/domains/match/logic/MatchSimulation.test.ts (new)
- src/utils/Random.ts (new)
- src/domains/match/worker/MatchWorker.ts (modified)
- src/domains/match/MatchWorkerClient.ts (modified)
- src/domains/match/MatchWorkerClient.test.ts (modified)
- src/domains/match/worker/MatchWorker.test.ts (modified)
- _bmad-output/implementation-artifacts/7-2-zone-based-physics-grid-20.md (modified)

### Change Log

- Initial implementation of Story 7.2 (Date: 2026-05-03)
- 2026-05-03: Addressed all code review findings and marked story done.
