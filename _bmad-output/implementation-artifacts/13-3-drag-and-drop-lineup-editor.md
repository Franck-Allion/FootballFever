# Story 13.3: Drag & Drop Lineup Editor

Status: done

## Story

As a Coach,
I want to choose my formation, game instruction, starting lineup, and bench through a drag-and-drop tactics interface,
so that I can optimize the active squad before a match and immediately see how tactical choices affect team strength.

## Acceptance Criteria

1. Clicking the Tactics tile in `HubScreen.tsx` opens a dedicated tactics/lineup management interface that visually matches the current Hub theme.
2. The interface lets the player choose a formation. Changing formation updates the pitch layout and the available drag-and-drop field slots.
3. The interface lets the player choose a game instruction such as high press, low block, balanced, wing play, or direct transition.
4. Players can be dragged from the squad list to a pitch slot. Dropping a player onto a pitch slot makes him a starter in that slot.
5. Players can be dragged from the squad list or pitch to the bench. The bench has exactly 5 slots, including exactly 1 goalkeeper substitute slot.
6. Players can be dragged from the bench to the pitch.
7. If the destination pitch slot or bench slot is occupied, the dragged player swaps places with the occupying player.
8. When dragging starts, every pitch and bench slot displays eligibility feedback:
   - Green: best/native position.
   - Orange: valid secondary or acceptable adapted position.
   - Red: invalid or strongly unsuitable position.
9. Goalkeepers can only be assigned to goalkeeper slots: starting GK or substitute GK. Goalkeepers cannot be placed in outfield pitch slots or outfield bench slots.
10. Field players cannot be assigned to goalkeeper slots.
11. Every player token on the pitch, bench, and roster list displays portrait, first name, and last name.
12. Team stats update live after every formation, instruction, starter, or bench change, using the rating logic from Story 13.2.
13. The lineup editor persists its current formation, instruction, pitch assignments, and bench assignments through the existing persisted squad store.
14. The implementation includes focused tests for formation slot generation, eligibility coloring, goalkeeper restrictions, swap behavior, and live rating recomputation.

## Tasks / Subtasks

- [x] Model lineup state and tactical instructions (AC: 2, 3, 5, 12, 13)
  - [x] Extend `useSquadStore.ts` with explicit `lineupSlots`, `benchSlots`, and `gameInstruction` state.
  - [x] Store pitch assignments by stable slot id and player id; do not duplicate full player objects in assignment state.
  - [x] Define supported formations and slot coordinates in a pure config/service.
  - [x] Define game instructions and algorithm-facing modifiers: pressing, defensive block, width, directness, risk, fatigue cost.
  - [x] Preserve existing persisted roster data and add migration-safe defaults for users with older `squad-storage`.
- [x] Create lineup domain services (AC: 2, 5, 7, 8, 9, 10, 12, 14)
  - [x] Add a pure `LineupService` or equivalent under `src/domains/shared/services/`.
  - [x] Implement formation slot generation for at least `4-4-2 DIAMOND`, `4-3-3`, `4-2-3-1`, `3-5-2`, and `5-3-2`.
  - [x] Implement `getPositionEligibility(player, slot)` returning `best`, `adapted`, or `invalid`.
  - [x] Implement hard GK restrictions: GK only in GK slots; field players never in GK slots.
  - [x] Implement move/swap operations for roster-to-pitch, roster-to-bench, pitch-to-bench, bench-to-pitch, pitch-to-pitch, and bench-to-bench.
  - [x] Recompute active team rating from assigned starters, falling back to Story 13.2 auto-selection only when no explicit lineup exists.
- [x] Build the tactics/lineup screen UI (AC: 1, 2, 3, 4, 5, 6, 8, 11, 12)
  - [x] Add `TacticsScreen.tsx` under `src/presentation/ui/tactics/`.
  - [x] Use the existing Hub visual theme: black glass panels, `#39ff14` accent, uppercase compact labels, same card radius, same typography.
  - [x] Display a pitch diagram whose slot coordinates change with the selected formation.
  - [x] Display the five bench slots separately from the pitch, with one explicit substitute GK slot.
  - [x] Display a scrollable/virtualized squad list if roster size can exceed 30 players.
  - [x] Display player tokens with portrait, first name, last name, position, rarity styling, and current assignment.
  - [x] Display live team stats: overall, attack, midfield, defense, stamina average, morale, and instruction modifiers.
  - [x] Display instruction selector using a segmented control or compact button group, not free text.
- [x] Implement drag-and-drop interaction (AC: 4, 6, 7, 8, 9, 10, 11)
  - [x] Use `@dnd-kit/react` unless a better repo-approved DnD package is already present.
  - [x] Use draggable player tokens and droppable pitch/bench slots.
  - [x] During drag, color all eligible destinations green/orange/red using `LineupService.getPositionEligibility`.
  - [x] Prevent invalid drops from mutating state.
  - [x] Animate/signal swaps clearly but keep layout dimensions stable.
  - [x] Support pointer/touch and keyboard-accessible drag flows where the chosen DnD API supports them.
- [x] Wire navigation from Hub (AC: 1)
  - [x] Clicking the current Tactics tile in `HubScreen.tsx` opens the lineup editor.
  - [x] Prefer the existing FSM if adding a new app state is consistent; otherwise keep it as a Hub sub-view with a clear back action.
  - [x] Return to Hub without losing lineup edits.
- [x] Add tests and validation (AC: 2, 5, 7, 8, 9, 10, 12, 14)
  - [x] Unit test formation slot definitions and GK bench constraints.
  - [x] Unit test eligibility colors for native, secondary/adapted, invalid, and GK-only cases.
  - [x] Unit test swap behavior for occupied pitch and bench destinations.
  - [x] Unit test rating recomputation after lineup changes.
  - [x] Component test the tactics screen at minimum for formation change, instruction change, and one valid drop/swap path if the test environment supports DnD events.
  - [x] Run `npm run build`, targeted tests, and the full Vitest run.

## Dev Notes

### User Requirements To Preserve

- Formation selection must visually reshape pitch slots.
- Dragging must work squad -> pitch, squad -> bench, pitch -> bench, bench -> pitch, pitch -> pitch, and bench -> bench.
- Occupied destination means swap, not reject.
- Bench size is exactly 5: one GK substitute slot plus four outfield substitute slots.
- GK restriction is absolute.
- Player cards/tokens show portrait plus first and last name. If catalog names are single-string names, split on the first space for display but keep the source `player.name` unchanged.
- Slot feedback colors are part of gameplay readability:
  - Green = native/best slot.
  - Orange = secondary or tactically acceptable adaptation.
  - Red = invalid/strongly unsuitable.
- Team stats update immediately after each change.
- Access point is the Tactics tile in Hub.

### Current State From Previous Stories

- Story 13.1 created real roster generation through `PlayerFactory` and `useSquadStore`.
- Story 13.2 added `TeamRatingService`, `computeOverallRating`, formation-based rating, and Hub display for overall/composites.
- `TeamRatingService` currently exposes formation slots and starting XI selection. Extend it or compose with a new `LineupService`; do not duplicate rating formulas.
- `useSquadStore` currently stores `formation`, `overallRating`, `composites`, `staminaAvg`, `morale`, `roster`, and actions including `setFormation`, `initializeRoster`, and `computeOverallRating`.
- `HubScreen.tsx` already has a Tactics tile that currently does not navigate anywhere.
- `GameState` currently has no `TACTICS` state. If adding one, update `GameState`, `FlowController` tests if needed, and `App.tsx` rendering. A local Hub sub-view is acceptable if it keeps the FSM simpler.

### Pending 13.2 Review Findings To Consider

- Avoid redundant recomputation loops from UI effects. Prefer store actions that recompute exactly when lineup/formation/instruction changes.
- Fix or account for the goalkeeper position handling in `TeamRatingService` before relying on ratings for invalid GK/outfield assignments.
- Avoid storing full `Player[]` copies inside a team/lineup assignment model. Use player ids for lineup and bench assignments, then resolve to roster players.
- Preserve existing save compatibility where possible; if persisted shape changes, add migration/defaulting logic and tests.

### Tactical Instruction Model

Base the instruction options on `algoritm.md`, which says tactics must modify match probabilities and lists formation/tactical impacts:

- High Press: increases pressing and recovery pressure; increases fatigue cost and counter risk.
- Low Block: increases defensive box/block modifier; reduces pressing, possession, and shot volume.
- Balanced: neutral baseline.
- Wing Play: increases width, crosses, and flank progression; can increase wide fatigue.
- Direct Transition: increases counter/directness; can reduce possession stability.

The story does not require match engine integration yet. Store instruction data in a shape the match engine can consume later, e.g. `{ pressingModifier, defensiveBlockModifier, widthModifier, directnessModifier, riskModifier, fatigueCostModifier }`.

### DnD Library Guidance

- This story explicitly permits adding a DnD dependency.
- Prefer current `dnd-kit` React APIs from docs:
  - `DragDropProvider`
  - `useDraggable`
  - `useDroppable`
  - collision detection suitable for fixed pitch/bench slots
- If using the older `@dnd-kit/core` API instead, document why and keep the abstraction local to the tactics UI.
- Keep DnD state deterministic and testable by routing all accepted drops through a pure move/swap service.

### Existing Design Implementation Guidance

Do not use Stitch for this story. Implement directly from the existing design sources:

- `DESIGN.md` at the project root is the visual source of truth when present.
- `HubScreen.tsx` is the live implementation reference for spacing, colors, typography, glass panels, and interaction states.
- Preserve the Obsidian Athletics theme:
  - Deep obsidian background: `#050505`.
  - Dark glass panels: `#121212` / `#121414` with `white/10` borders.
  - Primary accent: Striker Green `#39FF14`.
  - Typography: Space Grotesk, compact uppercase labels, dense stat layout.
  - Rounded corners should match the Hub: mostly `rounded`, `rounded-lg`, or `rounded-xl` already used by existing components.
- Do not create a marketing-style page or a separate visual language.
- Do not add generated illustrations, gradient-orb backgrounds, or decorative SVG hero art.
- Reuse existing Hub patterns: fixed-height tactical cards, compact status blocks, neon accent states, Material Symbols icons already used in the app.
- Any visual deviation from `DESIGN.md` or the Hub must be documented in the Dev Agent Record with a concrete reason.

Implementation data contracts remain:

- `roster: Player[]`
- `formation: string`
- `lineupSlots: Record<slotId, playerId | null>`
- `benchSlots: Record<slotId, playerId | null>`
- `gameInstruction: TacticalInstructionId`
- `overallRating`, `composites`, `staminaAvg`, `morale`
- actions for `setFormation`, `setGameInstruction`, `movePlayerToSlot`, `swapAssignments`, `computeOverallRating`

### Project Context Rules

- Use React for this management UI. Do not involve Phaser for this screen.
- Keep business logic out of React components: move/swap/eligibility/rating recomputation must live in services or store actions.
- Do not import UI libraries into `src/domains/match/worker/`.
- All persisted shape changes must be migration-safe and Zod-compatible where schemas are involved.
- Follow file naming conventions: PascalCase source files and kebab-case folders.
- Use existing `TeamRatingService` instead of recalculating team strength in the component.
- Maintain Hub visual style and accessibility: buttons need labels, drag affordances need keyboard or fallback interaction where practical.

### Suggested File Targets

- `src/domains/shared/services/LineupService.ts`
- `src/domains/shared/services/LineupService.test.ts`
- `src/domains/shared/services/TacticalInstructionService.ts` or equivalent config module
- `src/domains/shared/store/useSquadStore.ts`
- `src/domains/shared/store/useSquadStore.test.ts`
- `src/presentation/ui/tactics/TacticsScreen.tsx`
- `src/presentation/ui/tactics/TacticsScreen.test.tsx` if practical
- `src/presentation/ui/hub/HubScreen.tsx`
- `src/presentation/App.tsx`
- `src/core/fsm/GameState.ts` only if adding a FSM state

### References

- [Source: _bmad-output/epics.md#Story 13.3: Drag & Drop Lineup Editor]
- [Source: _bmad-output/algoritm.md#19. Effet des tactiques]
- [Source: _bmad-output/algoritm.md#23. Changements tactiques]
- [Source: _bmad-output/implementation-artifacts/13-2-dynamic-team-rating-calculator.md]
- [Source: DESIGN.md#Project Brief: Obsidian Athletics]
- [Source: src/domains/shared/services/TeamRatingService.ts]
- [Source: src/domains/shared/store/useSquadStore.ts]
- [Source: src/presentation/ui/hub/HubScreen.tsx]
- [Source: dnd-kit docs via Context7, /websites/dndkit]

## Dev Agent Record

### Agent Model Used

GPT-5

### Debug Log References

- 2026-05-04: Installed `@dnd-kit/react` for the tactics drag-and-drop surface.
- 2026-05-04: Ran targeted Vitest suite for `LineupService`, `useSquadStore`, `TeamRatingService`, and `TacticsScreen`.
- 2026-05-04: Ran `npm run build` successfully after UI/FSM integration.
- 2026-05-04: Ran full `npm test -- --run` successfully: 21 files, 120 tests passing.
- 2026-05-07: Ran `npm run build` successfully after mobile DnD and responsive chip fixes.
- 2026-05-07: Ran `npx vitest run src/presentation/ui/tactics/TacticsScreen.test.tsx` successfully.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story expanded from the epic stub using user-provided lineup editor requirements.
- Story updated to avoid Stitch and implement from `DESIGN.md` plus the existing Hub theme.
- Implemented pure lineup formation, eligibility, move/swap, and assigned-rating logic with hard GK restrictions.
- Added tactical instruction config based on `algoritm.md` modifiers for future match-engine consumption.
- Extended persisted squad state with formation lineup assignments, five bench slots, game instruction, and migration-safe defaults.
- Added a dedicated Hub-themed tactics screen with formation selector, instruction selector, pitch slots, bench slots, roster tokens, live stats, and DnD feedback colors.
- Added FSM navigation from the Hub tactics tile to the tactics editor and a back action to Hub.
- Added unit and component coverage for formation slots, GK constraints, eligibility feedback, swaps, live rating recomputation, and tactics screen controls.
- Updated formation changes to preserve existing starters where possible instead of resetting the lineup, with persistent green/orange/red placement badges on assigned player tokens.
- Redesigned the tactics screen for mobile portrait and landscape with top formation/instruction selects, left grouped squad list, right pitch/bench surface, compact player chips, and click-to-open player detail tabs.
- Fixed mobile drag-and-drop affordance by separating the stats click from a dedicated drag handle, declaring player/drop target types, adding a chip ghost overlay, and keeping tap-to-place as a fallback for selected players.
- Updated player chips so the stats action is a dedicated info button and every other area of the chip starts drag-and-drop.
- Fixed `@dnd-kit/react@0.4` usage by binding the draggable source through the real `ref` API, restoring mobile pointer drag behavior.
- Reworked the drag ghost so dragging from the squad renders only a compact `PlayerChip`, centered under the initial mouse/finger position instead of cloning the full squad tile.
- Added mobile-only compact pitch and bench dimensions to prevent player chip overlap while preserving the existing tablet/desktop presentation.

### Review Findings

- [x] [Review][Patch] P1: Hardcoding UI Strings — Localisation complète effectuée (FR, EN, ES, DE) pour les libellés tactiques et les consignes.
- [ ] [Review][Patch] P2: Nom incomplet (AC 11) — Conservé en l'état (nom de famille uniquement) selon instruction utilisateur.
- [x] [Review][Patch] P3: Gardes Null/Stale (Lineup) — Ajout de vérifications de l'existence du joueur et des slots dans `LineupService.movePlayer`.
- [x] [Review][Patch] P4: Bouton HubScreen inactif — Activation du clic sur la tuile Composition pour naviguer vers l'écran Tactique.
- [x] [Review][Patch] P5: Bug Offset Touch (Mobile) — Correction de la lecture des coordonnées pointer/touch dans `TacticsScreen.tsx`.
- [x] [Review][Patch] P6: Blocage des Swaps — Assouplissement des conditions d'échange (seuil ramené à 0.1 pour permettre de sortir un joueur d'un poste invalide).
- [ ] [Review][Refactor] R1: Nombres Magiques — Utilisation de constantes pour les seuils d'efficacité (à faire dans une future passe de cleanup).
- [ ] [Review][Refactor] R2: Couplage Fort Services — `LineupService` dépend de `TeamRatingService`.
- [x] [Review][Defer] D1: Virtualisation manquante — Non critique pour le volume actuel de l'effectif.
- [x] [Review][Defer] D2: Accessibilité Clavier — Reporté.

### File List

- package.json
- package-lock.json
- src/core/fsm/GameState.ts
- src/domains/shared/services/LineupService.ts
- src/domains/shared/services/LineupService.test.ts
- src/domains/shared/services/TacticalInstructionService.ts
- src/domains/shared/services/TeamRatingService.ts
- src/domains/shared/store/useSquadStore.ts
- src/domains/shared/store/useSquadStore.test.ts
- src/presentation/App.tsx
- src/presentation/ui/hub/HubScreen.tsx
- src/presentation/ui/tactics/TacticsScreen.tsx
- src/presentation/ui/tactics/TacticsScreen.test.tsx

### Change Log

- 2026-05-04: Created implementation-ready story for tactics and drag-and-drop lineup editor.
- 2026-05-04: Replaced Stitch prompt with direct implementation guidance from existing `DESIGN.md` and Hub UI.
- 2026-05-04: Implemented drag-and-drop lineup editor, tactical instruction state, Hub navigation, and validation tests.
- 2026-05-04: Changed formation switching to preserve coach assignments where possible and flag optimal, secondary, or out-of-position placements visually.
- 2026-05-05: Reworked tactics UI for mobile-first use: top selectors, grouped squad list, compact pitch tokens, halo status feedback, and tabbed player details.
- 2026-05-05: Fixed squad-to-pitch placement with a dedicated drag handle, drag ghost overlay, explicit drop acceptance, and selected-player tap placement for mobile reliability.
- 2026-05-05: Swapped the interaction model: info button opens stats, the rest of the player chip is the drag source.
- 2026-05-07: Fixed mobile drag source binding, centered chip-only ghost overlay, and mobile-only pitch/bench chip sizing to remove overlaps.
