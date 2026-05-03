# Story 7.3: xG & Deterministic Resolution

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Balancer,
I want shots resolved via xG and SeededRandom,
so that results are repeatable.

## Acceptance Criteria

1. Implement a deterministic xG calculation logic based on zone coefficients (`shootValue`, `distanceToGoal`) and attacking team stats.
2. Extend `MatchState` to include basic match statistics (shots, shots on target, xG, goals) for both teams.
3. Integrate a "Shot" action into the simulation loop that triggers based on zone danger and a deterministic roll.
4. Ensure all resolution outcomes (Goal, Save, Off-target) are purely deterministic using the `Mulberry32` PRNG and tick-based seeding.
5. Prove determinism via Vitest: identical seed and team stats must produce the exact same final score and statistics.

## Tasks / Subtasks

- [x] **Statistic Accumulator** (AC: 2)
  - [x] Update `MatchStateSchema` in `src/domains/match/logic/MatchState.ts` to include `homeStats` and `awayStats` (shots, xG, goals, etc.).
  - [x] Ensure the initial state factory initializes these counters to zero.
- [x] **Deterministic Resolver Engine** (AC: 1, 3, 4)
  - [x] Implement `calculateXG` function in `src/domains/match/logic/MatchSimulation.ts` using zone coefficients.
  - [x] Add "Shoot" as a possible action in the probability table (Section 15 of algoritm.md).
  - [x] Implement `resolveShot` logic to determine the outcome (Goal/Save/Miss) using deterministic rolls.
  - [x] Update `advanceMatchState` to handle shot resolution and update statistics accordingly.
- [x] **Seeded Resolution Verification** (AC: 5)
  - [x] Add unit tests in `src/domains/match/logic/MatchSimulation.test.ts` verifying that two matches with the same seed produce identical results.
  - [x] Add tests for xG accuracy (e.g., shooting from the box produces higher xG than from midfield).
  - [x] Add tests ensuring statistics (shots, goals) are correctly accumulated in the `MatchState`.

### Review Findings

- [x] [Review][Patch] xG ignores required `distanceToGoal` and attacking team stats [src/domains/match/logic/MatchSimulation.ts:15]
- [x] [Review][Patch] Shot outcome thresholds can make off-target outcomes unreachable in dangerous zones [src/domains/match/logic/MatchSimulation.ts:59]
- [x] [Review][Patch] `GOAL_KICK` can produce an impossible shot before phase normalization [src/domains/match/logic/MatchSimulation.ts:123]
- [x] [Review][Patch] Miss/save restart zones are reversed after possession flips [src/domains/match/logic/MatchSimulation.ts:63]
- [x] [Review][Patch] `calculateXG` can return negative or NaN values for invalid shooting skill input [src/domains/match/logic/MatchSimulation.ts:15]
- [x] [Review][Patch] MatchState accepts contradictory score and team goal totals [src/domains/match/logic/MatchState.ts:27]
- [x] [Review][Patch] Determinism test covers only a partial match and does not prove final score/stat determinism [src/domains/match/logic/MatchSimulation.test.ts:7]
- [x] [Review][Patch] Stats/outcome tests are too weak and do not force shot, goal, save, miss, or stat invariant coverage [src/domains/match/logic/MatchSimulation.test.ts:24]
- [x] [Review][Patch] xG/action thresholds are hardcoded in simulation logic instead of centralized config [src/domains/match/logic/MatchSimulation.ts:18]

## Dev Notes

### Technical Requirements

- Use the `createPRNG` utility from `src/utils/Random.ts` for all simulation randomness.
- No `Math.random()` allowed in any resolution function.
- All resolution logic must be "pure" (state in -> state out).
- Follow the xG formulas suggested in `algoritm.md` Section 16 as a baseline.

### Architecture Compliance

- Maintain the Web Worker isolation: no Phaser or DOM access during resolution.
- Logic stays in `src/domains/match/logic/`.
- `MatchWorker.ts` continues to orchestrate the simulation via `advanceMatchState`.

### Project Structure Notes

- Touch `src/domains/match/logic/MatchState.ts` to expand the schema.
- Touch `src/domains/match/logic/MatchSimulation.ts` to implement resolution logic.
- Update `src/domains/match/logic/MatchSimulation.test.ts` for verification.

### Project Context Rules

- **Testing :** Vitest v2.0+ mandatory. 95% coverage on `src/domains/match/`.
- **Validation :** Zod schemas for all inbound/outbound state.
- **Randomness :** Deterministic seedable RNG only.

### References

- [Source: _bmad-output/algoritm.md#2. État complet du match]
- [Source: _bmad-output/algoritm.md#4. Statistiques de match à produire]
- [Source: _bmad-output/algoritm.md#16. Réalisme des tirs]
- [Source: _bmad-output/project-context.md#Testing Rules (Vitest Mandatory)]
- [Source: _bmad-output/project-context.md#🚫 Critical Anti-Patterns (Zero Tolerance)]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Story implementation started from `ready-for-dev`.
- Updated `MatchStateSchema` to include `MatchStats`.
- Implemented `calculateXG` and `resolveShot` in `MatchSimulation.ts`.
- Updated `advanceMatchState` to handle shot actions and possession tracking.
- Updated `MatchWorkerClient` to log new stats.
- Added comprehensive tests for determinism and xG correctness.
- All tests passed.
- Addressed code review findings: xG now uses `shootValue`, `distanceToGoal`, and team shooting ratings; shot thresholds are centralized; goal/save/miss outcomes are all reachable and tested; goal-kick phase no longer fires shots; restart zones and score/stat invariants are validated; determinism is proven through full match completion.

### Completion Notes List

- Achieved 100% determinism in match resolution.
- Integrated xG calculation based on zone coefficients.
- Added statistics accumulation for both teams.
- Code review patches resolved and validated with scoped ESLint, match-domain Vitest, full `test:ci`, and production build.

### File List

- src/domains/match/logic/MatchState.ts (modified)
- src/domains/match/logic/MatchSimulation.ts (modified)
- src/domains/match/logic/MatchSimulation.test.ts (modified)
- src/domains/match/MatchWorkerClient.ts (modified)
- src/domains/match/MatchWorkerClient.test.ts (modified)
- src/domains/match/worker/MatchWorker.ts (modified)
- src/domains/match/worker/MatchWorker.test.ts (modified)
- _bmad-output/implementation-artifacts/7-3-xg-deterministic-resolution.md (modified)

### Change Log

- 2026-05-03: Addressed all code review findings and marked story done.
