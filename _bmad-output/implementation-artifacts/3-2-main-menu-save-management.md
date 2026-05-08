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
5. Localization: Support strings for "New Game", "Continue", "Are you sure?", and "Start New Career".

## Tasks / Subtasks

- [ ] UI Implementation
  - [ ] Create `src/presentation/ui/menu/MainMenu.tsx`.
  - [ ] Update `App.tsx` to render the `MainMenu` during the `BOOT` state.
  - [ ] Implement confirmation modal for "New Game".
- [ ] Logic Integration
  - [ ] Update `FlowService` or `DatabaseService` to check for existing save presence.
  - [ ] Add a `resetGame()` method to `DatabaseService` or equivalent.
  - [ ] Ensure `useSquadStore` is re-initialized correctly after a reset.
- [ ] Localization
  - [ ] Add keys to `src/core/services/i18n/locales/*.ts`.

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
(To be filled during implementation)

### File List
(To be filled during implementation)
