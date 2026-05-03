# Story 8.1: Batch Simulator Tool

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Balancer,
I want to run many deterministic matches without UI,
so that match realism and statistical invariants can be validated before tuning.

## Acceptance Criteria

1. Add a pure TypeScript batch simulation utility that can run a configurable number of complete matches without React, Phaser, DOM, Web Worker timers, or persistence.
2. The utility must reuse the existing match engine entry points (`createInitialMatchState`, `advanceMatchState`, `MatchStateSchema`) rather than duplicating match resolution logic.
3. The utility must return aggregate metrics for at least: match count, home/away/total goals, shots, shots on target, xG, possession seconds, average goals per match, average shots per team, average shots on target per team, average xG per team, home win rate, draw rate, and away win rate.
4. The utility must report invariant failures per match without silently swallowing them. Required invariants: final states validate with Zod; score equals goals; shots on target is never greater than shots; goals are never greater than shots on target; xG is finite and non-negative; total possession seconds does not exceed the simulated match duration by more than one tick.
5. Running the same batch configuration twice must produce identical aggregate results and identical invariant results.
6. Add Vitest coverage proving deterministic output, schema validation, invariant detection, and a small batch smoke run. Tests must not depend on wall-clock time, timers, worker startup, or `Math.random()`.

## Tasks / Subtasks

- [x] **Batch Simulation Core** (AC: 1, 2, 3)
  - [x] Create `src/domains/match/logic/BatchSimulator.ts`.
  - [x] Define a Zod-validated `BatchSimulationConfig` with `matchCount`, `baseSeed`, optional `homeRating`, optional `awayRating`, and optional `maxTicksPerMatch`.
  - [x] Implement `runBatchSimulation(config)` as a pure function that loops complete matches by repeatedly calling `advanceMatchState`.
  - [x] Use deterministic seed derivation such as `baseSeed + matchIndex`; do not use `Math.random()`, dates, timers, or worker state.
  - [x] Return both per-match summaries and aggregate metrics so future balancing tools can inspect outliers.
- [x] **Invariant Validation** (AC: 4)
  - [x] Add a small invariant checker in the same module or a sibling `MatchInvariants.ts` if the logic becomes large.
  - [x] Validate each final `MatchState` with `MatchStateSchema.safeParse`.
  - [x] Emit structured invariant failures containing `matchIndex`, `matchId`, `code`, and a short message.
  - [x] Do not throw for normal invariant failures in a batch run; reserve throws for invalid batch configuration or impossible loop protection.
- [x] **Loop Safety and Performance Guardrails** (AC: 1, 4)
  - [x] Default `maxTicksPerMatch` high enough for the current 5-second tick, 90-minute match model, and future stoppage-time expansion.
  - [x] If a match exceeds `maxTicksPerMatch`, return or throw a structured failure that identifies the match seed and current clock.
  - [x] Keep the module free of React, Phaser, Worker, LoggerService, Dexie, Zustand, and DOM imports.
- [x] **Automated Tests** (AC: 5, 6)
  - [x] Create `src/domains/match/logic/BatchSimulator.test.ts`.
  - [x] Test that two identical batch configs produce deep-equal results.
  - [x] Test aggregate calculations with a small deterministic batch, e.g. 3-10 matches.
  - [x] Test invariant detection against a deliberately invalid or contradictory final state by exporting a focused invariant helper for tests.
  - [x] Test that invalid config values are rejected, e.g. zero/negative/non-integer `matchCount`, non-finite seeds, invalid team ratings.

## Dev Notes

### Current Engine Context

- The match simulation already exists in `src/domains/match/logic/MatchSimulation.ts`.
- `advanceMatchState(state)` is the canonical pure tick function. Do not create a second match simulator for batch runs.
- `createInitialMatchState(params)` in `src/domains/match/logic/MatchState.ts` initializes the canonical state shape, including `homeStats`, `awayStats`, `homeRating`, and `awayRating`.
- `MatchStateSchema` already validates zone IDs, clock shape, scores, stats, ratings, phase, completion status, and score-goal consistency.
- Randomness currently flows through `src/utils/Random.ts#createPRNG` inside the simulation logic. The batch tool should only vary seeds deterministically.

### Required Data Shape

Recommended exported types:

```ts
export interface BatchMatchSummary {
  matchIndex: number;
  matchId: string;
  seed: number;
  finalState: MatchState;
  invariantFailures: MatchInvariantFailure[];
  ticksSimulated: number;
}

export interface BatchSimulationResult {
  config: BatchSimulationConfig;
  matches: BatchMatchSummary[];
  aggregates: BatchSimulationAggregates;
  invariantFailures: MatchInvariantFailure[];
}
```

Keep aggregate numbers unrounded internally. UI/reporting layers can round later.

### Invariants to Encode

- `MatchStateSchema.safeParse(finalState).success === true`.
- `finalState.score.home === finalState.homeStats.goals`.
- `finalState.score.away === finalState.awayStats.goals`.
- For each team: `shotsOnTarget <= shots`.
- For each team: `goals <= shotsOnTarget`.
- For each team: `Number.isFinite(xG) && xG >= 0`.
- `homeStats.possessionSeconds + awayStats.possessionSeconds <= 90 * 60 + tickToleranceSeconds`.
- If `finalState.isComplete` is false after `maxTicksPerMatch`, record a loop safety failure.

### Architecture Compliance

- Keep all implementation under `src/domains/match/logic/`; this is the architecture-approved location for pure match AI/xG/simulation code.
- The batch utility is domain logic, not presentation. It must not import from `presentation/`, React, Phaser, worker files, hooks, stores, or services.
- Do not add a CLI dependency such as `tsx` just for this story. A pure exported function plus Vitest coverage is sufficient and keeps the tool reusable by future UI/CI layers.
- No persistence or save schema changes are required.
- No live-feed, commentary, coach-choice, or balancing UI is in scope.

### Previous Story Intelligence

- Story 7.3 completed deterministic shot resolution and added final-score/stat determinism tests.
- Review patches from Story 7.3 fixed several issues that the batch simulator must preserve:
  - xG must use zone coefficients and team shooting ratings.
  - Goal/save/miss outcomes must remain reachable and deterministic.
  - `GOAL_KICK` must not produce an immediate impossible shot.
  - Miss/save restart zones must stay consistent with possession flips.
  - Score and stats goals must remain synchronized through `MatchStateSchema`.
- Existing tests prove one full match is deterministic; this story extends that guarantee across multiple seeds and aggregate outputs.

### Testing Requirements

- Use Vitest only. Follow the existing AAA style in `MatchSimulation.test.ts`.
- Prefer scoped validation first: `npm test -- --run src/domains/match/logic`.
- Before marking implementation complete, run `npm run test:ci` and `npm run build`.
- If running full ESLint, note that `src` currently has unrelated pre-existing lint issues outside the match domain; do not fix unrelated files in this story.

### Project Context Rules

- TypeScript strict mode is mandatory.
- Zod validation is mandatory for incoming or externally supplied data structures.
- Business logic must stay out of UI stores.
- Hidden randomness is forbidden; never use `Math.random()` in domain logic.
- Magic-number-like tuning values should be centralized in config constants in the module.
- Match worker isolation must be preserved; do not import worker/timer orchestration into pure simulation logic.
- `domains/match/` is a critical coverage area and should maintain very high unit-test coverage.

### References

- [Source: _bmad-output/epics.md#Epic 08: Batch Simulator & Invariants]
- [Source: _bmad-output/gdd.md#Match Structure (Sim-Engine)]
- [Source: _bmad-output/gdd.md#Risk Factors]
- [Source: _bmad-output/algoritm.md#22. Tests automatiques indispensables]
- [Source: _bmad-output/algoritm.md#4. Statistiques de match a produire]
- [Source: _bmad-output/project-context.md#Match Engine Isolation (Web Worker)]
- [Source: _bmad-output/project-context.md#Testing Rules (Vitest Mandatory)]
- [Source: src/domains/match/logic/MatchSimulation.ts]
- [Source: src/domains/match/logic/MatchState.ts]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Implemented `runBatchSimulation` in `src/domains/match/logic/BatchSimulator.ts`.
- Added invariant checking for score consistency, shooting stats, xG validity, and possession overflow.
- Included loop safety guardrail with `maxTicksPerMatch`.
- Achieved full determinism across multiple matches.
- All tests passed with 100% success rate.

### Completion Notes List

- Pure TS batch simulator added to `src/domains/match/logic/`.
- Integrated aggregate metrics (win rates, averages).
- Structured invariant reporting implemented.

### File List

- src/domains/match/logic/BatchSimulator.ts (new)
- src/domains/match/logic/BatchSimulator.test.ts (new)
- _bmad-output/implementation-artifacts/8-1-batch-simulator-tool.md (modified)

### Review Findings

- [x] [Review][Patch] Safety limit for matchCount to prevent OOM [src/domains/match/logic/BatchSimulator.ts:11]
- [x] [Review][Patch] Seed calculation overflow protection [src/domains/match/logic/BatchSimulator.ts:129]
- [x] [Review][Patch] Match loop error handling (try/catch) [src/domains/match/logic/BatchSimulator.ts:134]
- [x] [Review][Patch] Missing averageShotsOnTargetPerTeam metric [src/domains/match/logic/BatchSimulator.ts:40]
- [x] [Review][Patch] Possession tolerance correction (5s) [src/domains/match/logic/BatchSimulator.ts:109]
- [x] [Review][Patch] Missing team ratings in config schema [src/domains/match/logic/BatchSimulator.ts:8]
- [x] [Review][Patch] Export checkInvariants helper for testing [src/domains/match/logic/BatchSimulator.ts:74]
- [x] [Review][Patch] Incomplete invariant test coverage [src/domains/match/logic/BatchSimulator.test.ts]
- [x] [Review][Patch] Possession underflow invariant check [src/domains/match/logic/BatchSimulator.ts:109]
- [x] [Review][Defer] Zod validation performance overhead [src/domains/match/logic/BatchSimulator.ts:134] — deferred, pre-existing engine pattern
- [x] [Review][Defer] Synchronous large batch UI blocking [src/domains/match/logic/BatchSimulator.ts:128] — deferred, out of scope for pure logic story
