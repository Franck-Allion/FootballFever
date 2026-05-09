# Story 20.0: Season Calendar Generator (League & Cup)

Status: ready-for-dev

## Story

As a Manager,
I want a realistic season calendar with league matches and cup rounds properly interspersed,
so that I can experience the intensity of a professional football season and manage my squad's depth over many months.

## Acceptance Criteria

1. **League Logic**: Generate a full Round-robin schedule for a 16-team league (30 matchdays total).
2. **Cup Integration**: Interperse elimination cup rounds (e.g., Round of 32, 16, Quarter, Semi, Final) at specific intervals in the season.
3. **Rest Periods**: Automatically insert "Rest Nodes" or Mercato breaks between high-intensity match clusters.
4. **Determinism**: The calendar for a given season must be deterministic based on the season seed.
5. **Team Mapping**: Ensure the player's team is assigned a fixed index and its matches are correctly identified in the timeline.
6. **Timeline Data Structure**: Output the calendar as an array of `TimelineNode` objects compatible with the `useSquadStore`.

## Tasks / Subtasks

- [ ] **Algorithm Implementation**
  - [ ] Create `src/domains/career/services/CalendarGenerator.ts`.
  - [ ] Implement Round-robin (Berger tables) algorithm for 16 teams.
  - [ ] Implement Cup draw logic (shuffled pairs per round).
- [ ] **Integration Logic**
  - [ ] Implement `mergeLeagueAndCup(leagueMatches, cupRounds)` to create the final seasonal ribbon.
  - [ ] Ensure the first node is always the current match for the Hub.
- [ ] **Testing**
  - [ ] Unit test the generator to ensure no team plays twice on the same day.
  - [ ] Verify that 30 league matchdays are generated.
  - [ ] Verify cup rounds appear at correct intervals.

## Dev Notes

- **Round-robin:** A 16-team league requires 15 rounds for the first half and 15 rounds for the second half (mirrored or re-shuffled).
- **Cup Pacing:** Cup rounds should typically happen every 4-5 league matches to simulate midweek or dedicated cup weekends.
- **Data Model:** Nodes should include `opponent` and `competitionType` (League vs Cup).

### Project Context Rules

- **Pure Logic:** The generator must be a pure service, easily testable without React or Store dependencies.
- **Scalability:** The algorithm should theoretically support different league sizes (e.g., 10 or 20 teams) in the future.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes List
(To be filled during implementation)

### File List
(To be filled during implementation)
