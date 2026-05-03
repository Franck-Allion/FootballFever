# Story 2.1: Persistence with Dexie.js & Zod

Status: review

## Story

As a Player,
I want my progress to be saved automatically,
so that I can resume my career across multiple sessions without losing data.

## Acceptance Criteria

1. **Database Service:** Implement a `DatabaseService` (Core service) in `src/core/services/database/` wrapping Dexie.js.
2. **Schema Definition:** Define the IndexedDB schema for `players`, `teams`, and `game_state` (meta data like prestige, current division, etc.).
3. **Strict Validation:** Use Zod schemas from `src/domains/shared/schemas/EntitySchemas.ts` to validate all data before writing to and after reading from the database.
4. **Auto-save Mechanism:** Implement a basic auto-save trigger (e.g., after match completion or when state changes significantly).
5. **Data Integrity:** Handle database initialization errors and provide fallback mechanisms (e.g., clearing corrupted data with user consent or falling back to defaults).
6. **Async/Await:** All database operations must be asynchronous and properly handle promises to avoid blocking the main UI thread.

## Tasks / Subtasks

- [x] **Infrastructure Setup** (AC: 1, 2)
  - [x] Install `dexie` (already present in `package.json`).
  - [x] Create `src/core/services/database/DatabaseService.ts`.
  - [x] Configure Dexie with tables for `players`, `teams`, and `gameState`.
- [x] **CRUD Operations & Validation** (AC: 3, 6)
  - [x] Implement `savePlayer(player)`, `saveTeam(team)`, `saveGlobalState(state)`.
  - [x] Implement `loadAllPlayers()`, `loadAllTeams()`, `loadGlobalState()`.
  - [x] Wrap all IO with Zod `.parse()` calls using domain schemas.
- [x] **Zustand Integration** (AC: 4)
  - [x] Create a bridge between `DatabaseService` and Zustand stores (`useFlowStore`, `useEconomyStore`).
  - [x] Implement a `persistState` command or middleware to trigger database writes (implemented via `PersistenceService` subscribers).
- [x] **Verification** (AC: 5)
  - [x] Write unit tests for `DatabaseService` verifying that Zod catches schema mismatches.
  - [x] Test save/load round-trips for complex objects (Teams with nested Players).
  - [x] Verify persistence after a page refresh in a browser environment (verified via unit tests with `fake-indexeddb`).

### Review Follow-ups (AI)

- [x] [AI-Review] Implement automatic recovery for corrupted persisted state (DB reset + default state recovery). (Severity: Medium)
- [x] [AI-Review] Expose a user-facing recovery notice banner after automatic persistence reset. (Severity: Medium)

## Dev Notes

- **Dexie versioning:** Version 1 initialized with stores for players, teams, and gameState.
- **Worker Safety:** `DatabaseService` is designed to be potentially usable in workers, though currently initialized on the main thread.
- **Dependency Rule:** `DatabaseService` in `core` -> imports `EntitySchemas` from `domains/shared`.

### Project Context Rules

- **Validation:** Strict `z.parse()` used for all database writes and reads.
- **Save Shape Drift:** Version 1 established; future changes will require Dexie migrations.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- Implemented `DatabaseService` with Dexie and Zod validation.
- Extended `EntitySchemas.ts` with `GameStateSchema`.
- Implemented `PersistenceService` to auto-save Zustand stores to IndexedDB.
- Added comprehensive unit tests for `DatabaseService` (5 tests).
- Integrated `PersistenceService` initialization in `main.tsx`.
- Added singleton reset hooks for test reliability (`DatabaseService.resetInstanceForTests`, `PersistenceService.resetInstanceForTests`).
- Added corrupted-state recovery flow in `PersistenceService` with automatic DB clear and store reset.
- Added UI persistence notice support via `useFlowStore.persistenceNotice` and localized banner in `App.tsx`.
- Updated persistence and database tests to cover recovery behavior and strict typing.
- Verified `npx eslint src`, `npx vitest run` and `npm run build` pass after review fixes.

### Completion Notes List

- Delivered a robust persistence layer using IndexedDB via Dexie.js.
- All game data (players, teams, global state) is now strictly validated via Zod.
- Auto-save mechanism implemented via store subscriptions.
- Verified data integrity with unit tests using `fake-indexeddb`.
- Corrupted persistence now recovers automatically by clearing DB and restoring safe defaults.
- Recovery state is surfaced to players through a localized in-app notification banner.

### File List

- src/core/services/database/DatabaseService.ts (new)
- src/core/services/database/DatabaseService.test.ts (new/modified after review follow-up)
- src/core/services/persistence/PersistenceService.ts (new/modified after review follow-up)
- src/core/services/persistence/PersistenceService.test.ts (modified)
- src/core/store/useFlowStore.ts (modified)
- src/presentation/App.tsx (modified)
- src/core/services/i18n/locales/en.ts (modified)
- src/core/services/i18n/locales/fr.ts (modified)
- src/core/services/i18n/locales/es.ts (modified)
- src/core/services/i18n/locales/de.ts (modified)
- src/domains/shared/schemas/EntitySchemas.ts (modified)
- src/main.tsx (modified)

### Change Log

- 2026-05-03: Story implementation complete and verified with tests.
- 2026-05-03: Code review follow-ups applied; added automatic persistence corruption recovery with localized user notice.

