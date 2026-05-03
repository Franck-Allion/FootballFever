# Story 5.2: In-Game Debug Console

Status: done

## Story

As a Balancer,
I want a console (Triple-tap) to inject Prestige/Loot and view system logs,
so that I can test any state and debug the simulation in real-time on mobile devices.

## Acceptance Criteria

1. **Triple-Tap Activation:** A global listener must detect a triple-tap (on mobile) or a specific shortcut (e.g., `~` on PC) to toggle the visibility of the Debug Console overlay.
2. **Log Viewer:** The console must display the last 50 logs from the `LoggerService` in a scrollable, virtualized (if needed) list.
3. **Command Input:** A text input field must accept commands starting with `/`.
    - Required: `/add_prestige [value]` must immediately update the player's prestige.
    - Required: `/clear_logs` must clear the console history.
4. **Reactive State:** Any state injection (like prestige) must reflect immediately in the UI (Zustand store integration).
5. **Architecture Compliance:** The command logic must be decoupled from the UI. Create a `DebugCommandService` in `core` to handle command execution.

## Tasks / Subtasks

- [x] **Infrastructure & Detection** (AC: 1)
  - [x] Implement a `useTripleTap` custom hook in `src/presentation/hooks/`.
  - [x] Update `@ui/App.tsx` to include the `DebugConsole` overlay.
- [x] **Data Management** (AC: 2, 4)
  - [x] Create `src/core/store/useDebugStore.ts` to buffer logs and manage console state.
  - [x] Create `src/core/store/useEconomyStore.ts` to manage Prestige (scaffold for Story 5.2).
  - [x] Update `LoggerService.ts` to optionally pipe logs to `useDebugStore`.
- [x] **Console UI Implementation** (AC: 2, 3)
  - [x] Create `DebugConsole.tsx` in `src/presentation/ui/debug/`.
  - [x] Implement the scrollable log viewer with level-based coloring.
  - [x] Implement the command input field with focus management.
- [x] **Command Logic** (AC: 3, 5)
  - [x] Create `src/core/services/debug/DebugCommandService.ts`.
  - [x] Implement the `/add_prestige` logic.
  - [x] Implement the `/clear_logs` logic.
- [x] **Verification** (AC: 3, 4)
  - [x] Write unit tests for the `DebugCommandService` parser.
  - [x] Verify that UI updates correctly after a command is executed.

### Review Follow-ups (AI)

- [x] [AI-Review] Add `Escape` key support to close the `DebugConsole`. (Severity: Low)
- [x] [AI-Review] Use `e.stopPropagation()` on input keyboard events to prevent conflicts with Phaser. (Severity: Low)

## Dev Notes

- **Input Management:** Handled via focus management and event propagation control.
- **Zustand Persistence:** `useEconomyStore` is persisted to local storage. `useDebugStore` is ephemeral.
- **Hybrid UI:** Debug Console uses a high `z-index` (9999) to overlay all content.
- **Mobile Friendly:** Triple-tap detection optimized for touch devices.

### Project Structure Notes

- **src/presentation/ui/debug/**: Contains the main console component.
- **src/core/services/debug/**: Contains the command interpreter.
- **src/core/store/**: Stores for debug logs and economy data.

### Project Context Rules

Extracted from `project-context.md`:
- **Triple-tap:** Implemented for mobile debugging activation.
- **Command Pattern:** Decoupled execution via `DebugCommandService`.

### References

- [Source: _bmad-output/epics.md#Epic 05]
- [Source: _bmad-output/project-context.md#Gotchas & Edge Cases]
- [Source: _bmad-output/implementation-artifacts/5-1-loggerservice-json.md]

## Senior Developer Review (AI)

**Date:** 2026-05-03
**Outcome:** Approve with Minor Improvements

Implementation is solid. Triple-tap and command pattern are well executed.

### Action Items
- [x] Add `Escape` key support.
- [x] Fix keyboard event propagation.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- useTripleTap hook implemented (supports touch and `~` key).
- useDebugStore and useEconomyStore created.
- LoggerService updated to forward all entries to debug store.
- DebugCommandService singleton implemented for `/` commands.
- DebugConsole React component styled with Tailwind.
- Unit tests passed for command parsing and execution.
- Build successful.
- Added Escape key support for console closure.
- Added stopPropagation to debug input fields.

### Completion Notes List

- In-game console is fully operational.
- Logs from `LoggerService` are displayed in real-time.
- Prestige can be injected via `/add_prestige [val]`.
- Integration into `App.tsx` is clean and reactive.
- User experience polished with keyboard navigation fixes.

### File List

- src/presentation/hooks/useTripleTap.ts (new)
- src/presentation/ui/debug/DebugConsole.tsx (new)
- src/core/store/useDebugStore.ts (new)
- src/core/store/useEconomyStore.ts (new)
- src/core/services/debug/DebugCommandService.ts (new)
- src/core/services/debug/DebugCommandService.test.ts (new)
- src/core/services/logger/LoggerService.ts (modified)
- src/presentation/App.tsx (modified)
