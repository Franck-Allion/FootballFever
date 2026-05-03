# Story 9.1: Match Engine Balancing

Status: done

## Story

As a Game Designer,
I want the match engine to produce realistic football statistics,
so that the gameplay feels authentic and predictable.

## Acceptance Criteria

1. Reduce average goals per match from ~21 to ~2.5 - 3.2.
2. Adjust shot volume to ~10 - 15 shots per team per match.
3. Stabilize the draw rate around 20% - 25%.
4. Increase midfield contention by raising the turnover rate from 10% to 30%.
5. Validate results with a 1000-match batch simulation.

## Implementation Details

- **Shot Probability Scale:** Reduced from 0.5 to 0.08.
- **Movement Table:** 
  - Forward: 30% (was 50%)
  - Lateral: 30% (was 25%)
  - Backward: 10% (was 15%)
  - Turnover: 30% (was 10%)
- **xG Base Scale:** Reduced from 0.32 to 0.18.
- **Goalkeeper:** `maxSaveThreshold` raised to 0.95, `saveWindowMultiplier` lowered to 1.2.

## Verification Results (1000 matches)

| Metric | Result |
| :--- | :--- |
| Avg Goals / Match | 3.12 |
| Avg Shots / Team | 13.86 |
| Draw Rate | 24.1% |
| Home Win Rate | 46.7% |

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes
Iterative tuning using Batch Simulator (4 iterations). Achieved targets for goals, shots, and draws. Fixed syntax error in `MatchSimulation.ts` during final cleanup.
