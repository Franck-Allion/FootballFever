## Deferred from: code review of 8-1-batch-simulator-tool.md (2026-05-03)

- Zod validation performance overhead: The match engine performs Zod validation on every tick, which becomes a bottleneck in large batch simulations. This is an engine-level architecture pattern.
- Synchronous large batch UI blocking: Large batches run synchronously, which could block the main thread. Asynchronous execution or chunking was not in scope for this pure logic story.

## Deferred from: code review of 23-1-tauri-desktop-build.md (2026-05-04)

- Pre-existing Test Failures in Domain Registry: Tests in `src/domains/shared/registry/DomainRegistry.test.ts` were failing before the Tauri changes due to missing required schema fields in player fixtures.

## Deferred from: code review of 13-2-dynamic-team-rating-calculator.md (2026-05-04)

- Data Migration for Team Roster: The change from `string[]` (IDs) to `Player[]` in `Team.roster` requires a database migration or a strategy to handle existing saves that only have IDs.

## Deferred from: code review (2026-05-06)

- Brittle type checking (`as never`): Usage of `as never` in `TacticsScreen.tsx` for `useDraggable`/`useDroppable` bypassing type safety. Deferred as it is a common pre-existing workaround for `dnd-kit`.
- Magic number dependencies: Unconfigured efficiency multipliers (1.0, 0.85, 0.5, 0.25) in `LineupService.ts` are hardcoded. Deferred as these were introduced intentionally for this iteration.
