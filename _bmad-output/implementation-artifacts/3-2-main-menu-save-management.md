# Story 3.2: Main Menu & Save Management

Status: ready-for-dev

## Story

As a Player,
I want a Main Menu where I can choose to start a fresh career or continue my current progress,
so that I have full control over my game sessions and can experiment with new team generations.

## Acceptance Criteria

1. Replace the current "Press Start" button on the BOOT screen with a formal Main Menu.
2. Provide a "Continue" button that is only enabled if an existing save is detected in IndexedDB.
3. Provide a "New Game" button that:
   - Displays a confirmation dialog (to prevent accidental data loss).
   - Clears existing IndexedDB data.
   - Triggers a new squad generation (via `PlayerFactory`).
   - Navigates to the HUB.
4. Ensure the visual style matches the "Obsidian Athletics" theme (neon green accent, dark glass panels).
## Tasks / Subtasks

- [x] UI Implementation
  - [x] Create `src/presentation/ui/menu/MainMenu.tsx`.
  - [x] Update `App.tsx` to render the `MainMenu` during the `BOOT` state.
  - [x] Implement confirmation modal for "New Game".
- [x] Logic Integration
  - [x] Update `FlowService` or `DatabaseService` to check for existing save presence.
  - [x] Add a `resetGame()` method to `DatabaseService` or equivalent.
  - [x] Ensure `useSquadStore` is re-initialized correctly after a reset.
- [x] Localization
  - [x] Add keys to `src/core/services/i18n/locales/*.ts`.

## Dev Notes

- **Persistence:** Use `DatabaseService.getInstance().hasSave()` to toggle the "Continue" button.
- **Visuals:** The menu should feel high-impact. Consider using the "FOOTBALL FEVER" italicized logo prominently.

### Project Context Rules

- **FSM:** Transitions should still follow the `BOOT -> HUB` pattern, but with data reset logic in between.
- **Safety:** Data destruction must always be gated by a user confirmation.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes List
- Created `MainMenu.tsx` with "Obsidian Athletics" design theme.
- Implemented conditional "Continue" button based on `DatabaseService.hasSave()`.
- Implemented "New Career" button with a red confirmation modal to prevent accidental data loss.
- Updated `App.tsx` to replace the static "Press Start" button with the `MainMenu`.
- Added `hasSave()` and `clearAll()` (as reset) to `DatabaseService`.
- Integrated `initializeRoster(true)` in the New Game flow to ensure fresh squad generation.
- Fully localized the menu and confirmation dialog across FR, EN, ES, and DE.
- Verified 168/168 tests pass (including Zod schema validation for new locale keys).

### File List
- `src/presentation/ui/menu/MainMenu.tsx` (New)
- `src/core/services/database/DatabaseService.ts` (Modified)
- `src/presentation/App.tsx` (Modified)
- `src/core/services/i18n/locales/Schema.ts` (Modified)
- `src/core/services/i18n/locales/fr.ts` (Modified)
- `src/core/services/i18n/locales/en.ts` (Modified)
- `src/core/services/i18n/locales/es.ts` (Modified)
- `src/core/services/i18n/locales/de.ts` (Modified)

### Change Log
- 2026-05-09: Initial implementation and localization of Main Menu and Save Management logic.

### Review Findings

- [x] [Review][Decision] Direct state mutation bypassing Command Pattern — Résolu : Création du `CommandBus` et de `ResetGameCommand`.
- [x] [Review][Patch] Hardcoded UI strings in Main Menu [src/presentation/ui/menu/MainMenu.tsx] — Résolu.
- [x] [Review][Patch] Missing localization keys for confirmation flow [src/core/services/i18n/locales/Schema.ts] — Résolu.
- [x] [Review][Patch] `hasSave` and `clearAll` lack error handling [src/core/services/database/DatabaseService.ts] — Résolu.
- [x] [Review][Patch] "New Game" flow does not clear non-squad stores [src/presentation/App.tsx] — Résolu via `ResetGameCommand`.

Status: done

