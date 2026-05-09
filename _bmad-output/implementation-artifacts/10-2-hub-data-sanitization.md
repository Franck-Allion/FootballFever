# Story 10.2: Hub Data Sanitization & Dynamic Calendar

Status: ready-for-dev

## Story

As a Manager,
I want the Hub to display accurate information about my team's recent form and upcoming matches,
so that I can trust the interface and plan my tactical rotations effectively.

## Acceptance Criteria

1. **Streak Reset**: The `streak` array in `useSquadStore` must be initialized as empty `[]` for new games.
2. **Dynamic Calendar**: Replace the static `routeNodes` array with a generated sequence of at least 5 nodes (Matches and Rest periods).
3. **Team Identity**: Ensure `teamName` and `teamLogo` are not hardcoded but can be initialized/updated.
4. **Data Synchronization**: All team-level averages (stamina, morale) shown in the Hub must be strictly derived from the store's current state, without any fallback to mock values.
5. **Localization**: Localize all labels in the Hub sections (e.g., "Série en cours", "Moral de l'équipe", "Fatigue") using the translation system.

## Tasks / Subtasks

- [ ] **Store Sanitization**
  - [ ] Reset initial state for `streak`, `routeNodes`, and `activeSynergies` in `useSquadStore.ts`.
  - [ ] Implement a `generateCalendar()` utility to populate `routeNodes` dynamically.
- [ ] **UI Connection**
  - [ ] Update `HubScreen.tsx` to handle empty streaks gracefully (e.g., display "N/A" or empty slots).
  - [ ] Localize hardcoded strings in `HubScreen.tsx`.
- [ ] **Integration**
  - [ ] Ensure `initializeRoster(true)` also resets the calendar and streak.

## Dev Notes

- **Calendar Logic:** For the MVP, a simple array of 3 matches and 2 rest periods is sufficient, but it should be generated, not hardcoded.
- **Visuals:** Empty streak slots should maintain the "dark glass" styling to avoid visual layout shifts.

### Project Context Rules

- **Zod Compliance:** Any changes to the store structure must match the `GameStateSchema`.
- **Localization Invariants:** GEMINI.md 9 & 11 apply: no hardcoded French strings in the JSX.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes List
(To be filled during implementation)

### File List
(To be filled during implementation)
