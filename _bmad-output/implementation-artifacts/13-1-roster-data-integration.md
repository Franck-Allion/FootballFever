# Story 13.1: Roster Data & Store Integration

Status: done

## Story

As a Manager,
I want a real squad of 20-25 players with distinct stats and rarities,
so that my tactical choices matter and I can start optimizing my "build".

## Acceptance Criteria

1. [x] Implement `PlayerFactory.ts` to generate players with randomized stats (0-100) and rarities (Common to Legendary) based on weights.
2. [x] Initialize `useSquadStore` with a starting roster of 22 players (balanced positions).
3. [x] Update `HubScreen.tsx` to display real player names from the store in the "Composition" and "Remplaçants" sections.
4. [x] Integrate basic rarity colors in the UI (Common: Gray, Rare: Blue, Epic: Purple, Legendary: Gold).
5. [x] Ensure the roster is persistent (Zustand persist).

## Tasks / Subtasks

- [x] Setup Player Generation
  - [x] Create `src/domains/shared/services/PlayerFactory.ts`.
  - [x] Implement `generateRandomPlayer()` with statistical distribution favoring Common/Rare.
  - [x] Implement `generateInitialSquad()` to ensure a balanced starting team.
- [x] Store Integration
  - [x] Update `useSquadStore.ts` to call `PlayerFactory` on first initialization.
  - [x] Ensure `roster` property is correctly populated and typed.
- [x] UI Update
  - [x] Modify `HubScreen.tsx` to read `roster` instead of hardcoded constants.
  - [x] Implement a logic to pick the "best 11" for the visual display based on stats total.
  - [x] Map player rarities to CSS classes for visual hierarchy.

## Dev Notes

- **Rarity Weights:** Common (70%), Rare (20%), Epic (8%), Legendary (2%).
- **Visuals:** Rarity colors follow Obsidian Athletics palette with soft glow for high rarities.
- **Architecture:** `PlayerFactory` is a singleton service in `domains/shared/services`.

### Project Context Rules

- **SOLID:** Factory pattern used for player creation.
- **Types:** Strictly using `Player` type from `EntitySchemas.ts`.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (Context Engine)

### Debug Log References
- Fixed TS types in `useSquadStore.ts` (explicit accumulator type in reduce).
- Fixed TS types in `HubScreen.tsx` (explicit stat access for total score calculation).
- Verified `tsc` compilation (no new errors introduced in modified files).

### Completion Notes List
- Implemented `PlayerFactory` for dynamic squad generation.
- Initialized `useSquadStore` with 22 random players.
- Updated `HubScreen` to display real roster with rarity-based styling.
- Successfully transitioned Hub from static mockup to data-driven interface.

### File List
- `src/domains/shared/services/PlayerFactory.ts` (New)
- `src/domains/shared/store/useSquadStore.ts` (Modified)
- `src/presentation/ui/hub/HubScreen.tsx` (Modified)
