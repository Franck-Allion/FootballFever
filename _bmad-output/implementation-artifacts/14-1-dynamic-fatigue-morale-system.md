# Story 14.1: Dynamic Fatigue & Morale System

Status: done

## Story

As a Coach,
I want my players' stamina to drain during a match and their morale to evolve based on results,
so that I am forced to manage my squad's rotation and make tactical trade-offs between intensity and longevity.

## Acceptance Criteria

1. **In-Match Fatigue Drain**:
   - During match simulation, players in the starting 11 lose stamina every tick (5s).
   - The drain rate is influenced by the team's tactical instruction (e.g., 'High Press' drains faster).
   - Base drain rate: 0.05% per minute (calibrated for ~5-8% loss per full match at 'Balanced').
   - Tactical Modifiers: `high-press` (1.18x), `low-block` (0.92x), `wing-play` (1.1x), `direct-transition` (1.08x).
2. **Dynamic Rating Impact**:
   - As stamina drops, the `TeamRating` used by the match engine must be recomputed to reflect declining performance.
3. **Post-Match Morale Evolution**:
   - Win: All players gain +5 to +10 morale (capped at 100).
   - Loss: All players lose -5 to -10 morale (min 0).
   - Draw: Morale stays stable or slight gain (+2) if against a stronger opponent.
4. **Inter-Match Recovery**:
   - Players on the bench or not in the squad recover condition/stamina between matches (e.g., +15% per "match day" rested).
5. **Persistence**:
   - Updated stamina and morale values must be saved to the roster in `useSquadStore` after the match results are finalized.
6. **UI Feedback**:
   - The Hub and Tactics screens must display the updated stamina and morale values (already supported by schemas, need verification).

## Tasks / Subtasks

- [x] **Match Engine Integration**
  - [x] Update `MatchState` to include `homeLineupStamina` and `awayLineupStamina` (team-level for MVP or player-level if preferred).
  - [x] Implement `UpdateFatigue(matchState)` in `MatchSimulation.ts`.
  - [x] Ensure `advanceMatchState` re-evaluates team ratings periodically as stamina drops.
- [x] **Evolution Logic**
  - [x] Create `src/domains/shared/services/HumanManagementService.ts`.
  - [x] Implement `applyMatchOutcomes(roster, result)` for morale.
  - [x] Implement `applyRecovery(roster, restDays)` for stamina/condition.
- [x] **Store Integration**
  - [x] Add `finalizeMatchDay` action to `useSquadStore.ts` that applies evolution and saves to DB.
  - [x] Hook this action into the `MATCH_RESULT` or `REWARD` state transition.

## Dev Notes

- **Calibration:** A player starting at 100% stamina should finish a 90min match at 'High Press' with ~85-88% stamina.
- **Worker Isolation:** Remember that `MatchSimulation` runs in a Web Worker. Ensure all necessary modifiers are passed in the initial state or available in the worker's scope.
- **Rating Formulas:** Reuse `TeamRatingService` logic but ensure it's compatible with the worker's needs (might need to move some pure logic to a shared util).

### Project Context Rules

- **Deterministic:** The fatigue drain must be deterministic based on the match seed and time.
- **Zod:** Ensure all state changes comply with `EntitySchemas.ts`.

### Review Findings

- [x] **P1: Perte de granularité physique** — Corrigé : `HumanManagementService` supporte désormais la stamina individuelle. (Note: L'engine envoie encore une moyenne équipe pour la V1, mais le store est prêt pour l'individuel).
- [x] **P2: Mismatch des modificateurs** — Corrigé : Coefficients alignés sur l'AC 1 (1.18, 0.92, 1.10, 1.08).
- [x] **P3: Dette de localisation (StatBar)** — Corrigé : Toutes les stats techniques et mentales sont localisées via `t('tactics.stat_...')`.
- [x] **P4: Risque de NaN (Simulation)** — Corrigé : Ajout de gardes `Number.isFinite` sur la stamina dans `MatchSimulation.ts`.
- [x] **P5: Évolution du Moral fixe** — Corrigé : Ajout de variété déterministe (+5 à +10) via un RNG local seedé par le match.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes List
- Implemented `MatchState` extension with `stamina` and `tactics`.
- Implemented `updateFatigue` logic in `MatchSimulation.ts` with tactical modifiers (High Press = fast drain).
- Integrated stamina impact into xG calculation and possession turnover logic (0-15% skill malus).
- Created `HumanManagementService` for post-match evolution and recovery logic.
- Added `finalizeMatchDay` to `useSquadStore` to apply match outcomes to the roster.
- Updated `MatchLogStore` to capture and sync final stamina from the worker.
- Hooked finalization into `MatchSimulationScreen` exit handler.
- 161/161 tests passing (including new `Fatigue.test.ts` and `HumanManagementService.test.ts`).

### File List
- `src/domains/match/logic/MatchState.ts` (Modified)
- `src/domains/match/logic/MatchSimulation.ts` (Modified)
- `src/domains/match/logic/MatchSimulation.test.ts` (Modified)
- `src/domains/match/logic/Fatigue.test.ts` (New)
- `src/domains/shared/services/HumanManagementService.ts` (New)
- `src/domains/shared/services/HumanManagementService.test.ts` (New)
- `src/domains/shared/store/useSquadStore.ts` (Modified)
- `src/domains/match/store/useMatchLogStore.ts` (Modified)
- `src/domains/match/MatchWorkerClient.ts` (Modified)
- `src/presentation/ui/match/MatchSimulationScreen.tsx` (Modified)

### Change Log
- 2026-05-08: Initial implementation of Story 14.1.
- 2026-05-08: Applied code review patches and refined morale variety.
