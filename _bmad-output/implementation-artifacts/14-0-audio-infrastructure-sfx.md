# Story 14.0: Audio Infrastructure & Tactical SFX

Status: ready-for-dev

## Story

As a Tactician,
I want to hear satisfying sound effects when I interact with the lineup (drag, drop, swap),
so that the squad management phase feels tactile, responsive, and high-quality.

## Acceptance Criteria

1. Implement a centralized `AudioService.ts` (singleton) to manage sound asset loading and playback.
2. Integrate a "pickup" SFX when starting to drag a player chip in `TacticsScreen.tsx`.
3. Integrate a "placed" SFX when successfully dropping a player onto a pitch or bench slot.
4. Integrate a distinct "swap" SFX when two players trade places.
5. Ensure audio does not stutter or overlap incorrectly during rapid interactions.
6. Support for basic volume management (hardcoded constant is acceptable for MVP).
7. Audio assets must be loaded efficiently (pre-loaded or lazy-loaded without blocking UI).

## Tasks / Subtasks

- [ ] Core Infrastructure
  - [ ] Create `src/core/services/audio/AudioService.ts`.
  - [ ] Implement asset mapping for UI sound events.
  - [ ] Ensure cleanup of audio resources on service destruction/unload.
- [ ] UI Integration
  - [ ] Hook into `@dnd-kit` drag start/end events in `TacticsScreen.tsx`.
  - [ ] Call `AudioService.play('ui_pickup')` on drag start.
  - [ ] Call `AudioService.play('ui_place')` or `'ui_swap'` on drag end based on outcome.
- [ ] Asset Preparation
  - [ ] Identify or generate 3-4 distinct UI sound clips (wav/mp3/ogg).
  - [ ] Add assets to `public/assets/audio/`.

## Dev Notes

- **Game Feel:** The sounds should be "short, punchy, and metallic/digital" to match the Obsidian Athletics theme.
- **Service Pattern:** Use the same singleton/service locator pattern used by `LocalizationService`.
- **Mobile:** Ensure compatibility with mobile web audio restrictions (interact-to-unlock audio context).

### Project Context Rules

- **SOLID:** Separate audio management from UI components.
- **Performance:** Do not block the main thread with heavy asset loading.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes List
(To be filled during implementation)

### File List
(To be filled during implementation)
