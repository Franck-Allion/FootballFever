# Story 3.1: Finite State Machine Controller

Status: done

## Story

As an Architect,
I want a centralized `FlowController` based on a Finite State Machine,
so that screen transitions are deterministic and business rules (like lineup validity) are enforced before state changes.

## Acceptance Criteria

1. **State Definition:** Implement a robust `GameState` enum/type with the following states: `BOOT`, `HUB`, `DRAFT`, `MATCH_PREP`, `MATCH_SIM`, `MATCH_RESULT`, `REWARD`.
2. **Deterministic Transitions:** Create a `FlowController` (Core service) that manages transitions between these states. Transitions must be explicit (e.g., `transitionTo(GameState.HUB)`).
3. **Guard/Validator Pattern:** Implement a mechanism to prevent transitions if certain conditions aren't met.
    - **AC Focus:** Transition from `HUB` to `MATCH_SIM` (or `MATCH_PREP`) must only be possible if the team lineup is valid.
4. **Architecture Compliance:** Ensure `src/core/fsm` does NOT import from `src/domains/`. Use interfaces, callbacks, or the `EventBus` for domain-specific validations.
5. **UI Synchronization:** Connect the `FlowController` to a Zustand store (`useFlowStore`) so that the React layer (`@ui/App`) can reactively switch views based on the current state.
6. **Persistence Readiness:** The current state should be capable of being persisted/restored (via Epic 02 later, but structure it now).

## Tasks / Subtasks

- [x] **FSM Core Implementation** (AC: 1, 2)
  - [x] Define `GameState` enum in `src/core/fsm/GameState.ts`.
  - [x] Create `FlowController.ts` in `src/core/fsm/` to handle the transition logic.
- [x] **State Management Integration** (AC: 5)
  - [x] Create `src/core/store/useFlowStore.ts` using Zustand to hold the active `GameState`.
  - [x] Ensure `FlowController` updates the store on successful transitions.
- [x] **Validation Guard Mechanism** (AC: 3, 4)
  - [x] Implement a `TransitionGuard` interface in `core`.
  - [x] Add a registration method in `FlowController` to allow domains to attach guards to specific transitions.
  - [x] Create a "Lineup Guard" (mocked for now in tests/FlowService) to satisfy the HUB -> MATCH AC.
- [x] **React Layer Wiring** (AC: 5)
  - [x] Update `@ui/App.tsx` to switch between placeholder components based on the `useFlowStore` state.
- [x] **Verification** (AC: 2)
  - [x] Write unit tests in Vitest to verify that illegal transitions are blocked.
  - [x] Verify that the state correctly starts at `BOOT`.

### Review Follow-ups (AI)

- [x] [AI-Review] Add a static `resetInstance()` method to `FlowService.ts` for cleaner test isolation. (Severity: Low)

## Dev Notes

- **Architecture Pattern:** Follows the "Domain-Driven Hybrid" pattern. `FlowController` is a pure engine in `core`.
- **Decoupling:** Transition guards are generic and domain-agnostic. The `FlowService` acts as the concrete singleton manager.
- **UI:** React `App.tsx` uses Tailwind for conditional rendering of GameStates.

### Project Structure Notes

- **src/core/fsm/**: Contains the FSM engine and the Singleton FlowService.
- **src/core/store/**: Contains the Zustand store with persistence middleware.

### Project Context Rules

Extracted from `project-context.md`:
- **FSM Rule:** Screen transitions and game modes are managed by a central Finite State Machine.
- **Testing:** 100% logic coverage achieved for FlowController and FlowService.

### References

- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns]
- [Source: _bmad-output/project-context.md#Game Flow (FSM)]
- [Source: _bmad-output/epics.md#Epic 03]

## Senior Developer Review (AI)

**Date:** 2026-05-02
**Outcome:** Approve with Minor Improvement

Implementation is architecturally sound. Asynchronous guards and core isolation are perfect.

### Action Items
- [x] Add `resetInstance()` to `FlowService`.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- GameState enum defined.
- FlowController implemented with Guard support.
- Zustand useFlowStore created with `persist` middleware.
- FlowService singleton created to bridge Controller and Store.
- App.tsx updated with conditional rendering for BOOT, HUB, and MATCH_SIM.
- 10 unit tests passed covering Controller, Store, and Service integration.
- Added `resetInstance()` to `FlowService` for better test isolation.
- Production build successful.

### Completion Notes List

- Centralized `GameState` manages the entire application lifecycle.
- `FlowController` enforces transition guards (AC satisfied for HUB->MATCH validation).
- Zustand store provides reactive state for the React UI.
- All core FSM logic is fully tested and decoupled from domain logic.
- Addressed all review follow-ups for technical excellence.

### File List

- src/core/fsm/GameState.ts (new)
- src/core/fsm/FlowController.ts (new)
- src/core/fsm/FlowController.test.ts (new)
- src/core/fsm/FlowService.ts (new)
- src/core/fsm/FlowService.test.ts (new)
- src/core/store/useFlowStore.ts (new)
- src/core/store/useFlowStore.test.ts (new)
- src/presentation/App.tsx (modified)
