# Story 11.1: Virtualized Live Feed

Status: done

## Story

As a Player,
I want to read match comments in a fast, virtualized list,
so that I can follow the x15 match simulation speed without UI lag or performance degradation.     

## Acceptance Criteria

1. [x] Implement `MatchSimulationScreen.tsx` following the "Obsidian Athletics" design patterns.       
2. [x] Install and integrate `react-window` for the commentary feed.
3. [x] Handle a high-frequency stream of comments (up to 4 updates/sec) as per performance rules.      
4. [x] Display a live scoreboard (Score, Minute, Team Names) at the top of the screen.
5. [x] Ensure the feed automatically scrolls to the bottom for new events.
6. [x] Support localization (FR/EN/ES/DE) for the feed labels and scoreboard.

## Tasks / Subtasks

- [x] Setup Infrastructure
  - [x] Install `react-window` and `@types/react-window`.
  - [x] Create `src/domains/match/store/useMatchLogStore.ts` to buffer and store commentary lines. 
- [x] Logic Integration
  - [x] Implement a basic `CommentaryService` to map `MatchState` changes to text events.
  - [x] Update `MatchWorkerClient.ts` to dispatch updates to `useMatchLogStore`.
- [x] UI Implementation
  - [x] Create `src/presentation/ui/match/MatchSimulationScreen.tsx`.
  - [x] Implement virtualized list using `List` from `react-window`.
  - [x] Add the "Obsidian Athletics" styled header with match vitals (Score, Time).
- [x] Wiring
  - [x] Update `src/presentation/App.tsx` to replace the "SIMULATING MATCH" placeholder with `Match
SimulationScreen`.

### Review Findings

- [x] [Review][Patch] Fix infinite loop at kickoff in `MatchWorkerClient.ts`
- [x] [Review][Patch] Prevent state destruction on match resume by adding `resume_match` command
- [x] [Review][Patch] Optimize scoreboard performance: calculate score in store, not in render
- [x] [Review][Patch] Correct `react-window` v2.2.7 API usage (List, useListRef)
- [x] [Review][Patch] Implement full localization (FR/EN/ES/DE) for all match commentary
- [x] [Review][Patch] Decouple scoreboard from string-matching logic
- [x] [Review][Patch] Implement UI throttling (max 4 updates/sec) for high-speed simulation
- [x] [Review][Patch] Fix React reconciliation by moving `Row` component outside `MatchSimulationScre
en`
- [x] [Review][Patch] Use `Inter` font for commentary text as per spec
- [x] [Review][Patch] Fix scroll direction and clock synchronization
- [x] [Review][Defer] Hidden Phaser instance hack in `App.tsx` — deferred, pre-existing technical de
bt

## Dev Notes

- **Performance Rule:** Virtualization is mandatory for lists > 30 items.
- **Throttling:** The simulation runs at x15. Ensure the React UI only re-renders the feed at a man
ageable rate (max 4 updates/sec) to maintain INP targets.
- **Design Tokens:** Use `Space Grotesk` for headers and `Inter` for commentary text.
- **Architecture:** Keep business logic (event generation) in `domains/match` and UI rendering in `
presentation/ui`.

...
Gemini 2.0 Flash (Context Engine)

### Debug Log References
- Initial analysis of `MatchWorker.ts` and `MatchWorkerClient.ts` completed.
- Verified `package.json` for missing `react-window` dependency.
- Fixed `react-window` 2.2.7 API usage (List + useListRef + scrollToRow).
- Verified `tsc` compilation (no new errors in the implemented scope).
- Applied 10 patches from adversarial review: fixed resume logic, throttling, and localization.

### Completion Notes List
- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented `MatchLogStore` for commentary buffering.
- Implemented `CommentaryService` for state-to-text mapping.
- Implemented `MatchSimulationScreen` with `react-window` for virtualization.
- Integrated feed into `App.tsx` with scoreboard and auto-scroll logic.
- Fully localized all match strings across 4 languages.
- Optimized rendering performance with memoized components and throttled store updates.

### File List
- `src/domains/match/store/useMatchLogStore.ts`
- `src/domains/match/services/CommentaryService.ts`
- `src/presentation/ui/match/MatchSimulationScreen.tsx`
- `src/domains/match/MatchWorkerClient.ts` (Modified)
- `src/domains/match/worker/MatchWorker.ts` (Modified)
- `src/presentation/App.tsx` (Modified)
- `src/core/services/i18n/locales/Schema.ts` (Modified)
- `src/core/services/i18n/locales/*.ts` (Modified)
